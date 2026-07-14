# ADR 012: Limpieza explícita de campos nativos

- **Estado:** Accepted
- **Fecha:** 14 de julio de 2026
- **Fecha de aceptación:** 14 de julio de 2026
- **Revisión:** 1 — precisiones de foco, accesibilidad y contrato público
- **Relacionado con:** [`D-010`](../roadmap/deferred-decisions.md),
  [`SPEC-001`](../specs/001-controlled-form-runtime.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md) y
  [`ADR-011`](./011-enum-string-normalizado-select-nativo.md)
- **Milestone:** M7

## 1. Contexto

El core ya distingue una propiedad ausente de `""`, `0` y `false`, expone
`requestRemoveValue()` y emite la operación estricta `remove-value`. El contrato
Angular común ya ofrece `removeValue`, pero solo el renderer numérico lo utiliza
al vaciar un input. Los renderers string, boolean y enum no ofrecen una acción
explícita para volver a missing.

Esta asimetría es especialmente visible en un enum opcional: una vez elegida una
choice, el select nativo no permite recuperar el estado ausente. D-010 aplazó
esta affordance hasta poder definir una semántica común, accesible, localizable
y compatible con el estado controlado.

## 2. Decisión

### 2.1 Semántica neutral

La limpieza será una intención explícita de usuario para eliminar la propiedad
gestionada del modelo. Utilizará exclusivamente el flujo existente:

```text
clear action -> removeValue -> requestRemoveValue(path) -> remove-value
```

- No se añadirá una operación, acción o estado nuevo al core.
- Limpiar no equivale a asignar `""`, `0`, `false`, `null` o un default.
- La acción estará disponible cuando el snapshot confirme
  `presence.kind === 'value'`, incluido `""`, `0`, `false` o un valor externo
  de cualquier tipo que el modelo controlado conserve aunque sea inválido para
  el schema o incompatible con el renderer.
- Con `presence.kind === 'missing'` no se mostrará una acción activa ni se
  emitirá una operación.
- Los campos required también podrán limpiarse. El validador externo seguirá
  siendo la única autoridad para producir el issue de required.

### 2.2 Estado controlado

La activación emitirá exactamente una intención `removeValue` y no modificará
optimistamente el control, snapshot ni modelo:

- la aplicación podrá aplicar o rechazar la operación;
- hasta recibir un nuevo valor externo, el renderer conservará la proyección del
  valor confirmado;
- una confirmación missing reconciliará el buffer visual sin emitir otra
  intención;
- un rechazo conservará el valor y mantendrá disponible la acción;
- render, reconciliación, locale, textos y lifecycle nunca emitirán limpieza.

La acción no aplicará defaults, no elegirá choices, no validará datos y no
gestionará persistencia.

### 2.3 Frontera Angular nativa

Los cuatro renderers nativos incorporarán un botón HTML `type="button"` asociado
al campo. No se añadirá la affordance al `AngularFieldRenderer` como un método o
input nuevo: el output público `removeValue` y los inputs de snapshot/textos ya
forman parte del contrato común.

El botón:

- se renderizará solo con presencia confirmada;
- emitirá una única vez por activación mediante pointer o teclado;
- llamará sincrónicamente a `focusBoundControl()` antes de emitir
  `removeValue`, porque el output puede provocar una confirmación externa
  síncrona que haga desaparecer el botón;
- emitirá la intención aunque el entorno no consiga mover el foco; el intento
  de foco nunca condicionará la operación de dominio;
- reutilizará `fieldFocus`/`fieldBlur` únicamente como reflejo del foco real, sin
  fabricar transiciones para marcar touched;
- no se confundirá con la opción centinela del select ni convertirá el
  centinela en una choice seleccionable;
- mantendrá el comportamiento actual del input numérico vacío, que ya emite
  `removeValue`; el botón será una vía explícita adicional, no una sustitución.

PLAN-007 deberá comprobar este orden para ratón y teclado y demostrar que
confirmación, rechazo o destrucción no dejan `focused: true` sin un elemento del
campo enfocado. No se añadirá una acción de runtime para touched: el control
enfocado seguirá las reglas existentes de focus y blur.

### 2.4 Texto localizable y nombre accesible

El texto fuente neutral de la acción será `Clear`. No se añadirá una keyword a
UI Schema ni se copiará metadata adicional a `FormDefinition`.

Se ampliarán los contratos públicos experimentales existentes:

```ts
export type FieldTextMember =
  | 'label'
  | 'description'
  | 'hint'
  | 'tooltip'
  | 'placeholder'
  | 'clear'
  | 'choice'
  | 'issue';

export interface AngularFieldTextSnapshot {
  // miembros existentes
  readonly clearLabel: string;
}
```

`AngularTextProjector` resolverá `Clear` con `member: 'clear'` y el contexto del
campo. Una excepción, resultado no string o resultado blank conservará `Clear`
como fallback y producirá exactamente un `TEXT_RESOLUTION_FAILED` por
proyección, con `member: 'clear'`, `reason: 'exception'`,
`'non-string-result'` o `'blank-string-result'`, `dataPath` como copia inmutable
de `field.path` y sin `documentPath`. `clearLabel` será siempre no blank e
inmutable.

`FieldIds` añadirá IDs deterministas `label` y `clear`. El label visible usará
`ids.label`, el botón usará `ids.clear` y su nombre accesible se compondrá con
`aria-labelledby` en el orden `ids.clear ids.label`: primero el texto visible
resuelto de la acción y después la etiqueta resuelta del campo. No se
interpolarán strings. PLAN-007 deberá comprobar el nombre accesible resultante,
IDs únicos, múltiples campos, teclado y asociaciones; un `TextResolver` podrá
usar el contexto del field para especializar `clearLabel`.

### 2.5 API pública y estabilidad

La extensión de `FieldTextMember` y `AngularFieldTextSnapshot` será Public +
Experimental + Active conforme a ADR-009. No se añade ningún export, entry
point, provider o configuración pública; no se promociona ninguna API a Stable.

Los componentes nativos existentes cambian su comportamiento observable al
mostrar la acción. PLAN-007 deberá actualizar package smoke, pruebas desde el
entry point y revisión de declaraciones. Los renderers personalizados reciben
`clearLabel` pero deciden si ofrecen una acción; no se les obliga a cambiar su
presentación ni se introduce una capability en ADR-007. Como `clearLabel` es un
miembro requerido nuevo, consumidores que construyan manualmente un
`AngularFieldTextSnapshot` deberán añadirlo. Esta migración fuente incompatible
está permitida únicamente por su estado Experimental y deberá quedar cubierta
por tests de declaraciones y notas de migración de PLAN-007.

## 3. Fuera de alcance

- Reset del formulario, del scope o del baseline.
- Restaurar defaults, valor inicial o último valor persistido.
- Confirmaciones, undo/redo, batches o persistencia.
- Configurar visibilidad por UI Schema, required, tipo, hover o permisos.
- Iconos, design system, tooltips o theming específicos.
- `null`, triestado booleano o nuevos tipos de schema.
- Nuevas políticas de touched o validación.
- Cambios en custom renderers más allá del snapshot de texto compatible.

## 4. Consecuencias y trade-offs

### Positivas

- Todos los tipos nativos pueden recuperar missing de forma explícita.
- Se reutilizan operación, runtime, output y flujo controlado ya probados.
- `""`, `0` y `false` continúan distinguiéndose de ausencia.
- Required permanece bajo autoridad del validador externo.
- La acción es localizable y accesible sin ampliar UI Schema.

### Negativas

- Los cuatro renderers ganan un elemento interactivo y más casos de foco.
- La palabra fuente `Clear` pasa a formar parte del contrato observable de
  localización.
- `FieldTextMember` y `AngularFieldTextSnapshot` amplían la API pública
  experimental.
- El botón numérico duplica deliberadamente la limpieza mediante input vacío.

## 5. Alternativas consideradas

### Convertir valores vacíos en missing

Rechazada porque destruiría la distinción normativa entre ausencia y `""`, `0`
o `false`.

### Añadir una nueva operación `clear-value`

Rechazada porque `remove-value` ya expresa exactamente el cambio estructural y
conserva expectativas, diagnósticos y aplicación estricta.

### Permitir seleccionar el centinela del enum

Rechazada porque mezclaría el protocolo interno del DOM con una choice de
usuario y reabriría la ambigüedad con el string vacío.

### Ocultar la acción en campos required

Rechazada porque required es validación, no propiedad ni permiso de edición. Un
consumidor puede aceptar temporalmente datos inválidos y mostrar sus issues.

### Añadir `clearLabel` a UI Schema

Rechazada para M7 porque introduce metadata por campo innecesaria. El
`TextResolver` ya recibe el contexto completo y puede localizar o especializar
la fuente neutral `Clear`.

### Exigir la acción a todos los custom renderers

Rechazada porque el contrato de extensión comunica intenciones, no impone una
composición visual. M7 garantiza la affordance en el kit nativo.

## 6. Verificación requerida por PLAN-007

- String: `""` confirmado sigue presente y puede limpiarse explícitamente.
- Number/integer: `0`, negative zero y cualquier valor confirmado se eliminan;
  el vaciado de texto actual no emite duplicados.
- Boolean: `false` se distingue de missing y puede eliminarse.
- Enum: choice `""`, choices ordinarias y valores externos fuera del enum se
  pueden limpiar sin seleccionar el centinela.
- Missing no muestra acción ni emite operaciones.
- Required permite la intención y delega el issue al validador.
- Aplicación, rechazo y reconciliación preservan el flujo controlado.
- Pointer, teclado, foco, blur, touched, destrucción y accesibilidad no dejan
  estados incoherentes.
- Locale y `TextResolver` reproyectan `clearLabel`; excepción, non-string y
  blank usan fallback y diagnóstico deterministas.
- Render inicial, locale, reconciliación y lifecycle no emiten `removeValue`.
- Tests de paquete, consumidor, declaraciones y límites arquitectónicos siguen
  pasando sin dependencias nuevas.

## 7. Criterios de aceptación de la ADR

Antes de aceptar esta propuesta debe confirmarse:

1. Que la limpieza reutiliza correctamente `remove-value` sin ampliar el core.
2. Que required y validación externa conservan sus responsabilidades.
3. Que la visibilidad por presencia cubre valores falsy e inválidos.
4. Que el flujo controlado tolera confirmación y rechazo sin optimismo.
5. Que el foco del control y la desaparición del botón tienen una solución
   determinista y accesible.
6. Que `Clear` + `member: 'clear'` es una fuente localizable suficiente sin
   ampliar UI Schema.
7. Que la ampliación pública Experimental cumple ADR-009 y no obliga a custom
   renderers a mostrar la acción.
8. Que reset, defaults, permisos, null y nuevas políticas de touched permanecen
   fuera de alcance.

## 8. Criterios de revisión futura

Revisar cuando exista demanda para configurar affordances por campo, integrar
un design system, restablecer defaults, limpiar scopes completos, representar
null/triestado o compartir una política visual entre varios adaptadores.

## 9. Estado de promoción

La aceptación promueve D-010 y autoriza sincronizar SPEC-001 y preparar
PLAN-007. No autoriza implementación, publicación ni promoción de APIs a Stable.

## 10. Resultado de la revisión formal

- **Fecha:** 14 de julio de 2026
- **Resultado inicial:** tres precisiones requeridas antes de aceptar.
- **Estado:** Proposed, revisión 1; sin promoción ni autorización de
  implementación.

La revisión contrastó los ocho criterios con SPEC-001, ADR-009/011,
PLAN-004/005/006, los contratos y declaraciones actuales, el proyector de textos,
el outlet y los cuatro renderers nativos.

Correcciones incorporadas:

1. El foco del control se solicita antes de emitir `removeValue`, preservando la
   operación aunque el foco falle y cubriendo confirmaciones síncronas.
2. `FieldIds`, `aria-labelledby` y el orden acción-campo definen una asociación
   accesible determinista sin interpolación.
3. El fallback y diagnóstico de `clearLabel`, y la migración incompatible del
   miembro público requerido, quedan completamente especificados.

Repetición de los ocho criterios:

1. **Core:** Pasa. Se reutilizan `remove-value`, `requestRemoveValue()` y el
   output existente sin ampliar operación ni runtime.
2. **Required y validación:** Pasa. La acción elimina presencia y el validador
   externo conserva la autoridad sobre required.
3. **Presencia:** Pasa. Cualquier valor presente, incluidos falsy, string vacío,
   fuera de enum o incompatible con el renderer, puede limpiarse.
4. **Controlado:** Pasa. Confirmación y rechazo se reconcilian sin proyección
   optimista ni emisiones derivadas.
5. **Foco y accesibilidad:** Pasa tras fijar el orden foco-antes-de-output, IDs y
   nombre accesible compuesto.
6. **Localización:** Pasa. `Clear`, el contexto `member: 'clear'` y el fallback
   no blank permiten localización sin ampliar UI Schema.
7. **API pública:** Pasa con migración explícita. La ampliación sigue Public +
   Experimental + Active y no obliga a custom renderers a mostrar la acción.
8. **Exclusiones:** Pasa. Reset, defaults, permisos, null, touched nuevo y demás
   capacidades permanecen fuera de alcance.

La repetición no acepta ADR-012 ni promueve D-010/M7. Esas acciones requieren
una decisión explícita posterior.

## 11. Resultado de aceptación

- **Fecha:** 14 de julio de 2026
- **Resultado:** Accepted, revision 1.

Ricard aceptó explícitamente la decisión después de que las tres precisiones se
incorporaran y los ocho criterios pasaran en la revisión repetida. D-010 queda
Promoted y M7 puede avanzar a sincronización de SPEC y preparación de PLAN-007.
La aceptación no modifica código ni autoriza la implementación por sí sola.
