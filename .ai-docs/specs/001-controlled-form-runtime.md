# SPEC-001: Controlled Form Runtime

- **Estado:** Draft
- **Versión:** 0.1.6
- **Fecha:** 13 de julio de 2026
- **Ámbito:** Primer prototipo de `@rabassoft/schema-engine`
- **Documento relacionado:** [`../roadmap/deferred-decisions.md`](../roadmap/deferred-decisions.md)
- **Plan de implementación aprobado:** [`PLAN-001`](../plans/001-compiler-only-implementation.md)
- **Plan de operaciones aprobado:** [`PLAN-002`](../plans/002-root-immutable-operations.md)

## 1. Propósito

Esta especificación define el comportamiento del primer runtime de formularios dinámicos de Rabassoft Schema Engine.

El primer objetivo del ecosistema es generar formularios controlados a partir de **JSON Schema + UI Schema**, manteniendo la lógica de estado y validación independiente de Angular, React, Vue o cualquier otro framework.

La primera implementación de referencia utilizará Angular y controles HTML nativos, pero los contratos definidos en este documento deberán poder implementarse en otros frameworks sin reproducir la lógica del motor.

## 2. Objetivos

La primera versión deberá:

1. Compilar un subconjunto explícito de JSON Schema y UI Schema a una definición neutral.
2. Renderizar un formulario para un objeto raíz con campos primitivos.
3. Mantener un flujo de datos controlado y unidireccional.
4. Emitir operaciones incrementales en lugar de mutar el modelo de la aplicación.
5. Gestionar estado técnico de interacción y validación.
6. Integrar validadores, traducción y renderers mediante contratos sustituibles.
7. Ser utilizable con Angular Signals sin introducir Angular en el core.
8. Ofrecer diagnósticos tipados y evitar excepciones para errores esperables.

## 3. No objetivos de la primera versión

Quedan fuera del alcance inicial:

- Objetos anidados y arrays.
- `$ref`, `enum`, `const`, `format`, `allOf`, `anyOf`, `oneOf`, `if`, `then` y `else`.
- Layouts complejos, secciones, pestañas o wizards declarados en UI Schema.
- Validación asíncrona.
- Actualización dinámica de la definición compilada.
- Modo autónomo o no controlado.
- Proyección optimista de cambios.
- Persistencia, envío, llamadas HTTP o estados de guardado.
- Angular Material, PrimeNG, Tailwind u otros sistemas visuales.
- Editor visual, colaboración, auditoría, undo/redo o licenciamiento.

Las decisiones aplazadas se registran en [`deferred-decisions.md`](../roadmap/deferred-decisions.md).

## 4. Terminología

### 4.1 Aplicación consumidora

Aplicación que proporciona el esquema, los datos, la persistencia y la integración con su framework o store.

### 4.2 Compilador

Componente que transforma JSON Schema + UI Schema en una `FormDefinition` normalizada.

### 4.3 Runtime

Motor agnóstico que recibe datos controlados, calcula el estado del formulario, gestiona interacciones y emite operaciones.

### 4.4 Adaptador de framework

Capa que proyecta los contratos neutrales del runtime a las primitivas de un framework. En Angular, convertirá snapshots a Signals y operaciones a outputs.

### 4.5 Renderer

Componente visual responsable de representar un tipo de campo y comunicar intenciones al runtime.

### 4.6 Valor controlado

Modelo de negocio cuya fuente de verdad pertenece a la aplicación consumidora.

### 4.7 Baseline

Valor de referencia utilizado para calcular si los campos gestionados por el formulario están modificados.

## 5. Contexto del sistema

```mermaid
flowchart TD
    APP[Aplicación consumidora] -->|JSON Schema + UI Schema| COMP[Compiler]
    COMP -->|FormDefinition| RUNTIME[Controlled Form Runtime]
    APP -->|value + baselineValue + locale| RUNTIME
    RUNTIME -->|snapshots inmutables| ADAPTER[Adaptador de framework]
    ADAPTER --> RENDERERS[Renderers HTML]
    RENDERERS -->|intenciones| RUNTIME
    RUNTIME -->|FormOperation| APP
    APP -->|applyFormOperation + nuevo value| RUNTIME
    VALIDATOR[Adaptador de validación] --> RUNTIME
    TEXT[TextResolver] --> ADAPTER
```

## 6. Distribución inicial de responsabilidades

### 6.1 Aplicación consumidora

La aplicación será responsable de:

- Ser la única fuente de verdad del modelo de negocio.
- Proporcionar `value` y `baselineValue` de forma inmutable.
- Aplicar o rechazar las operaciones emitidas.
- Persistir datos y gestionar el envío.
- Definir scopes de validación cuando utilice pasos o secciones.
- Proporcionar o heredar el locale.
- Elegir integraciones de validación, traducción y presentación.

### 6.2 Core

El core será responsable de:

- Tipos, contratos y utilidades puras.
- Compilación a `FormDefinition`.
- Runtime controlado.
- Construcción y emisión de operaciones.
- Aplicación estricta de operaciones.
- Snapshots, interacción, dirty y validación.
- Diagnósticos neutrales.

El core no dependerá de Angular, React, Vue, RxJS, DOM, `window` ni una librería visual.

### 6.3 Adaptador Angular

El adaptador Angular será responsable de:

- Obtener por defecto `LOCALE_ID`.
- Proyectar snapshots a Signals.
- Exponer operaciones mediante outputs o callbacks idiomáticos.
- Crear y destruir el runtime con el ciclo de vida del componente.
- Generar identificadores DOM a partir de `formId` y la clave lógica del campo.

### 6.4 Renderers HTML

Los renderers HTML serán responsables de:

- Presentar campos normalizados.
- Gestionar estados visuales temporales, como texto numérico incompleto.
- Notificar foco, blur e intenciones de cambio.
- Mostrar errores según el snapshot y la política visual.
- No interpretar directamente JSON Schema.

## 7. Subconjunto inicial de metadatos

### 7.1 JSON Schema soportado

La raíz deberá declarar:

- `type: "object"`
- `properties`

La raíz podrá declarar:

- `required`
- `title`
- `description`

La ausencia de `required` equivale a no declarar campos obligatorios. `title` y
`description` son metadatos opcionales. `properties` puede estar vacío.

Los campos deberán declarar `type` explícitamente.

#### String

- `type: "string"`
- `title`
- `description`
- `default`
- `minLength`
- `maxLength`
- `pattern`

#### Number e integer

- `type: "number" | "integer"`
- `title`
- `description`
- `default`
- `minimum`
- `maximum`
- `multipleOf`

#### Boolean

- `type: "boolean"`
- `title`
- `description`
- `default`

El dialecto de referencia y la política de compatibilidad están definidos en [`ADR-005`](../adrs/005-politica-dialecto-json-schema.md).

### 7.2 UI Schema inicial

El UI Schema solo describirá presentación:

```ts
export interface UiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, FieldUiSchema>>;
}

export interface FieldUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
  readonly options?: {
    readonly decimalPlaces?: number;
    readonly showTrailingZeros?: boolean;
  };
}
```

Reglas:

- `order` coloca primero los campos indicados.
- Los campos omitidos se añaden al final respetando el orden de `properties`.
- Duplicados y campos desconocidos generan warnings no bloqueantes.
- `hint` representa ayuda breve y persistente próxima al control.
- `tooltip` representa información complementaria bajo demanda; el renderer deberá exponerla de forma accesible y no depender exclusivamente del hover.
- `placeholder` representa una sugerencia o ejemplo temporal dentro del control y nunca sustituirá a `label`.
- `placeholder` se admitirá inicialmente en campos `string`, `number` e `integer`. Su uso en un campo no compatible generará un warning no bloqueante.
- `decimalPlaces` y `showTrailingZeros` son exclusivamente visuales.
- La precisión válida continúa dependiendo de `multipleOf`.

### 7.3 Precedencia y semántica de textos

Para etiqueta y descripción:

1. UI Schema.
2. JSON Schema.
3. Nombre de la propiedad como fallback de etiqueta.

`hint`, `tooltip` y `placeholder` pertenecen exclusivamente al UI Schema en esta primera versión y no tendrán fallback implícito.

Cada texto tendrá una responsabilidad diferenciada:

- `label`: identifica el campo y deberá permanecer visible o accesible para tecnologías de asistencia.
- `description`: explica el significado general del campo.
- `hint`: ofrece ayuda breve y visible durante la edición.
- `tooltip`: aporta información adicional bajo demanda.
- `placeholder`: muestra un ejemplo o formato esperado mientras el control está vacío.

Los textos son cadenas opacas. Un `TextResolver` decidirá si representan texto literal, clave de traducción u otro identificador.

## 8. Compilación y definición normalizada

Los adaptadores y renderers no interpretarán directamente JSON Schema. El compilador generará una definición neutral.

```ts
export interface FormDefinition {
  readonly fields: readonly FieldDefinition[];
}

export interface BaseFieldDefinition {
  readonly key: string;
  readonly name: string;
  readonly path: DataPath;
  readonly required: boolean;
  readonly label: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly placeholder?: string;
}

export type FieldDefinition =
  StringFieldDefinition | NumberFieldDefinition | BooleanFieldDefinition;

export interface StringFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'string';
  readonly constraints: {
    readonly minLength?: number;
    readonly maxLength?: number;
    readonly pattern?: string;
  };
}

export interface NumberFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'number';
  readonly numericType: 'number' | 'integer';
  readonly constraints: {
    readonly minimum?: number;
    readonly maximum?: number;
    readonly multipleOf?: number;
  };
  readonly ui: {
    readonly decimalPlaces?: number;
    readonly showTrailingZeros?: boolean;
  };
}

export interface BooleanFieldDefinition extends BaseFieldDefinition {
  readonly kind: 'boolean';
}
```

`DataPath` será la identidad canónica del campo. `key` será una clave lógica determinista derivada de la ruta, pero no un ID DOM definitivo.

```ts
export type PathSegment = string | number;
export type DataPath = readonly PathSegment[];
```

La definición será inmutable durante la vida del runtime. Un cambio de JSON Schema o UI Schema requerirá recompilar y crear un runtime nuevo.

### 8.1 Entrada de compilación

```ts
export interface CompileFormDefinitionInput {
  readonly schema: unknown;
  readonly uiSchema?: unknown;
}

export function compileFormDefinition(
  input: CompileFormDefinitionInput,
): CompileFormResult;
```

`uiSchema` ausente equivale a un UI Schema vacío. Las entradas se aceptan como
`unknown` para que los errores esperables de configuración se expresen mediante
diagnósticos y no mediante excepciones.

### 8.2 Resultado de compilación

```ts
export type CompileFormResult =
  | {
      readonly success: true;
      readonly definition: FormDefinition;
      readonly diagnostics: readonly Diagnostic[];
    }
  | {
      readonly success: false;
      readonly diagnostics: readonly Diagnostic[];
    };
```

Los errores normales de configuración no lanzarán excepciones.

PLAN-001 define el pipeline determinista, la validación estructural, la
normalización de UI Schema, la inmutabilidad observable, los parámetros de
diagnóstico y los fixtures obligatorios para el primer incremento del
compilador. Cualquier error produce `success: false` sin definición parcial;
un resultado con solo warnings puede incluir una definición válida.

## 9. Modelo controlado

La primera versión funcionará exclusivamente en modo controlado estricto.

```mermaid
sequenceDiagram
    participant U as Usuario
    participant R as Renderer
    participant RT as Runtime
    participant A as Aplicación

    U->>R: Modifica un campo
    R->>RT: requestSetValue(path, value)
    RT->>A: Emite FormOperation
    A->>A: applyFormOperation()
    A->>RT: updateExternalState({ value })
    RT->>R: Publica nuevo snapshot
```

Reglas:

- El runtime no modificará internamente el modelo controlado.
- No mostrará definitivamente un cambio hasta que la aplicación proporcione el nuevo `value`.
- Recibir un valor externo nunca emitirá una operación de vuelta.
- No existirá proyección optimista en la primera versión.

## 10. Valor, baseline y dirty

La aplicación proporcionará:

```ts
export interface ControlledExternalState<TData extends object> {
  readonly value: Readonly<TData>;
  readonly baselineValue: Readonly<TData>;
  readonly locale: string;
}
```

El runtime calculará `dirty` comparando los campos gestionados por `FormDefinition` entre `value` y `baselineValue` mediante `Object.is` para los valores primitivos iniciales.

Las propiedades no definidas por el formulario:

- Se preservarán.
- No se renderizarán.
- No participarán en `dirty`.

Actualizar el baseline no reiniciará `touched`, foco ni visibilidad de errores.

## 11. Operaciones incrementales

### 11.1 Expectativas

```ts
export type OperationExpectation =
  | { readonly kind: 'missing' }
  | { readonly kind: 'value'; readonly value: unknown };
```

### 11.2 Metadatos

```ts
export interface FormOperationMetadata {
  readonly id: number;
  readonly formId: string;
}
```

El identificador comenzará en `1` y será secuencial por instancia de runtime.

### 11.3 Set value

```ts
export interface SetValueOperation {
  readonly type: 'set-value';
  readonly metadata: FormOperationMetadata;
  readonly path: DataPath;
  readonly expected: OperationExpectation;
  readonly value: unknown;
  readonly source: 'user';
}
```

### 11.4 Remove value

```ts
export interface RemoveValueOperation {
  readonly type: 'remove-value';
  readonly metadata: FormOperationMetadata;
  readonly path: DataPath;
  readonly expected: {
    readonly kind: 'value';
    readonly value: unknown;
  };
  readonly source: 'user';
}
```

```ts
export type FormOperation = SetValueOperation | RemoveValueOperation;
```

### 11.5 Reglas estrictas

- Las rutas se representarán mediante arrays de segmentos.
- `DataPath` puede representar la raíz mediante `[]`, pero las utilidades de M2
  aceptarán únicamente propiedades raíz mediante un path `[fieldName]` con un
  solo segmento string.
- M2 rechazará `[]`, segmentos numéricos y paths con más de un segmento.
- `set-value` podrá crear únicamente una propiedad raíz.
- Los paths profundos, contenedores intermedios, objetos anidados y arrays
  permanecen aplazados.
- `remove-value` exige que la propiedad final exista.
- La expectativa se comprobará mediante `Object.is`.
- Una discrepancia producirá `STALE_OPERATION`.
- El runtime no emitirá una operación si la intención no produce un cambio efectivo.

### 11.6 Aplicación de operaciones

El core expondrá dos niveles:

```ts
applyOperation(currentValue, operation);
applyFormOperation(definition, currentValue, operation);
```

- `applyOperation` será una utilidad estructural avanzada.
- `applyFormOperation` será la API recomendada.
- `applyFormOperation` verificará que la ruta pertenece al formulario y que el valor es compatible con el tipo básico.
- Las restricciones de negocio como `minimum` o `pattern` serán responsabilidad del validador.
- Ambas utilidades serán puras e inmutables y conservarán las ramas no afectadas.

El resultado de ambas utilidades será:

```ts
export type ApplyOperationResult<TData extends object> =
  | {
      readonly success: true;
      readonly value: Readonly<TData>;
      readonly changed: boolean;
      readonly diagnostics: readonly [];
    }
  | {
      readonly success: false;
      readonly value: Readonly<TData>;
      readonly changed: false;
      readonly diagnostics: readonly Diagnostic[];
    };
```

En caso de error, `value` conservará exactamente la referencia de entrada. Una
operación válida sin efecto devolverá `success: true`, `changed: false`, la
misma referencia y ningún diagnóstico.

## 12. Intenciones del renderer

Los renderers no construirán operaciones directamente.

```ts
runtime.requestSetValue(['age'], 49);
runtime.requestRemoveValue(['age']);
```

El runtime utilizará el último estado confirmado para construir la expectativa y emitir la operación completa.

## 13. Estado de interacción

El runtime gestionará:

- `touched`
- `focused`
- visibilidad forzada de errores

El valor y el baseline continuarán controlados por la aplicación.

Reglas de foco:

- Solo puede existir un campo enfocado por runtime.
- `focus(path)` actualiza el campo activo.
- `blur(path)` solo actúa si el campo estaba enfocado.
- Un blur válido establece `focused: false` y `touched: true`.
- `resetTouched(scope?)` solo reinicia `touched`.

`dirty` nunca se almacenará como una transición de interacción; será un estado derivado.

## 14. Validación

### 14.1 Puerto neutral

El core no implementará su propio validador JSON Schema.

```ts
export interface SchemaValidator {
  validate(schema: unknown, value: unknown): ValidationResult;
}
```

La primera integración oficial se publicará en un paquete sustituible, previsiblemente `@rabassoft/schema-engine-validator-ajv`.

### 14.2 Issues normalizados

```ts
export interface ValidationIssue {
  readonly code: string;
  readonly path: DataPath;
  readonly keyword?: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly fallbackMessage?: string;
}
```

Reglas:

- Los adaptadores normalizarán los errores al campo más específico posible.
- `path: []` se reservará para errores globales.
- El runtime conservará todos los issues de cada campo.
- La capa visual decidirá si muestra el primero, todos o una representación personalizada.
- `code`, `path` y `parameters` serán canónicos; `fallbackMessage` será auxiliar.

### 14.3 Ciclo inicial

- La validación será síncrona.
- Se recalculará cuando cambie la referencia de `value`.
- Un dato inválido no impedirá crear el runtime.
- Una raíz estructuralmente incompatible sí impedirá crearlo.
- Inicialmente se validará el modelo completo y se filtrarán los issues para scopes parciales.

## 15. Visibilidad de errores

```ts
export type ValidationVisibility = 'touched' | 'all';
```

Por defecto se utilizará `touched`.

- La validez real siempre estará calculada.
- `touched` representa interacción, no una política visual.
- Mostrar todos los errores no marcará los campos como tocados.
- La aplicación podrá cambiar la política dinámicamente.

## 16. Scopes de formulario

Los scopes serán definidos por la aplicación y no formarán parte del UI Schema inicial.

```ts
export interface FormScope {
  readonly id: string;
  readonly paths: readonly DataPath[];
  readonly includeGlobalIssues?: boolean;
}
```

El runtime permitirá:

```ts
runtime.getValidationSnapshot(scope);
runtime.showValidationErrors(scope);
runtime.hideValidationErrors(scope.id);
runtime.resetTouched(scope);
```

Reglas:

- No será necesario registrar scopes previamente.
- Las rutas desconocidas generarán warnings no bloqueantes y se ignorarán.
- Los scopes podrán solaparse.
- Ocultar un scope no ocultará errores mantenidos visibles por otro scope.
- Un scope puede representar un paso, pestaña, sección o cualquier agrupación de la aplicación.

### 16.1 Persistencia incremental y baseline

El core ofrecerá una utilidad pura:

```ts
commitScopeToBaseline(baselineValue, currentValue, scope);
```

Esta utilidad copiará al baseline únicamente las rutas válidas del scope. Guardar un scope no afectará al estado dirty del resto del formulario.

## 17. Campos ausentes y valores vacíos

La ausencia de una propiedad se distinguirá de valores explícitos:

```text
{} ≠ { active: false }
{} ≠ { name: "" }
{} ≠ { age: 0 }
```

Representación inicial:

- String ausente: control visual vacío.
- Number ausente: control visual vacío.
- Boolean ausente: checkbox desmarcado.

El runtime no introducirá valores automáticamente al renderizar.

Reglas al vaciar:

- String vacío: `set-value` con `""`.
- Boolean desmarcado: `set-value` con `false`.
- Number vacío: `remove-value`.
- `undefined` no formará parte del modelo.
- `null` solo será válido cuando una futura ampliación del esquema lo permita explícitamente.

Los booleanos iniciales serán binarios. Un booleano ausente se mostrará desmarcado, pero al interactuar pasará a existir con `true` o `false`.

## 18. Defaults

Los defaults no se aplicarán silenciosamente al renderizar.

El core proporcionará una utilidad explícita y pura:

```ts
applySchemaDefaults(schema, value);
```

La aplicación decidirá cuándo utilizarla, por ejemplo al crear una entidad nueva.

## 19. Localización e internacionalización

### 19.1 Locale

- La aplicación será la fuente predeterminada del locale.
- Angular lo heredará normalmente de `LOCALE_ID`.
- Un formulario podrá sobrescribirlo explícitamente.
- El locale podrá cambiar durante la vida del runtime.
- El modelo conservará números canónicos de JavaScript.
- Cambiar el locale no emitirá operaciones ni alterará dirty, touched o validación.

Los campos sin foco se reformatearán inmediatamente. El campo numérico activo conservará su texto temporal y aplicará el nuevo locale al perder el foco.

### 19.2 Resolución de textos

```ts
export interface TextResolver {
  resolve(text: string, context: TextResolutionContext): string;
}
```

La implementación por defecto devolverá el texto sin modificar. Cambiar el locale volverá a resolver etiquetas, descripciones, hints, tooltips, placeholders y mensajes.

## 20. Comportamiento de los renderers iniciales

### 20.1 String

- Emitirá una intención en cada modificación.
- Conservará exactamente el texto introducido.
- No aplicará trim, mayúsculas ni transformaciones implícitas.
- Mostrará `placeholder` únicamente mientras el control esté vacío y sin utilizarlo como sustituto de la etiqueta.
- Debounce y persistencia serán responsabilidad de la aplicación.

### 20.2 Number e integer

- Podrá mostrar un `placeholder` localizado o resuelto por `TextResolver` mientras el control esté vacío.
- Utilizará una representación textual temporal mientras tenga foco.
- Permitirá estados intermedios como `-`, `12,` o `0.` sin enviarlos al modelo.
- Emitirá únicamente cuando el texto pueda interpretarse como número válido.
- Aplicará `decimalPlaces` al perder el foco, no en cada pulsación.
- Si el texto no es convertible al perder el foco, lo descartará y restaurará el último valor confirmado.
- El parser respetará el locale de la aplicación.
- `decimalPlaces` nunca redondeará ni validará el modelo.

### 20.3 Boolean

- Se representará inicialmente mediante un control binario.
- Ausente se verá desmarcado.
- Marcar emitirá `true`.
- Desmarcar emitirá `false`.
- No se restaurará automáticamente el estado ausente.

## 21. Runtime y snapshots

### 21.1 Creación

```ts
export interface ControlledFormRuntimeOptions<TData extends object> {
  readonly formId: string;
  readonly definition: FormDefinition;
  readonly value: Readonly<TData>;
  readonly baselineValue: Readonly<TData>;
  readonly locale: string;
  readonly validator: SchemaValidator;
  readonly textResolver: TextResolver;
  readonly validationVisibility?: ValidationVisibility;
}
```

`formId` será obligatorio y distinguirá instancias visuales de una misma definición.

### 21.2 Snapshot público

```ts
export interface FormRuntimeSnapshot<TData extends object> {
  readonly value: Readonly<TData>;
  readonly locale: string;
  readonly valid: boolean;
  readonly dirty: boolean;
  readonly validationVisibility: ValidationVisibility;
  readonly fields: readonly FieldRuntimeSnapshot[];
  readonly globalIssues: readonly ValidationIssue[];
}

export interface FieldRuntimeSnapshot {
  readonly key: string;
  readonly path: DataPath;
  readonly presence:
    | { readonly kind: 'missing' }
    | { readonly kind: 'value'; readonly value: unknown };
  readonly dirty: boolean;
  readonly touched: boolean;
  readonly focused: boolean;
  readonly valid: boolean;
  readonly issues: readonly ValidationIssue[];
  readonly showIssues: boolean;
}
```

Los snapshots usarán arrays ordenados conforme a `FormDefinition`. El runtime ofrecerá `getFieldSnapshot(path)` para búsquedas.

### 21.3 Reactividad neutral

```ts
export interface FormRuntime<TData extends object> {
  getSnapshot(): FormRuntimeSnapshot<TData>;
  subscribe(listener: SnapshotListener<TData>): Unsubscribe;
  subscribeOperations(listener: OperationListener): Unsubscribe;
}
```

- `getSnapshot()` devolverá el estado actual de forma síncrona.
- `subscribe()` solo notificará cambios futuros.
- Las operaciones utilizarán un canal separado.
- La emisión de operaciones será síncrona y ordenada.
- El fallo de un listener no impedirá notificar a los demás.

### 21.4 Structural sharing

- El snapshot raíz cambiará cuando exista una modificación.
- Los snapshots de campos no afectados conservarán su referencia.
- No se garantiza estabilidad de referencias más allá de una actualización concreta.

## 22. Actualizaciones externas

```ts
export interface ExternalStateUpdate<TData extends object> {
  readonly value?: Readonly<TData>;
  readonly baselineValue?: Readonly<TData>;
  readonly locale?: string;
}
```

`updateExternalState()`:

- Admitirá actualizaciones parciales.
- Será atómico.
- Validará una sola vez por llamada.
- Emitirá como máximo un snapshot.
- No emitirá operaciones.
- Detectará cambios de entrada mediante identidad de referencia.
- No realizará comparaciones profundas.
- Reconciliará los campos gestionados para preservar structural sharing.

La aplicación deberá realizar actualizaciones inmutables. El runtime no clonará profundamente ni congelará los valores externos.

## 23. Resultados de acciones

```ts
export interface RuntimeActionResult {
  readonly success: boolean;
  readonly effects: {
    readonly snapshotChanged: boolean;
    readonly operationEmitted: boolean;
  };
  readonly diagnostics: readonly Diagnostic[];
}
```

Las acciones públicas susceptibles de fallo devolverán este resultado. Los diagnósticos de acción serán efímeros y no se almacenarán en el snapshot.

## 24. Diagnósticos

```ts
export type DocumentPath = readonly (string | number)[];

export interface Diagnostic {
  readonly code: string;
  readonly severity: 'warning' | 'error';
  readonly source: 'schema' | 'ui-schema' | 'runtime';
  readonly dataPath?: DataPath;
  readonly documentPath?: DocumentPath;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly fallbackMessage?: string;
}
```

Política:

- Los warnings no bloquearán cuando exista una alternativa segura.
- Los errores bloqueantes impedirán crear la definición o ejecutar la acción.
- Se recopilarán todos los diagnósticos independientes posibles.
- Se detendrá el análisis de una rama cuando continuar solo genere errores en cascada.
- El core no escribirá directamente en consola.
- Las excepciones se reservarán para fallos internos inesperados.

El primer incremento del compilador utilizará estos códigos normativos:

| Código                         | Severidad | Fuente      |
| ------------------------------ | --------- | ----------- |
| `MISSING_SCHEMA_DIALECT`       | `warning` | `schema`    |
| `INVALID_SCHEMA_DIALECT`       | `error`   | `schema`    |
| `UNSUPPORTED_SCHEMA_DIALECT`   | `error`   | `schema`    |
| `UNSUPPORTED_SCHEMA_KEYWORD`   | `error`   | `schema`    |
| `IGNORED_SCHEMA_KEYWORD`       | `warning` | `schema`    |
| `UNKNOWN_SCHEMA_KEYWORD`       | `warning` | `schema`    |
| `INVALID_COMPILER_INPUT`       | `error`   | `schema`    |
| `ROOT_SCHEMA_MUST_BE_OBJECT`   | `error`   | `schema`    |
| `ROOT_TYPE_MUST_BE_OBJECT`     | `error`   | `schema`    |
| `MISSING_SCHEMA_PROPERTIES`    | `error`   | `schema`    |
| `INVALID_SCHEMA_PROPERTIES`    | `error`   | `schema`    |
| `INVALID_FIELD_SCHEMA`         | `error`   | `schema`    |
| `MISSING_FIELD_TYPE`           | `error`   | `schema`    |
| `UNSUPPORTED_FIELD_TYPE`       | `error`   | `schema`    |
| `INVALID_SCHEMA_KEYWORD_VALUE` | `error`   | `schema`    |
| `INCOMPATIBLE_SCHEMA_KEYWORD`  | `error`   | `schema`    |
| `UNMANAGED_REQUIRED_PROPERTY`  | `warning` | `schema`    |
| `INVALID_UI_SCHEMA`            | `error`   | `ui-schema` |
| `UNKNOWN_UI_SCHEMA_KEY`        | `warning` | `ui-schema` |
| `INVALID_UI_SCHEMA_VALUE`      | `error`   | `ui-schema` |
| `DUPLICATE_UI_ORDER_FIELD`     | `warning` | `ui-schema` |
| `UNKNOWN_UI_ORDER_FIELD`       | `warning` | `ui-schema` |
| `UNKNOWN_UI_FIELD`             | `warning` | `ui-schema` |
| `INCOMPATIBLE_PLACEHOLDER`     | `warning` | `ui-schema` |
| `INCOMPATIBLE_UI_OPTION`       | `warning` | `ui-schema` |

Los parámetros y `documentPath` exactos quedan definidos en PLAN-001. Los
diagnósticos sobre campos incluirán `dataPath: [fieldName]`; los diagnósticos de
raíz no incluirán `dataPath`.

El incremento M2 utilizará estos códigos normativos, todos con severidad
`error`, fuente `runtime` y sin `documentPath`:

| Código                           | Propósito                                          |
| -------------------------------- | -------------------------------------------------- |
| `INVALID_OPERATION_TARGET`       | El valor raíz no es un objeto de datos admitido    |
| `INVALID_OPERATION`              | Un miembro de la operación es inválido             |
| `INVALID_OPERATION_PATH`         | El path no pertenece al alcance raíz de M2         |
| `INVALID_FORM_DEFINITION`        | La definición no permite resolver paths y tipos    |
| `FORM_PATH_NOT_MANAGED`          | El path no pertenece al formulario                 |
| `INCOMPATIBLE_OPERATION_VALUE`   | El valor no coincide con el tipo básico del campo  |
| `UNSUPPORTED_OPERATION_PROPERTY` | La propiedad objetivo es un accessor no soportado  |
| `STALE_OPERATION`                | La expectativa no coincide con el valor confirmado |

PLAN-002 define sus parámetros, razones cerradas, orden, mensajes fallback,
inmutabilidad y reglas de seguridad exactos.

## 25. Ciclo de vida

El runtime expondrá:

```ts
runtime.dispose();
```

`dispose()` será idempotente y:

- Eliminará suscriptores.
- Descartará estado efímero y scopes visibles.
- Impedirá nuevas emisiones.
- Permitirá que el adaptador libere recursos automáticamente al destruir el formulario.

Las llamadas posteriores se ignorarán y podrán devolver diagnósticos en desarrollo.

## 26. Persistencia y envío

El runtime no gestionará:

- Submit.
- Guardado remoto.
- Estados `submitting`, `saved` o `serverError`.
- Reintentos de red.
- Permisos de negocio.

La aplicación consultará validación, mostrará errores, persistirá el modelo y actualizará el baseline cuando corresponda.

## 27. Criterios de aceptación del primer walking skeleton

La implementación mínima se considerará válida cuando demuestre:

1. Compilación de un objeto raíz con `string`, `number`, `integer` y `boolean`.
2. Orden de campos mediante UI Schema.
3. Resolución de `label`, `description`, `hint`, `tooltip` y `placeholder` mediante el contrato de UI y `TextResolver`.
4. Renderer Angular con HTML nativo.
5. Flujo controlado con Angular Signals.
6. Emisión y aplicación de `set-value` y `remove-value`.
7. Detección de operaciones desactualizadas.
8. Cálculo de dirty mediante baseline.
9. Gestión de touched y foco.
10. Validación síncrona mediante un adaptador externo.
11. Normalización de issues.
12. Visibilidad `touched`, `all` y por scope.
13. Cambio dinámico de locale.
14. Traducción mediante `TextResolver`.
15. Structural sharing observable en pruebas.
16. Diagnósticos de compilación y runtime sin excepciones esperables.
17. Destrucción idempotente del runtime.

## 28. Escenarios de conformidad

### Escenario A: formulario sencillo

- Aplicación Angular con Signal como fuente de verdad.
- Campos `name`, `age` y `active`.
- Cambio de valor, validación y dirty.

### Escenario B: datos inicialmente inválidos

- El runtime se crea correctamente.
- `valid` es falso desde el inicio.
- Los errores no se muestran hasta touched o política explícita.

### Escenario C: formulario de varios pasos

- La aplicación define scopes.
- Solo muestra errores del paso actual.
- Persiste incrementalmente.
- Actualiza parcialmente el baseline.
- Los campos de otros pasos conservan su dirty.

## 29. Decisiones abiertas inmediatas

Antes de implementar deberán resolverse, como mínimo:

1. Forma definitiva del puerto `SchemaValidator` y su acceso al esquema fuente.
2. Estructura de paquetes y nombres públicos iniciales.
3. Estrategia de resolución de renderers para el walking skeleton.
4. Política de aislamiento y reporte de excepciones lanzadas por listeners.

Estas preguntas no invalidan las decisiones de comportamiento descritas en esta SPEC.

## 30. Historial

| Versión | Fecha      | Cambio                                                                                                            |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 0.1.6   | 13-07-2026 | Se incorpora el contrato diagnóstico aprobado de PLAN-002.                                                        |
| 0.1.5   | 13-07-2026 | Se limita M2 a propiedades raíz y se define `ApplyOperationResult`.                                               |
| 0.1.4   | 13-07-2026 | Se incorpora el contrato diagnóstico normativo y la referencia al PLAN-001 aprobado.                              |
| 0.1.3   | 13-07-2026 | Se define la entrada de `compileFormDefinition()` y se aclaran los miembros obligatorios y opcionales de la raíz. |
| 0.1.2   | 13-07-2026 | Se referencia ADR-005 y se cierra la selección del dialecto inicial de JSON Schema.                               |
| 0.1.1   | 13-07-2026 | Se añaden `hint`, `tooltip` y `placeholder` al contrato de UI y a la definición normalizada.                      |
| 0.1.0   | 13-07-2026 | Primera consolidación de las decisiones del runtime controlado.                                                   |
