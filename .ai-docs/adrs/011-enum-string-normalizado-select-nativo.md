# ADR 011: Enum de strings normalizado y renderer select nativo

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Revisión:** 1 — correcciones de la revisión formal
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md),
  [`ADR-005`](./005-politica-dialecto-json-schema.md),
  [`ADR-007`](./007-resolucion-renderers-testers.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`D-008`](../roadmap/deferred-decisions.md)
- **Revisa parcialmente:** El catálogo de keywords de ADR-005 deja de
  clasificar `enum` como no soportada únicamente en campos `string` que
  satisfagan este contrato. `const` y `format` no cambian.

## 1. Contexto y problema

M1-M5 ya compilan campos primitivos a `FieldDefinition`, mantienen la
validación completa en un adaptador externo y resuelven renderers mediante
testers puntuados sobre definiciones normalizadas. D-008 agrupaba `enum`,
`const`, `format` y la deducción de varios controles visuales, aunque estas
capacidades no comparten la misma semántica.

En JSON Schema Draft 2020-12, `enum` es una assertion que acepta un valor cuando
es igual a uno de los elementos declarados. Sus elementos pueden ser de
cualquier tipo. `const` es otra assertion, equivalente semánticamente a un
`enum` de un solo valor, y `format` pertenece por defecto al vocabulario de
annotations. La presentación como select, radios u otro componente no forma
parte de esas reglas de validación.

El siguiente incremento debe demostrar el recorrido completo desde una
restricción normalizada hasta un renderer especializado sin introducir tipos
mixtos, null, composición, nuevos modos de estado ni validación dentro de la UI.

## 2. Decisión

### 2.1 Alcance de JSON Schema

El compilador soportará `enum` solamente en schemas de campo directos que
declaren `type: "string"`.

Para pertenecer al subconjunto soportado, `enum` deberá ser:

- un array no vacío;
- compuesto exclusivamente por strings;
- sin valores duplicados;
- interpretado en el orden declarado;
- comparado mediante igualdad exacta de strings, sin trim, case folding ni
  normalización Unicode.

Un `enum` de un solo string es válido. No se convertirá internamente en `const`
ni activará una presentación especial distinta.

Se reutilizarán los diagnósticos existentes:

- `enum` no array producirá `INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de la
  keyword, con `expected: 'array of unique strings'`;
- un array vacío producirá `INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de la
  keyword, con `expected: 'non-empty array of unique strings'`;
- un elemento no string producirá `INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de
  ese índice, con `expected: 'string'`;
- un duplicado producirá `INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de su
  segunda aparición, con `expected: 'unique string'`;
- `enum` en un campo `number`, `integer` o `boolean` producirá
  `INCOMPATIBLE_SCHEMA_KEYWORD` como error;
- `enum` en la raíz continuará produciendo `UNSUPPORTED_SCHEMA_KEYWORD`;
- `const` continuará produciendo `UNSUPPORTED_SCHEMA_KEYWORD`;
- `format` continuará produciendo `IGNORED_SCHEMA_KEYWORD` como warning según
  ADR-005.

Este subconjunto es más estricto que el vocabulario general de Draft 2020-12
porque necesita generar una lista de elecciones útil y determinista. Los enums
numéricos, booleanos, mixtos, con `null`, objetos o arrays permanecen fuera de
alcance.

### 2.2 Definición normalizada

El core añadirá el contrato público experimental:

```ts
export interface StringChoiceDefinition {
  readonly value: string;
  readonly label: string;
}
```

`StringFieldDefinition` incorporará:

```ts
readonly choices?: readonly StringChoiceDefinition[];
```

- `choices` ausente significa que el campo string no declara un `enum`
  soportado.
- `choices` presente será no vacío y conservará el orden del schema.
- Cada `value` será exactamente el string declarado en `enum`.
- Cada `label` será un texto fuente opaco y no blank para `TextResolver`.
- El array, cada choice y la definición completa serán inmutables.
- Renderers y testers consumirán `choices`; nunca recibirán el JSON Schema
  crudo.

No se duplicará la lista bajo `constraints`. En este modelo normalizado,
`choices` representa simultáneamente el conjunto permitido que interesa a la
UI y sus metadatos de presentación. El schema fuente seguirá siendo la entrada
autoritativa del validador externo.

En esta ADR, una string es no blank cuando `text.trim().length > 0`. Esta
comprobación no transforma el texto almacenado ni resuelto.

El compilador inspeccionará el array `enum` por índice mediante descriptores de
propiedad. Un índice ausente, sparse o accessor producirá
`INVALID_SCHEMA_KEYWORD_VALUE` sin ejecutar código del consumidor. Los valores
solo se leerán después de confirmar que son data properties propias.

`createControlledFormRuntime()` ampliará su validación de creación para una
`StringFieldDefinition` cuyo miembro propio `choices` esté presente:

- `choices` deberá ser un array propio, denso y no vacío;
- cada índice deberá contener una data property propia con un objeto choice;
- cada choice deberá tener data properties propias `value` y `label`;
- `value` será string y único dentro del campo;
- `label` será una string no blank;
- arrays, choices o miembros sparse/accessor serán inválidos y nunca se
  ejecutarán.

Una definición manual que incumpla estas reglas bloqueará la creación con
`INVALID_RUNTIME_OPTIONS`, `member: 'definition'`,
`expected: 'valid FormDefinition with string choices'` y
`reason: 'invalid-value'`. No se seleccionará silenciosamente el renderer string
genérico.

`applyOperation()` no recibe una definición y `applyFormOperation()` conservará
exactamente la forma mínima de PLAN-002: no leerá ni revalidará `choices`, porque
solo necesita paths y tipos básicos. Esta diferencia es deliberada: el runtime
es el límite que proyecta la definición hacia los adaptadores y renderers.

### 2.3 Labels en UI Schema

`FieldUiSchema` incorporará el metadato opcional:

```ts
readonly enumLabels?: Readonly<Record<string, string>>;
```

Las reglas serán:

- Las keys corresponden exactamente a valores string declarados en `enum`.
- Los valores son textos fuente opacos y no blank; pueden ser literales, claves
  de traducción u otros identificadores entendidos por `TextResolver`. Una
  string vacía o formada solo por whitespace producirá
  `INVALID_UI_SCHEMA_VALUE` con `expected: 'non-blank string'`.
- Si el valor de `enum` es no blank y no tiene entrada propia en `enumLabels`,
  su label fuente será el propio valor.
- Si el valor de dominio es blank y no tiene entrada propia, su label fuente
  será su literal JSON visible. Por ejemplo, el string vacío usará `""`
  (`U+0022 U+0022`) y un valor compuesto por espacios conservará esos espacios
  entre comillas. `TextResolver` podrá reemplazarlo usando el contexto de la
  choice.
- Una key propia que no corresponda a ningún valor producirá el warning
  `UNKNOWN_ENUM_LABEL` y se ignorará.
- Un `enumLabels` no objeto o un label que no sea string producirá
  `INVALID_UI_SCHEMA_VALUE`.
- `enumLabels` sin un `enum` string compatible producirá
  `INCOMPATIBLE_UI_OPTION` y se ignorará.
- La enumeración usará solo propiedades propias y no ejecutará accessors.

El orden pertenece siempre al `enum`; `enumLabels` no puede reordenar ni añadir
choices.

`UNKNOWN_ENUM_LABEL` tendrá `source: 'ui-schema'`, `severity: 'warning'`,
`dataPath: [fieldName]`, `documentPath: ['fields', fieldName, 'enumLabels',
labelKey]` y parámetros `{ field: fieldName, value: labelKey }`. Los demás
diagnósticos conservarán los contratos existentes y apuntarán al miembro o
elemento exacto que los origina. `INCOMPATIBLE_UI_OPTION` añadirá
`reason: 'missing-compatible-enum'` para este caso.

### 2.4 Resolución de textos

`FieldTextMember` añadirá el miembro `choice`. `TextResolutionContext` añadirá
una rama específica que incluya el choice original:

```ts
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'choice'
  | 'issue';

export type TextResolutionContext =
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: Exclude<FieldTextMember, 'choice' | 'issue'>;
      readonly choice?: never;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'choice';
      readonly choice: StringChoiceDefinition;
      readonly issue?: never;
    }
  | {
      readonly formId: string;
      readonly locale: string;
      readonly field: FieldDefinition;
      readonly member: 'issue';
      readonly choice?: never;
      readonly issue: ValidationIssue;
    };
```

El proyector Angular resolverá todos los labels cuando cree su snapshot de
textos y cuando cambie el locale. El renderer recibirá los textos ya resueltos;
no inyectará ni invocará directamente `TextResolver`.

`AngularFieldTextSnapshot` añadirá
`readonly choiceLabels: readonly string[]`. El array siempre existirá, estará
vacío para campos sin choices y mantendrá el mismo orden que
`field.choices`. Tanto el array como el snapshot continuarán siendo inmutables.

Un fallo aislado del resolver, un resultado no string o un resultado blank
conservará el label fuente no blank y producirá `TEXT_RESOLUTION_FAILED` con
`member: 'choice'`, el `choiceValue` afectado y `reason: 'exception'`,
`'non-string-result'` o `'blank-string-result'`, siguiendo la política existente
de aislamiento. Los demás miembros de texto conservarán su semántica actual y
podrán resolverse a una string vacía.

### 2.5 Propiedad de validación y estado

La ampliación no convierte al compilador, runtime, operaciones o renderer en
validadores de negocio:

- El compilador valida que el schema pertenece al subconjunto renderizable y
  normaliza choices.
- `SchemaValidator` continúa evaluando el schema fuente completo y produciendo
  issues normalizados.
- `applyOperation()` y `applyFormOperation()` continúan comprobando tipos y
  expectativas, pero no pertenencia al enum.
- El runtime no rechaza una intención string solo porque no figure en choices.
- La aplicación sigue siendo la única fuente de verdad para `value` y
  `baselineValue`.
- Ningún renderer seleccionará el primer elemento, aplicará defaults, corregirá
  o eliminará valores de forma automática.

Un valor externo ausente o un string que no pertenezca a choices se proyectará
como estado sin selección. El valor controlado permanecerá intacto y sus errores
se mostrarán conforme al snapshot producido por el validador.

### 2.6 Renderer Angular nativo

El paquete Angular incorporará un renderer nativo basado en `<select>` para
campos string con `choices`.

- Su tester devolverá rank `20` cuando `field.kind === 'string'` y exista una
  data property propia `choices` validada por el runtime.
- El renderer string genérico conservará rank `10`, por lo que seguirá siendo el
  fallback para strings sin choices.
- Ambos usarán priority `0`; las registrations de consumidor podrán aplicar las
  reglas de override de ADR-007.
- El built-in se incluirá mediante `provideSchemaEngineAngularNative()` y no
  creará un registry paralelo.
- Se añadirá `SchemaStringEnumRendererComponent` como componente Public +
  Experimental + Active desde el entry point Angular.

El `<select>` usará tokens internos por posición para el valor DOM y mapeará el
token al string de dominio al emitir. No utilizará el string de negocio como
protocolo interno; así el string vacío y cualquier contenido permitido siguen
siendo choices ordinarios.

El tester, el proyector de textos y el renderer leerán `choices` mediante su
descriptor propio; una propiedad heredada no es parte del contrato y no se
ejecutará. Tras la validación de creación, ningún consumidor Angular hará
fallback por acceso dinámico a la cadena de prototipos.

El renderer:

- conservará una opción centinela sin selección para estado missing o valor
  externo fuera del enum; será disabled para que no actúe como limpieza;
- usará `placeholder` como texto visible de esa opción cuando exista y una
  opción vacía cuando no exista;
- no emitirá al reconciliar, cambiar locale, recibir un valor externo o perder
  foco;
- emitirá la intención `setValue` con el string real solo tras una selección de
  usuario;
- no ofrecerá todavía una acción para volver a missing, que continúa en D-010;
- reutilizará label, description, hint, tooltip, issues, foco, blur e IDs
  accesibles de los renderers nativos existentes;
- mantendrá cualquier buffer de token como estado local de presentación y lo
  reconciliará desde el snapshot controlado.

No se añade renderer de radios, heurística por cantidad de choices ni opción de
UI Schema para elegir control. Un consumidor puede registrar un renderer propio
mediante la API existente.

### 2.7 Superficie pública y estabilidad

Los nuevos contratos transitivos del core, la extensión de textos y el
componente Angular serán Public + Experimental + Active conforme a ADR-009. No
se promoverá ninguna API a Stable y no se crearán entry points nuevos.

La implementación deberá actualizar package smoke tests y revisar el diff de
declaraciones de ambos paquetes. Esta ADR no modifica versiones, publicación ni
compatibilidad de peers.

## 3. Fuera de alcance

- `const` y cualquier comportamiento fixed, readonly, hidden o sin renderer.
- `format`, Format-Assertion y renderers especializados de fecha, email o URI.
- Enums de number, integer, boolean, null, objetos, arrays o tipos mixtos.
- `oneOf`, titles por subschema, composición y referencias.
- Radios, segmented controls, autocompletes, multiselect y heurísticas por
  cardinalidad.
- Limpiar un campo y volver a missing desde el select.
- Defaults automáticos, coercion, trim o transformaciones de valores.
- Validación Angular, Signal Forms schemas o sustitución de `SchemaValidator`.
- Cambios dinámicos de schema o `FormDefinition` durante la vida del runtime.

## 4. Consecuencias y trade-offs

### Positivas

- Valida el pipeline de especialización sin hacer que el renderer interprete
  JSON Schema.
- Conserva la propiedad controlada del estado y la validación reemplazable.
- Los labels son localizables y no obligan a usar los valores de dominio como
  texto visible.
- El orden, fallback y selección de renderer son deterministas.
- Los consumidores pueden reemplazar el select mediante ADR-007 sin ampliar el
  core con componentes.

### Negativas

- El primer soporte de enum no cubre números, booleanos ni listas mixtas
  admitidas por el estándar general.
- `StringChoiceDefinition` y la extensión de `TextResolutionContext` amplían la
  API pública experimental de ambos paquetes.
- Un campo opcional seleccionado no puede volver a missing mediante el built-in
  hasta resolver D-010.
- Un valor externo fuera del enum no puede representarse como una opción válida
  y se muestra sin selección hasta que la aplicación lo cambie.
- Mantener labels en UI Schema introduce una segunda fuente coordinada por
  valor, aunque no altera la semántica de validación.

## 5. Alternativas consideradas

### Soportar todos los tipos primitivos desde el inicio

Rechazado para el primer incremento porque exige resolver serialización DOM,
formatting localizado, igualdad numérica y semántica de boolean/missing antes de
validar el caso más común y pequeño.

### Usar directamente los valores de enum como values del DOM

Rechazado porque el DOM serializa options como strings y convertiría el valor
vacío en un caso ambiguo. Los tokens internos separan presentación y dominio.

### Deducir radios para enums pequeños

Rechazado porque la cardinalidad no determina por sí sola la presentación
correcta y añadiría una política visual no requerida. ADR-007 ya permite un
renderer custom.

### Obtener labels mediante `oneOf` + `const` + `title`

Rechazado para este incremento porque activaría composición y `const`, ambos
fuera del subconjunto actual. `enumLabels` mantiene la presentación en UI
Schema.

### Hacer que el runtime rechace valores fuera del enum

Rechazado porque duplicaría el validador externo, impediría representar datos
controlados temporalmente inválidos y cambiaría las operaciones estrictas de
tipo en operaciones de validación de negocio.

### Tratar `format` como hint de renderer en el mismo incremento

Rechazado porque contradiría la clasificación aceptada de ADR-005 y mezclaría
annotation, assertion y presentación sin una política de formatos soportados.

## 6. Verificación requerida por el futuro plan

El plan de implementación deberá incluir como mínimo:

- fixtures válidos para enum con labels completos, parciales y valores string
  vacío o formados solo por whitespace;
- fixtures de error para enum vacío, valor no array, elemento no string,
  duplicado y uso en un tipo incompatible;
- fixtures de UI Schema para label desconocido, valor de label inválido y
  `enumLabels` incompatible;
- tests de inmutabilidad y orden de `choices`;
- tests del compilador y runtime para arrays densos, sparse, accessors, choices
  manuales malformadas, duplicados y labels blank sin ejecutar getters;
- tests de `TextResolver` para choices, cambio de locale, excepción y resultado
  no string o blank, confirmando el fallback fuente no blank;
- tests del resolver que demuestren rank `20`, fallback string rank `10` y
  overrides de consumidor;
- tests del select para missing, string vacío, valor externo fuera del enum,
  reconciliación controlada, foco, blur, issues y accesibilidad;
- tests que demuestren que render, locale y reconciliación no emiten
  operaciones;
- tests de paquete y diff de declaraciones para todos los nuevos exports;
- confirmación de que el core sigue sin Angular, RxJS, DOM ni dependencias de
  runtime.

## 7. Criterios de aceptación de la ADR

Antes de aceptar esta propuesta debe confirmarse:

1. Que string-only es el incremento mínimo adecuado y no cierra la evolución a
   otros tipos.
2. Que `choices` y `enumLabels` separan correctamente semántica normalizada y
   presentación.
3. Que los diagnósticos son suficientes y deterministas.
4. Que `SchemaValidator` conserva en exclusiva la validación de datos.
5. Que el select respeta estado controlado, missing y valores externos
   inválidos sin autocorrección.
6. Que el nuevo contexto de textos permite localización e aislamiento de
   errores sin acoplar renderers al resolver.
7. Que el cambio de API pública y el renderer especializado cumplen ADR-007 y
   ADR-009.
8. Que `const`, `format`, radios y limpieza permanecen expresamente fuera de
   alcance.

## 8. Criterios para revisar la decisión

Revisar cuando exista un caso real para enums no string, labels procedentes de
schemas compuestos, selección múltiple, controles alternativos, limpieza a
missing o una política independiente para `const` o `format`.

## 9. Referencias

- [JSON Schema Validation Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-validation)
- [JSON Schema enum reference](https://json-schema.org/understanding-json-schema/reference/enum)
- [HTML select element](https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element)

## 10. Resultado de la revisión formal

- **Fecha de revisión:** 13 de julio de 2026
- **Resultado:** La dirección general supera la revisión, pero son necesarias
  tres correcciones antes de aceptar la ADR.
- **Estado tras la revisión:** Proposed, sin autorizar cambios en SPEC-001,
  ADR-005 ni implementación.

Las ocho áreas fueron contrastadas con Draft 2020-12, SPEC-001, ADR-005/007/009,
los contratos y validadores estructurales del core, la proyección de textos, el
resolver Angular, los renderers nativos y D-010.

### Corrección 1: exclusividad de `TextResolutionContext`

La rama común propuesta elimina el `issue?: never` que protege el contrato
actual y las nuevas ramas no excluyen explícitamente el miembro alternativo.
La unión revisada deberá conservar discriminación estructural completa:

- la rama común tendrá `choice?: never` e `issue?: never`;
- la rama `choice` tendrá `choice: StringChoiceDefinition` e `issue?: never`;
- la rama `issue` tendrá `issue: ValidationIssue` y `choice?: never`.

### Corrección 2: validación segura de `choices`

La ADR define invariantes para el output del compilador, pero no decide qué
ocurre cuando un consumidor entrega manualmente una `FormDefinition` con
`choices` presente y malformado. El runtime valida actualmente solo la forma
mínima necesaria, y PLAN-002 prohíbe a las operaciones leer miembros que no
necesitan.

La revisión deberá asignar la comprobación al límite que consume choices, sin
ampliar silenciosamente la validación mínima de `applyFormOperation()`. Deberá
definir diagnóstico, fallback y pruebas para arrays vacíos, elementos
malformados, duplicados, sparse arrays y accessors, sin ejecutar código del
consumidor ni caer accidentalmente al renderer string genérico.

### Corrección 3: nombre accesible de cada option

El fallback `label = value` produce un option sin texto cuando el enum contiene
el string vacío; además, un `enumLabels` o `TextResolver` puede devolver una
string vacía. Los tokens DOM eliminan la ambigüedad del valor, pero no la
ambigüedad visual o accesible entre una choice vacía y el centinela.

Antes de aceptar, la ADR deberá exigir un label fuente no vacío para toda
choice, definir el tratamiento del valor `""`, y considerar una resolución
vacía como fallo aislado con diagnóstico y fallback no vacío. El centinela
seguirá siendo disabled y no representará una choice de dominio.

### Áreas sin hallazgos

- El alcance string-only es un incremento pequeño y evolutivo.
- `SchemaValidator` conserva la validación de datos y el core no duplica
  assertions.
- Missing, valores externos inválidos y reconciliación respetan el estado
  controlado.
- Los ranks `20`/`10`, overrides y entry points respetan ADR-007/009.
- `const`, `format`, otros tipos, radios y limpieza permanecen fuera de alcance.
- La revisión parcial de ADR-005 queda condicionada a una futura aceptación y
  deberá sincronizarse entonces con SPEC-001 y el registro de decisiones.

## 11. Revisión 1 y repetición de las comprobaciones

- **Fecha:** 13 de julio de 2026
- **Resultado:** Las tres correcciones fueron incorporadas y la repetición de
  las ocho áreas no encontró problemas pendientes.
- **Estado:** Proposed hasta una decisión explícita de aceptación.

Correcciones aplicadas:

1. `TextResolutionContext` conserva ramas mutuamente exclusivas mediante
   miembros `never` para `choice` e `issue`.
2. El compilador valida `enum` mediante descriptores y el runtime valida choices
   manuales antes de proyectar la definición; PLAN-002 y
   `applyFormOperation()` conservan su forma mínima sin leer choices.
3. Todo label fuente y resuelto de choice debe ser no blank. Un valor de dominio
   blank usa su literal JSON visible como fallback (`""` para el string vacío);
   una resolución blank queda aislada, diagnosticada y vuelve a ese source
   seguro.

Resultado de las ocho áreas:

1. **Alcance:** Pasa. String-only es útil, acotado y no impide otros tipos
   futuros.
2. **Normalización y presentación:** Pasa. `choices` conserva valores y orden;
   `enumLabels` aporta textos opcionales sin alterar validación.
3. **Diagnósticos:** Pasa. Schema, UI Schema, runtime y texto tienen owner,
   código, path o parámetros y fallback deterministas para los casos aprobados.
4. **Validación:** Pasa. `SchemaValidator` sigue siendo el único validador de
   datos; las demás comprobaciones son estructurales.
5. **Estado controlado:** Pasa. Missing, valores externos inválidos, locale y
   reconciliación no mutan ni corrigen el modelo.
6. **Textos y accesibilidad:** Pasa. Contextos exclusivos, labels no blank,
   fallback del string vacío y aislamiento del resolver quedan definidos.
7. **Renderer y API:** Pasa. Ranks, overrides, entry points y clasificación
   Experimental cumplen ADR-007/009.
8. **Exclusiones:** Pasa. `const`, `format`, tipos no string, radios y limpieza
   continúan expresamente aplazados.

La revisión repetida no acepta la ADR, no promueve D-008 y no modifica SPEC-001,
ADR-005 ni implementación. Esas acciones requieren una decisión explícita
posterior.

## 12. Resultado de aceptación

- **Fecha:** 13 de julio de 2026
- **Resultado:** Accepted, revision 1.
- **Revisión:** Las ocho áreas de aceptación se repitieron después de aplicar
  las tres correcciones y no quedó ningún hallazgo abierto.

La aceptación revisa de forma explícita el catálogo de ADR-005 únicamente para
el subconjunto de `enum` definido aquí y promueve la parte correspondiente de
D-008. Autoriza sincronizar SPEC-001 y preparar un plan de implementación, pero
no autoriza por sí sola cambios en paquetes, contratos ejecutables, versiones o
publicación. `const`, `format`, enums no string, radios y limpieza a missing
permanecen diferidos.
