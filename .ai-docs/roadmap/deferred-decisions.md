# Registro de decisiones aplazadas

- **Estado:** Vivo
- **Fecha inicial:** 13 de julio de 2026
- **Relacionado con:** [`../specs/001-controlled-form-runtime.md`](../specs/001-controlled-form-runtime.md)

## 1. Propósito

Este documento conserva decisiones, hipótesis y líneas de evolución que se han considerado relevantes, pero que no forman parte del primer prototipo.

Una entrada en este registro **no implica compromiso de implementación**. Su objetivo es evitar que una idea valiosa se pierda y dejar claro por qué todavía no se incorpora.

## 2. Estados

- **Deferred:** deliberadamente aplazada.
- **Research:** necesita investigación o spike.
- **Candidate:** candidata a la siguiente iteración.
- **Rejected for now:** descartada para el diseño actual, pero conservada como contexto.
- **Promoted:** trasladada a una SPEC, ADR o plan de implementación.

## 3. Formato de cada entrada

Cada decisión debe registrar:

- Identificador.
- Estado.
- Pregunta o capacidad.
- Motivo del aplazamiento.
- Condición para retomarla.
- Documento futuro esperado.

---

## D-001: Modo autónomo del runtime

- **Estado:** Deferred
- **Pregunta:** ¿Debe el runtime poder ser propietario del modelo de negocio cuando no existe un store externo?
- **Motivo:** La primera versión valida el modo controlado y evita dos fuentes de verdad.
- **Retomar cuando:** El modo controlado esté estabilizado y exista un caso de uso real de formularios sencillos.
- **Documento esperado:** SPEC de modos de propiedad del estado.

## D-002: Proyección optimista y reconciliación

- **Estado:** Deferred
- **Pregunta:** ¿Debe el renderer mostrar cambios antes de que la aplicación confirme el nuevo valor?
- **Motivo:** Introduce estado provisional, confirmaciones, rechazos y conflictos.
- **Retomar cuando:** Se detecte latencia real en consumidores con procesamiento asíncrono.
- **Opciones futuras:** `external-wins`, `local-wins`, rechazo de conflicto o estrategia personalizada.

## D-003: Validación asíncrona

- **Estado:** Promoted; the bounded M26 slice is completed under Accepted
  ADR-029, SPEC-012 and completed PLAN-028
- **Pregunta:** ¿Cómo integrar validaciones remotas o dependientes de servicios?
- **Motivo:** Requiere pending, cancelación, debounce, `AbortSignal`, orden de respuestas y errores de red.
- **Retomar cuando:** La validación síncrona y su normalización estén estabilizadas.
- **Documento esperado:** ADR de validación asíncrona y composición de validadores.
- **Selección M26:** Tras completar M25, review 235 ciclo 1 compara los
  candidatos restantes y selecciona D-003 porque la validación síncrona ya está
  estabilizada en ambos targets. El diseño debe mantener estado controlado,
  resolver pending/cancelación/resultados stale y separar trigger/debounce/HTTP
  de los renderers. Ajv `$async`, schemas remotos y toda implementación siguen
  inactivos hasta ADR/SPEC/plan aceptados.
- **Arquitectura M26:** ADR-029 revision 0 está Accepted tras review 236 ciclo
  2 sin hallazgos. Core coordina el lifecycle neutral; la integración posee
  debounce/transporte y adapta cancelación. SPEC-012 v0.1.0 fija el contrato
  observable Accepted tras review 237 ciclo 2 sin hallazgos. PLAN-028 revision
  0 queda Completed tras reviews 238–244: sus seis checkpoints y la matriz
  final pasan sin hallazgos. Ajv `$async`, transporte incorporado, debounce,
  retry automático y schemas remotos continúan Deferred.

## D-004: Validación parcial real

- **Estado:** Research
- **Pregunta:** ¿Puede validarse solo un scope sin evaluar el modelo completo?
- **Motivo:** Extraer fragmentos puede producir resultados incorrectos con reglas cruzadas o applicators.
- **Retomar cuando:** Existan formularios suficientemente grandes como para justificar la optimización.
- **Primera aproximación:** Validación global + filtrado de issues por scope.

## D-005: Objetos anidados

- **Estado:** Promoted
- **Pregunta:** ¿Cómo representar, compilar, renderizar y operar sobre objetos anidados?
- **Motivo:** Requiere resolver contenedores, paths profundos, layouts y errores de ramas.
- **Retomar cuando:** El walking skeleton de campos raíz esté cubierto por pruebas.
- **Revisión de promoción:**
  [`M9 — Nested-object promotion review`](../reviews/002-m9-nested-object-promotion.md)
  fue aceptada el 14 de julio de 2026 y promueve una frontera estrecha de
  objetos inline con hojas primitivas existentes para trabajo de diseño. En ese
  checkpoint todavía no se activó la implementación de M9.
- **Documentos requeridos:** ADR-014, ADR-005 revisión 1, SPEC-002 y PLAN-009,
  todos revisados y aceptados antes de implementar.
- **Estado de diseño:** ADR-014 revisión 2, ADR-005 revisión 1 y SPEC-002 v0.1.2
  están Accepted tras revisiones completas sin hallazgos. PLAN-009 revisión 1
  también superó su revisión repetida y fue aprobado explícitamente. Todos los
  gates de M9 están satisfechos; PLAN-009 y sus siete checkpoints están
  completados tras una revisión final repetida y matriz sin hallazgos.

## D-006: Arrays

- **Estado:** Promoted and completed for the bounded M10 stable object
  collection and bounded M31 atomic string-enum array field; every wider array
  capability remains Deferred
- **Pregunta:** ¿Cómo modelar elementos, índices, identidad estable, inserción, borrado y movimiento?
- **Motivo:** Requiere nuevas operaciones y una identidad diferente de la posición.
- **Retomar cuando:** Se haya definido el modelo de objetos anidados.
- **Documento esperado:** SPEC de colecciones y operaciones estructurales.
- **Revisión de promoción aceptada:**
  [`M10 — Arrays promotion review`](../reviews/007-m10-arrays-promotion.md)
  confirma que la condición de reanudación está satisfecha y acepta una
  frontera estrecha de listas homogéneas de objetos inline con identidad string
  estable propiedad de la aplicación. D-006 queda Promoted únicamente para
  diseño normativo en ese checkpoint; no autorizó implementación ni
  publicación.
- **Estado de entrega:** ADR-015 revisión 4, ADR-005 revisión 2 y SPEC-003
  v0.1.2 están Accepted. PLAN-010 revisión 0 pasó su revisión completa y fue
  aprobado explícitamente. Sus siete checkpoints y M10 están completados tras
  una revisión integral repetida y matriz final sin hallazgos. Publicación y
  todo alcance no listado siguen sin autorización.
- **Selección M31:** Ricard acepta el 3 de agosto de 2026 la frontera de
  [review 292](../reviews/292-d006-m31-string-enum-array-promotion-readiness.md)
  ciclo 3:
  un campo atómico de array homogéneo, ordenado y `uniqueItems: true`, cuyos
  items pertenecen a un enum string cerrado. No adopta identidad ni operaciones
  de colección M10. ADR-034 revisión 0 queda Accepted tras review 293 ciclo 3
  pasar doce áreas sin hallazgos. ADR-005 revisión 8 queda Accepted tras review
  294 ciclo 2 pasar diez áreas sin hallazgos. SPEC-017 v0.1.0 queda Accepted
  tras review 295 ciclo 2 pasar nueve áreas y 26 filas sin hallazgos. PLAN-033
  revision 0 queda Completed tras reviews 297–303: review final 303 ciclo 2
  repite el grafo congelado, matriz completa, las 26 filas y ambos Chromium en
  secuencia sin hallazgos. El resto de arrays continúa Deferred; release,
  publicación y Git permanecen separados.

## D-007: Composición y condicionales de JSON Schema

- **Estado:** Promoted and completed only for bounded M28 static object-`allOf`;
  every unlisted composition, conditional and resource capability remains
  Deferred
- **Incluye:** `$ref`, `allOf`, `anyOf`, `oneOf`, `if/then/else`, `dependentSchemas` y vocabularios.
- **Motivo:** Exige resolver semántica de evaluación antes de derivar UI.
- **Retomar cuando:** Se seleccione el dialecto y exista una capa de resolución de schema.
- **Revisión de preparación M11:**
  [`review 016`](../reviews/016-m11-resolution-promotion-readiness.md)
  confirma que Draft 2020-12 está seleccionado, pero la capa de resolución aún
  no existe. Ricard aceptó no promover D-007 completo y separar como D-041 un
  slice estático local de `$defs` + `$ref` por JSON Pointer. Composición,
  condicionales, referencias externas/dinámicas y vocabularios permanecen aquí
  Deferred.
- **Evaluación post-M27:** La
  [revisión 258](../reviews/258-post-m27-functional-capability-selection.md)
  confirma que dialecto y resolución ya satisfacen el trigger técnico y
  recomienda únicamente un slice estático de composición de objetos con
  `allOf`. Ricard aceptó expresamente la recomendación el 3 de agosto de 2026;
  M28 y ADR-031 quedan limitados al diseño arquitectónico aceptado. Review 259
  ciclo 5 revisó completamente la ADR con cero hallazgos y Ricard aceptó
  formalmente revision 0 el 3 de agosto de 2026. ADR-005 revision 7 completa
  review 260 ciclo 5 con cero hallazgos y queda Accepted bajo la regla
  autorizada sin ampliación de alcance. SPEC-014 v0.1.0 queda Accepted bajo la
  misma regla tras review 261 ciclo 5. PLAN-030 revision 0 queda Approved tras
  review 262 ciclo 2 sin hallazgos. Checkpoints 1–5 completan reviews 263–267
  con cero hallazgos y cubren las 21 filas; checkpoint 6 y M28 quedan
  completados tras review 268 ciclo 2 repetir la matriz completa sin hallazgos.
  El resto de D-007 continúa Deferred.

## D-008: Enum de strings y renderer select

- **Estado:** Promoted
- **Resolución:**
  [`ADR-011`](../adrs/011-enum-string-normalizado-select-nativo.md)
- **Revisión de frontera:** La revisión del 13 de julio de 2026 confirma que
  esta entrada agrupa tres responsabilidades distintas. `enum` y `const` son
  assertions sobre los datos; `format` es una annotation por defecto en Draft
  2020-12; y la elección entre selector, radios u otro renderer es una política
  de presentación posterior sobre una definición normalizada.
- **Decisión:** ADR-011 acepta `enum` solo para campos string, choices
  normalizados, labels desde UI Schema y un select Angular nativo. PLAN-006
  revisión 1 fue aprobado y sus contratos fueron promovidos a SPEC-001 Draft
  v0.1.13. PLAN-006 y M6 quedaron completados el 14 de julio de 2026 sin
  activar `const`, `format`, otros tipos de enum ni controles alternativos.
- **Revisión formal:** Las tres correcciones sobre contexto de textos,
  validación segura de choices manuales y labels accesibles no blank fueron
  incorporadas en ADR-011 revision 1. La repetición de las ocho áreas pasó sin
  hallazgos.

## D-009: Null y campos triestado

- **Estado:** Implemented locally under completed PLAN-014 revision 0;
  coordinated release PLAN-015 revision 0 for core and Angular `0.2.0`
  completed checkpoints 1–6; core and Angular are verified live under `next`,
  checkpoint 7 coordinated both `latest` aliases, and review 052 completed the
  plan with zero findings
- **Pregunta:** ¿Cómo representar `missing`, `null`, `false` y `true` sin ambigüedad?
- **Motivo:** La primera versión usa booleanos binarios y no soporta null explícito.
- **Retomar cuando:** Se amplíe el subconjunto de tipos.
- **Revisión de preparación:**
  [`review 031`](../reviews/031-m14-nullable-leaves-promotion-readiness.md)
  pasó su revisión completa ciclo 3 sin hallazgos y fue aceptada formalmente el
  15 de julio de 2026.
- **Decisión promovida:** Solo hojas primitivas existentes con un `type` array
  denso y único que contenga exactamente `null` y uno de `string`, `number`,
  `integer` o `boolean`, en cualquier orden. `missing`, `null`, `false` y los
  valores primitivos permanecen distintos.
- **Resolución arquitectónica:**
  [`ADR-019`](../adrs/019-hojas-primitivas-nullable.md) revisión 1 y
  [`ADR-005`](../adrs/005-politica-dialecto-json-schema.md) revisión 4,
  Accepted tras review 032 ciclo 2 sin hallazgos.
- **Contrato observable:**
  [`SPEC-006 v0.1.1`](../specs/006-nullable-primitive-leaves.md) fue Accepted
  tras review 034 ciclo 6 sin hallazgos.
- **Plan aprobado:**
  [`PLAN-014 revision 0`](../plans/014-nullable-primitive-leaves.md) autoriza
  únicamente sus checkpoints 1–6 tras review 035 ciclo 3 sin hallazgos; todos
  quedaron completados tras review 041 ciclo 2 sin hallazgos.
- **Frontera:** No se promueven unions generales, containers nullable,
  `enum + null`, coerción, defaults, versiones, publicación ni APIs Stable.

## D-010: Acción explícita para limpiar un campo

- **Estado:** Promoted
- **Resolución:** [`ADR-012`](../adrs/012-limpieza-explicita-campos.md) revision
  1, Accepted.
- **Pregunta:** ¿Debe todo renderer poder solicitar `remove-value` mediante una acción visual de limpieza?
- **Motivo:** No es imprescindible para el walking skeleton, salvo el vaciado numérico.
- **Condición satisfecha:** ADR-012 define la affordance nativa y su frontera de
  API, foco, localización y accesibilidad.
- **Decisión:** M7 reutiliza `remove-value` y el output Angular existente para
  una acción nativa explícita, controlada, accesible y localizable. No añade una
  operación de core, no obliga a custom renderers y mantiene reset, defaults,
  permisos y nuevas políticas de touched fuera de alcance.

## D-011: UI Schema avanzado

- **Estado:** Implemented only for the narrow completed M18 root-layout and M20
  nested-object/item boundaries; every unlisted capability remains Deferred
- **Incluye:** grids, tabs, accordions, secciones, wizards, slots, acciones y layouts responsivos.
- **Motivo:** Primero se validará la separación entre semántica de datos y presentación básica.
- **Retomar cuando:** Existan objetos anidados y un contrato de layout neutral.
- **Evaluación M12:** La [revisión 022](../reviews/022-m12-advanced-ui-promotion-readiness.md)
  confirma la estructura neutral y los hosts, pero no un contrato neutral de
  layout. Recomienda separar un primer incremento de agrupación estática y
  mantener el resto Deferred. Ricard aceptó formalmente esa separación el 15 de
  julio de 2026 y solo D-042 queda Promoted.
- **Nueva evidencia:** D-042/M12 está implementado y aceptado; Angular y
  Standard proyectan independientemente el bosque neutral completo. Ricard
  seleccionó madurar core/Angular/Standard y preservar portabilidad hacia
  librerías UI antes de React/Vue.
- **Promoción M18 aceptada:**
  [`review 098`](../reviews/098-d011-m18-advanced-layout-promotion-readiness.md)
  ciclo 2 pasó doce áreas sin hallazgos. Promueve solo tabs estáticos,
  accordions estáticos y grid lógico estático root-only sobre el bosque de
  presentación, con estado visual propiedad del target y evidencia Angular +
  Standard independiente.
- **Arquitectura neutral aceptada:** ADR-023 revisión 1 cierra
  grammar/normalización, identidad, estado visual, grid/fallback,
  accesibilidad, diagnósticos y migración Public tras review 099 ciclo 3 sin
  hallazgos. Review 100 y ADR-024 revisión 1 completaron después el gate D-025;
  SPEC-008 v0.1.0 está Accepted tras review 102 ciclo 5 y PLAN-020 revisión 0
  fue Approved tras review 103 ciclo 2 para ocho checkpoints verificables;
  ahora está Completed tras review 113 ciclo 2.
- **Contrato normativo aceptado:** SPEC-008 v0.1.0 cierra gramática,
  normalización, diagnósticos, validación manual, estado target-owned,
  accesibilidad, proyección Angular/Standard y evidencia de conformidad.
- **Slice implementado:** PLAN-020 revisión 0 y M18 están Completed tras review
  113 ciclo 2 sin hallazgos; el cierre verifica las 22 filas, native/Aria
  lower/latest, fuentes, artefactos y ambos targets independientes.
- **Promoción M20 aceptada:**
  [`review 133`](../reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
  ciclo 3 pasó doce áreas sin hallazgos. Promueve únicamente diseño normativo
  para bosques locales con las clases de contenedor ya aceptadas sobre hijos
  directos de objetos anidados e items/templates de colección. ADR-025 debe
  cerrar el modelo de tipos, identidad de propietario/instancia, fallback y
  migración del SPI antes de cualquier SPEC; no había contrato observable ni
  implementación M20 activos en ese gate.
- **Arquitectura M20 aceptada:** ADR-025 revisión 0 cierra el modelo genérico
  node/template, bosques locales requeridos, namespaces y keys por propietario,
  IDs/estado por item estable, fallback/diagnósticos locales, textos estáticos y
  migración del SPI. Review 134 ciclo 4 pasó trece áreas sin hallazgos y
  autorizó únicamente preparar/revisar SPEC-009.
- **Contrato M20 aceptado:** SPEC-009 v0.1.0 cierra gramática, tipos genéricos,
  diagnósticos/fallback, identidad concreta, estado/ciclo de vida, migración
  Angular SPI, native/Aria/Standard y 27 filas mínimas de conformidad. Review
  135 ciclo 6 pasó catorce áreas sin hallazgos y autoriza únicamente
  preparar/revisar PLAN-022 en ese gate; versión y release siguen inactivos.
- **Slice M20 implementado:** PLAN-022 revisión 0 está Completed tras review 144
  ciclo 3. Sus ocho checkpoints, las 27 filas, consumidores lower/latest
  native/pilot y referencias Angular/Standard pasan sin cambiar dependencias,
  versiones, release, Git ni estado externo.
- **Permanece Deferred:** wizards, workflow, slots, acciones, scopes,
  condiciones, layout nested/item fuera del slice local promovido, breakpoints
  arbitrarios, estado controlado o persistido y todo renderer kit salvo la
  arquitectura estrecha del único piloto Angular Aria 22 aceptada por ADR-024.

## D-012: Scopes declarativos en UI Schema

- **Estado:** Deferred
- **Pregunta:** ¿Deben los pasos y secciones declararse en metadatos?
- **Motivo:** En la primera versión los scopes pertenecen a la aplicación.
- **Retomar cuando:** Se diseñe UI Schema avanzado.
- **Evaluación M12:** La [revisión 022](../reviews/022-m12-advanced-ui-promotion-readiness.md)
  mantiene D-012 Deferred: el contrato avanzado aún no existe y no debe mover
  silenciosamente a UI Schema la autoridad de scopes que posee la aplicación.
- **Evaluación M20:** La
  [revisión 133](../reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
  mantiene los scopes en la aplicación. Un bosque local no genera, limita,
  persiste ni secuencia `FormScope`; D-012 continúa íntegramente Deferred.
  Ricard aceptó formalmente este límite el 15 de julio de 2026.
- **Límite M18:** review 098 no genera scopes desde tabs, panels, accordions ni
  grid; la aplicación conserva toda autoridad de validación y workflow.

## D-013: Actualización dinámica de FormDefinition

- **Estado:** Deferred
- **Pregunta:** ¿Puede el runtime reconciliar una definición nueva sin recrearse?
- **Motivo:** Requiere resolver campos eliminados, tipos cambiados, foco, touched, scopes y operaciones antiguas.
- **Retomar cuando:** Exista demanda real de esquemas dinámicos en caliente.

## D-014: Modelo intermedio y versionado

- **Estado:** Research
- **Pregunta:** ¿Se necesita un AST, un grafo de schema resuelto, un modelo normalizado y/o un render plan separados?
- **Motivo:** No debe imponerse terminología de compiladores sin validar las responsabilidades reales.
- **Resolución parcial aceptada:** ADR-014 revisión 2 selecciona para D-005 un
  árbol normalizado de nodos con una proyección de hojas enlazada por identidad.
- **Frontera restante:** El AST genérico, grafo resuelto, render plan separado,
  pipeline multi-formato y versionado del modelo intermedio continúan en
  Research.
- **Retomar cuando:** Se implementen objetos, referencias o múltiples formatos de entrada.
- **Documento esperado:** ADR sobre pipeline de compilación y compatibilidad del modelo intermedio.
- **Revisión de preparación M11:**
  [`review 016`](../reviews/016-m11-resolution-promotion-readiness.md)
  confirma que la condición se satisface por los objetos/colecciones ya
  implementados. Ricard aceptó trasladar a D-041 solo la responsabilidad de una
  capa Internal de resolución estática local que conserve `FormDefinition` y
  el schema original. El AST público, versionado, render plan y pipeline
  multi-formato permanecen en D-014 Research.

## D-015: Fuentes de metadatos adicionales

- **Estado:** Deferred
- **Incluye:** OpenAPI, Zod, TypeBox, YAML u otros DSL.
- **Motivo:** Primero debe estabilizarse el contrato neutral generado desde JSON Schema.
- **Retomar cuando:** `FormDefinition` tenga una API pública estable.

## D-016: Sistema de plugins

- **Estado:** Deferred
- **Pregunta:** ¿Qué extensiones son plugins y qué contratos son puertos explícitos?
- **Motivo:** Un plugin manager genérico puede crear una API amplia e inestable.
- **Retomar cuando:** Existan al menos tres extensiones reales que compartan ciclo de vida.

## D-017: Lifecycle hooks

- **Estado:** Deferred
- **Pregunta:** ¿Son necesarios hooks como `beforeCompile`, `afterValidate` o `beforeRender`?
- **Motivo:** Todavía no están definidas todas las fases, invariantes, mutabilidad, asincronía y orden.
- **Retomar cuando:** El pipeline tenga fases comprobadas mediante implementación.

## D-018: Expression engine y dependency graph

- **Estado:** Implemented only for the bounded Accepted M30 and M32
  architectures and observable contracts; every wider expression, dependency
  and conditional-state capability remains Deferred
- **Incluye:** visible, enabled, readonly, required dinámico, computed y defaults condicionales.
- **Motivo:** Requiere lenguaje, sandbox, dependencias, evaluación incremental y diagnósticos.
- **Retomar cuando:** Los formularios estáticos y objetos anidados estén consolidados.
- **Selección M30:** Ricard acepta el 03-08-2026 la recomendación de promover
  únicamente visibilidad y estado enabled declarativos para campos primitivos
  ordinarios. [Review 279](../reviews/279-d018-m30-conditional-field-state-promotion-readiness.md)
  ciclo 2 pasa doce áreas sin hallazgos y reserva ADR-033 solo para predicados
  de igualdad sobre valores controlados. No activa expresiones arbitrarias,
  composición booleana, dependency graph, required/computed/default dinámico,
  templates/items de colección o validación condicional.
  ADR-033 revision 0 queda Accepted tras review 280 ciclo 2 corregir tres
  ambigüedades y pasar doce áreas sin hallazgos. SPEC-016 v0.1.1 queda Accepted
  tras review 283 ciclo 1 resolver C-002 y repetir diecisiete áreas y 24 filas
  sin hallazgos; PLAN-032 revision 1 queda Approved tras review 284 ciclo 1
  pasar doce áreas, el acuerdo autónomo y ownership exacto sin hallazgos.
  Reviews 285–290 ciclo 2 completan sus checkpoints 1–6 y las 24 filas. Review
  291 ciclo 1 repite la matriz completa y cierra PLAN-032 revision 1/M30 sin
  hallazgos.
- **Selección M32:** Ricard acepta el 03-08-2026 continuar con funcionalidad
  neutral antes de React en el orden M32 condiciones compuestas, M33
  alternativas de objeto discriminadas, M34 wizard declarativo y después
  React. [Review 304](../reviews/304-d018-m32-compound-condition-promotion-readiness.md)
  ciclo 2 pasa catorce áreas sin hallazgos y promueve únicamente grupos planos
  no vacíos `all`/`any` de predicados de igualdad M30 para `visible`/`enabled`
  sobre campos primitivos ordinarios. Reserva ADR-035 solo para esa
  arquitectura. ADR-035 revision 0 queda Accepted tras review 305 ciclo 2
  corregir seis ambigüedades y pasar doce áreas sin hallazgos; autoriza solo
  preparar/revisar SPEC-018. SPEC-018 v0.1.0 queda Accepted tras review 306
  ciclo 2 corregir siete defectos y pasar quince áreas y 22 filas sin
  hallazgos; autoriza solo preparar/revisar PLAN-034. PLAN-034 revision 0 queda
  Approved tras review 307 ciclo 3 corregir dos hallazgos y pasar doce áreas y
  las 22 filas sin hallazgos; autoriza solo checkpoints 1–6 en orden. Checkpoint
  1 completa las filas 1–9 tras review 308 ciclo 2 pasar doce áreas sin
  hallazgos. Checkpoint 2 completa las filas 10–17 tras review 309 ciclo 2
  pasar doce áreas sin hallazgos. Checkpoint 3 completa la fila 18 tras review
  310 ciclo 1 pasar diez áreas sin hallazgos. Checkpoint 4 completa las filas
  19–20 tras review 311 ciclo 2. Checkpoint 5 completa la fila 21 tras review
  312 ciclo 3. Review 313 ciclo 2 repite la matriz congelada y completa
  checkpoint 6, la fila 22, PLAN-034 revision 0 y M32 sin hallazgos.
  M33, M34, React y el resto de D-018 permanecen Deferred.

## D-019: Commands, undo/redo e historial

- **Estado:** Deferred
- **Pregunta:** ¿Deben las operaciones evolucionar a comandos reversibles?
- **Motivo:** Las operaciones incrementales ya preparan el camino, pero undo/redo no es necesario para v1.
- **Retomar cuando:** Exista un editor complejo o un caso de auditoría.

## D-020: Colaboración y concurrencia remota

- **Estado:** Deferred
- **Incluye:** acknowledgements, operaciones pendientes, reintentos, versiones, CRDT/OT y conflictos.
- **Motivo:** La primera versión solo aplica control optimista local mediante expectativas.
- **Retomar cuando:** Exista un caso de edición concurrente real.

## D-021: Batches y transacciones de operaciones

- **Estado:** Deferred
- **Pregunta:** ¿Cómo agrupar varios cambios como una unidad lógica?
- **Motivo:** La primera versión solo necesita operaciones atómicas de un campo.
- **Retomar cuando:** Aparezcan acciones mult campo, arrays o undo/redo.

## D-022: Canal persistente de diagnósticos y DevTools

- **Estado:** Deferred
- **Pregunta:** ¿Debe existir una suscripción de diagnósticos para herramientas de desarrollo?
- **Motivo:** En v1 los diagnósticos de acciones son efímeros.
- **Retomar cuando:** Se diseñe una extensión de DevTools o telemetría.

## D-023: Estrategia avanzada de resolución de renderers

- **Estado:** Promoted
- **Pregunta:** ¿Cómo elegir el mejor renderer compatible?
- **Dirección propuesta:** Testers/resolvers con puntuación, prioridad y capacidades, no un diccionario simple `type -> component`.
- **Motivo:** El walking skeleton puede comenzar con pocos tipos, pero la extensibilidad exige una decisión temprana.
- **Retomar cuando:** Antes de implementar el adaptador Angular HTML.
- **Documento esperado:** ADR de renderer resolution.
- **Resolución:** [`ADR-007`](../adrs/007-resolucion-renderers-testers.md) acepta
  testers puntuados, priority y desempate determinista en el adaptador, sin un
  registry de componentes en el core.

## D-024: Renderers personalizados y bridges de validación del framework

- **Estado:** Deferred
- **Resolución parcial:** El registro de componentes propios ya está resuelto por
  [`ADR-007`](../adrs/007-resolucion-renderers-testers.md) y
  [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md) mediante
  `provideSchemaRenderer()`, contratos públicos de renderer y resolución
  determinista; no queda una decisión abierta de registry.
- **Pregunta restante:** ¿Debe el paquete Angular adaptar `ValidatorFn`, el
  contrato `Validator` de Signal Forms, o ninguno de ellos al puerto neutral
  `SchemaValidator`?
- **Motivo:** `ValidatorFn` recibe un `AbstractControl` y devuelve un mapa de
  errores arbitrario, mientras el core valida el modelo completo y requiere
  issues normalizados con paths canónicos. Signal Forms introduce otro contrato
  de validator basado en `FieldContext`. Un bridge genérico inventaría semántica
  de controles, parents, estado y mapeo de paths que el runtime neutral no posee.
- **Retomar cuando:** Un consumidor concreto necesite reutilizar validadores
  Angular y pueda definir si son de raíz o campo, cómo se construye el contexto
  y cómo se normalizan códigos, parámetros y paths.
- **Documento esperado:** ADR específico del bridge de validación Angular; no
  debe reabrir el contrato ya resuelto de custom renderers.

## D-025: Design tokens y theming

- **Estado:** Promoted and architecturally resolved only for the narrow Angular
  Experimental presentation-container seam accepted by review 100 and ADR-024
  revision 1; every broader theming or multi-target capability remains Deferred
- **Pregunta:** ¿Cómo personalizar estilos sin acoplar el core a Material o Tailwind?
- **Dirección propuesta:** Design tokens y contratos visuales en paquetes de UI.
- **Trigger histórico:** Existiera al menos un renderer kit estable; review 100
  lo reconcilia solo para el slice Experimental estrecho descrito abajo.
- **Demanda y gate coordinado:** Ricard solicitó integrar distintas librerías UI
  por plataforma sin acoplarlas al core. Review 098 exige que ADR-023 defina
  layout neutral compatible con futuros kits y que, una vez aceptado, D-025
  reciba una revisión de promoción antes de SPEC-008/PLAN-020. El kit HTML
  nativo Angular implementado y la proyección Standard aportan evidencia, pero
  no garantizan el resultado: si la revisión concluye que D-025 no está listo,
  M18 se detiene antes de la SPEC; si está listo, su ADR requiere aceptación
  separada. En ese checkpoint D-025 continuaba íntegramente Deferred y no
  autorizaba paquete, provider, tokens, dependencia ni implementación.
- **Evidencia neutral aceptada:** ADR-023 revisión 1 fija el surface semántico
  que un futuro kit debe respetar sin seleccionar provider API ni librería.
  Review 099 ciclo 3 cerró sin hallazgos y autorizó exclusivamente la revisión
  de promotion readiness ya completada en review 100.
- **Promoción estrecha aceptada:** review 100 ciclo 4 pasó doce áreas sin
  hallazgos. Autoriza ADR-024 solo para un dominio Angular separado de
  registrations de `section`/tabs/accordion/grid, fallback nativo sin
  dependencias, un piloto opcional aislado, ownership de tema y tiers
  Experimental.
- **Arquitectura estrecha aceptada:** ADR-024 revisión 1, aceptada tras review
  101 ciclo 4 sin hallazgos, fija el SPI/provider Angular separado, el fallback
  nativo obligatorio, el paquete aislado, seis tokens locales y Angular Aria 22
  como único piloto. No activa dependencias, paquete, publicación ni código.
- **Contrato estrecho aceptado:** SPEC-008 v0.1.0 fija nueve exports Angular,
  providers/fallback/claims, paquete Aria `0.1.0`, matriz core/Angular `0.3.0`,
  seis propiedades CSS y tiers Experimental. PLAN-020 revisión 0 fue Approved
  tras review 103 ciclo 2 y ahora está Completed tras review 113; todo alcance
  más amplio permanece Deferred.
- **Trigger reconciliado:** no existe todavía un kit Stable. Esperarlo antes de
  diseñar el primer seam sería circular; review 100 sustituye ese trigger solo
  para arquitectura/piloto Experimental verificable en privado. No promueve
  Stable, publicación ni afirma que el kit ya exista.
- **Permanece Deferred:** tokens Rabassoft genéricos, CSS compartido,
  traducción de temas, suite completa de fields, múltiples pilotos, protocolo
  multi-framework, otros Angular majors y cualquier implementación/publicación.
- **Plan aprobado:** PLAN-020 revisión 0 mapea las 22 filas de conformidad a
  ocho checkpoints. Todos están completos tras reviews 104–113; review 113
  ciclo 2 repite la matriz final y cierra PLAN-020/M18 sin hallazgos. El alcance
  más amplio de D-025 continúa Deferred.

## D-026: Capabilities de adaptadores

- **Estado:** Deferred
- **Incluye:** SSR, hydration, portals, dynamic components, zoneless y otras capacidades.
- **Motivo:** No deben modelarse capacidades hipotéticas antes de comparar dos adaptadores reales.
- **Retomar cuando:** Comience el segundo adaptador de framework.

## D-027: Estrategia de instanciación dinámica en Angular

- **Estado:** Promoted
- **Opciones:** `ViewContainerRef`, `NgComponentOutlet`, bindings programáticos u otra estrategia.
- **Motivo:** Debe decidirse después del contrato renderer-runtime, no antes.
- **Retomar cuando:** El ADR de resolución de renderers esté aprobado.
- **Resolución:** [`ADR-008`](../adrs/008-instanciacion-renderers-angular.md)
  acepta `ViewContainerRef.createComponent()` con bindings de creación para los
  renderers inline.

## D-028: Versionado de paquetes y compatibilidad con frameworks

- **Estado:** Promoted
- **Pregunta:** ¿Lockstep con la major del framework o SemVer propio con peer dependencies y matriz de compatibilidad?
- **Motivo:** El ADR actual de lockstep necesita revisión antes de publicarse.
- **Dirección recomendada:** SemVer del producto + rangos de peer dependencies + matriz de compatibilidad.
- **Retomar cuando:** Se confirme el mapa de paquetes y la API pública inicial.
- **Resolución:** [`ADR-010`](../adrs/010-versionado-semver-compatibilidad.md)
  acepta SemVer independiente para cada paquete, peers y matriz explícitos,
  compatibilidad Angular inicial `>=22.0.6 <23.0.0` con versiones alineadas y
  una ventana Stable de 180 días más una MINOR posterior antes de retirada en
  una MAJOR.

## D-029: Estabilidad de API pública

- **Estado:** Promoted
- **Pregunta:** ¿Qué paquetes, tipos y funciones serán públicos y cuáles internos?
- **Motivo:** Debe definirse antes de la primera publicación, pero después del walking skeleton.
- **Resolución:** [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md)
  acepta los entry points explícitos como única frontera pública, clasifica el
  inventario raíz como Public + Experimental + Active y mantiene internos los
  deep imports, helpers y el token crudo de registros Angular.

## D-030: Localización avanzada

- **Estado:** Deferred
- **Incluye:** monedas, porcentajes, unidades, calendarios, zonas horarias y parsers personalizados.
- **Motivo:** V1 solo necesita números localizados y textos resolubles.
- **Retomar cuando:** Se incorporen formatos especializados.

## D-031: Políticas adicionales de visibilidad de errores

- **Estado:** Deferred
- **Incluye:** `dirty`, `submit-attempted`, combinaciones o función personalizada.
- **Motivo:** `touched`, `all` y scopes cubren el primer prototipo.
- **Retomar cuando:** Los consumidores demuestren necesidades distintas.

## D-032: Persistencia y autosave como integración oficial

- **Estado:** Deferred
- **Pregunta:** ¿Debe existir un paquete opcional para debounce, drafts y persistencia incremental?
- **Motivo:** La persistencia pertenece inicialmente a la aplicación.
- **Retomar cuando:** Existan patrones repetidos entre consumidores.

## D-033: Productos superiores del ecosistema

- **Estado:** Deferred
- **Incluye:** property inspector, CRUD, visual builder, remote metadata, analytics, white label y cloud.
- **Motivo:** Son productos construidos sobre el motor, no requisitos del runtime inicial.
- **Retomar cuando:** El motor de formularios tenga adopción y estabilidad.

## D-034: Modelo comercial y licenciamiento

- **Estado:** Promoted
- **Opciones:** MIT, open core, plugins comerciales, soporte, SaaS o licencias enterprise.
- **Motivo:** Debe validarse primero el valor técnico y la demanda.
- **Retomar cuando:** Exista una comunidad inicial o consumidores empresariales.
- **Selección iniciada:** Ricard seleccionó el 15 de julio de 2026 el modelo
  dual `AGPL-3.0-only` o licencia comercial de pago. La
  [revisión 027](../reviews/027-d034-d040-publication-licensing-readiness.md)
  ciclo 2 pasa sin hallazgos, identifica a Ricardo Rabassó Rodríguez como
  titular jurídico y promueve D-034 únicamente para redactar/revisar ADR-018.
- **Decisión aceptada:**
  [`ADR-018 revision 4`](../adrs/018-licencia-dual-publicacion-experimental.md)
  conserva `AGPL-3.0-only` o licencia comercial separada y trata todo `latest`
  observado solo como alias Experimental. Review 115 ciclo 4 acepta la revisión
  sin cambiar los gates externos de PLAN-013/M19.

## D-035: Especificación pública independiente de la implementación

- **Estado:** Deferred
- **Pregunta:** ¿Debe el proyecto publicar una especificación que terceros puedan implementar sin usar el código oficial?
- **Motivo:** Requiere contratos suficientemente maduros y pruebas de conformidad.
- **Retomar cuando:** Exista al menos un segundo adaptador o implementación independiente.

## D-036: Const y presentación de valores fijos

- **Estado:** Implemented only for the bounded M25 primitive fixed-presentation
  slice; every broader readonly/hidden/const policy remains Deferred
- **Pregunta:** ¿Debe `const` producir una presentación fixed, readonly, hidden
  o ningún renderer?
- **Motivo:** La assertion de datos no determina por sí sola la interacción ni
  la presentación adecuada.
- **Retomar cuando:** Exista un caso consumidor concreto para valores fijos y
  se defina quién controla su presencia y visualización.
- **Documento esperado:** ADR de semántica normalizada y presentación de
  valores fijos.
- **Revisión de preparación M25:** review 218 ciclo 1 encuentra viable un slice
  primitivo acotado y recomienda una presentación fija estática que muestra el
  valor controlado real, no emite operaciones y conserva Ajv como autoridad de
  assertion. Ricard aceptó esa decisión y el rechazo temprano de contradicción
  `const`/string-`enum` el 1 de agosto de 2026.
- **Arquitectura:** ADR-028 revision 0, ADR-005 revision 6 y ADR-022 revision 3
  están Accepted tras review 219 ciclo 2 sin hallazgos.
- **Contrato observable:** SPEC-011 v0.1.0 está Accepted tras review 220 ciclo
  4 sin hallazgos.
- **Entrega completada:** PLAN-027 revision 1 está Completed tras review 234
  ciclo 3 sin hallazgos. El alcance restante sigue inactivo.

## D-037: Format y renderers semánticos especializados

- **Estado:** Implemented only for the bounded M24
  `email`/`date`/`date-time` increment; every other format and policy remains
  Deferred
- **Pregunta:** ¿Qué formatos se soportan y cuáles actúan como annotation,
  assertion o hint de presentación?
- **Motivo:** ADR-005 trata `format` como anotación ignorada; cambiarlo requiere
  una política explícita de validación y renderers por formato.
- **Retomar cuando:** Exista un caso consumidor concreto para un formato y se
  defina su vocabulario, validación y fallback visual.
- **Documento esperado:** ADR que revise explícitamente ADR-005.
- **Promoción M24 aceptada:** review 209 ciclo 1 pasó sin hallazgos y promueve
  únicamente normalización neutral, assertion oficial Ajv y proyección
  Angular/Standard de los tres formatos seleccionados.
- **Arquitectura y contrato:** ADR-027 revision 0, coordinada con ADR-005
  revision 5 y ADR-022 revision 2, y SPEC-010 v0.1.0 están Accepted tras
  reviews 210–211 sin hallazgos. PLAN-026 revision 0 está Completed tras review
  217 ciclo 4; no activa ningún otro formato o política D-037.

## D-038: Utilidad para confirmar un scope en el baseline

- **Estado:** Implemented through completed M27; ADR-030 revision 0 and
  SPEC-013 v0.1.1 are Accepted, and PLAN-029 revision 1 completed all six
  checkpoints after final review 257 cycle 2 passed with zero findings
- **Pregunta:** ¿Debe el core exponer una utilidad pura
  `commitScopeToBaseline(definition, baselineValue, currentValue, scope)` para
  construir una actualización parcial del baseline?
- **Motivo:** SPEC-001 llegó a prometer el helper, pero PLAN-003, la API pública
  y la implementación no lo promovieron. El prototipo mantiene a la aplicación
  como única propietaria del baseline y permite que lo actualice de forma
  inmutable mediante `updateExternalState()`.
- **Retomar cuando:** Dos o más consumidores necesiten compartir semántica de
  confirmación parcial, incluidos paths válidos, propiedades ausentes,
  structural sharing y diagnósticos.
- **Documento esperado:** SPEC o plan que defina el contrato puro, su relación
  con scopes y su frontera de API pública.
- **Selección M27:** Review 245 cycle 1 compara los candidatos restantes y
  selecciona una utilidad pura framework-neutral porque objetos profundos,
  colecciones con identidad estable, scopes y dos consumidores de referencia
  independientes ya proporcionan la semántica y evidencia necesarias. La
  aplicación conserva baseline/persistencia; ADR-030 debe resolver targets,
  ausencia, solapamiento, colecciones, sharing y diagnósticos antes de cualquier
  SPEC o implementación.
- **Propuesta revisada:** ADR-030 revision 0 elige un único helper Public
  Experimental puro, fallo atómico, copia solo gestionada, confirmación
  estructural exclusiva mediante el path de array y targets estables parciales
  no estructurales. Review 246 ciclo 2 pasa con cero hallazgos y la decisión
  queda Accepted. SPEC-013 v0.1.1 resuelve C-001, supera review 250 ciclo 1 con
  cero hallazgos y queda Accepted. PLAN-029 revision 1 supera review 251 ciclo
  1 y quedó Approved; sus seis checkpoints quedaron Completed tras review final
  257 ciclo 2 con cero hallazgos.

## D-039: Aplicación explícita de defaults del schema

- **Estado:** Partially promoted — bounded M29 completed; wider scope Deferred
- **Pregunta:** ¿Debe el core exponer
  `applySchemaDefaults(schema, value)` u otra operación explícita de
  inicialización?
- **Motivo:** PLAN-001 reconoce `default` como metadata pero excluye su
  aplicación y no lo copia a `FormDefinition`; ningún plan posterior promovió
  semántica de evaluación o una API pública. Aplicar defaults correctamente se
  complica con objetos, arrays, composición y dialectos futuros.
- **Retomar cuando:** Exista un caso consumidor de creación de entidades y se
  haya definido si la operación usa schema crudo, modelo resuelto o definición
  normalizada, además de presencia, recursividad y diagnósticos.
- **Documento esperado:** SPEC de inicialización explícita y, si afecta a la
  arquitectura o API pública, ADR y plan aprobados.
- **Evaluación post-M27:** La revisión 258 mantiene D-039 Deferred. M27 aporta
  un patrón útil de candidato puro y aceptación explícita, pero no sustituye el
  caso consumidor de creación de entidades ni decide si la inicialización
  recibe schema crudo, modelo resuelto o definición normalizada.
- **Evaluación post-M28:** La revisión 269 confirma que referencias locales y
  composición object-`allOf` acotada mejoran la preparación técnica, y sitúa un
  diseño D-039 puro/application-triggered como recomendación por defecto si se
  prioriza funcionalidad core. Ricard selecciona esa dirección el 03-08-2026:
  M29/ADR-032 promueven solo un candidato explícito para defaults de hojas
  primitivas en árboles object. Defaults de root/containers/arrays/items,
  factories, defaults condicionales/dinámicos y aceptación automática
  permanecen Deferred. ADR-032 revision 0 queda Accepted tras review 270 ciclo
  2; SPEC-015 v0.1.0 queda Accepted tras review 271 ciclo 1 y autoriza
  PLAN-031 revision 0, completado tras review final 278 ciclo 2 repetir la
  matriz completa y las 21 filas sin hallazgos. El resto de D-039 permanece
  Deferred.

## D-040: Publicación real de paquetes

- **Estado:** Promoted
- **Pregunta:** ¿Dónde, con qué visibilidad, licencia, access, provenance,
  credenciales y proceso se publicarán los artefactos preparados por M8?
- **Motivo:** Probar tarballs locales no concede términos de distribución ni
  autoriza efectos remotos, y `private: true` debe seguir bloqueando una
  publicación accidental durante M8.
- **Retomar cuando:** ADR-013, PLAN-008 y M8 estén completados y Ricard decida
  iniciar explícitamente una primera publicación.
- **Documento esperado:** ADR de publicación que resuelva también la relación
  con D-034, seguido de un plan aprobado para registry, access, provenance,
  credenciales, tags y rollback.
- **Selección iniciada:** Ricard decidió el 15 de julio de 2026 preparar una
  publicación pública bajo el modelo dual de D-034. La
  [revisión 027](../reviews/027-d034-d040-publication-licensing-readiness.md)
  ciclo 2 pasa sin hallazgos y promueve D-040 únicamente para diseño normativo.
  En ese gate inicial `private: true` seguía intacto; el repositorio continuaría
  privado hasta sanearlo y toda publicación requería ADR, plan y checkpoint
  externo explícito.
- **Release M19 seleccionada:** Ricard seleccionó el 19 de julio de 2026 la
  entrega coordinada de core/base Angular `0.3.0` y el primer piloto Angular
  Aria `0.1.0`. Review 114 ciclo 2 pasa doce áreas sin hallazgos y promueve solo
  la revisión normativa de publicación.
- **Arquitectura M19 aceptada:** ADR-018 revisión 4 está Accepted tras review
  115 ciclo 4. Sustituye el límite histórico de dos paquetes, incorpora el
  tercer nombre y cierra publicación `next` dependency-first, transición
  `latest` dependent-first, observación del primer alias del piloto, fallos
  parciales y recuperación immutable. SPEC-008/ADR-010 no requieren revisión.
- **Plan M19 completado:** PLAN-021 revisión 0 está Completed tras review 132
  ciclo 4 sin hallazgos. Checkpoint 1 completa el descriptor/tooling de tres
  paquetes tras review 117 ciclo 2; checkpoint 2 completa release notes,
  onboarding y checks documentales tras review 118 ciclo 3; checkpoint 3
  completa gate local, candidatos deterministas, dry runs neutrales y las 22
  filas tras review 119 ciclo 5. Checkpoint 4 fija/sube el commit privado
  `ce3ef3d` y selecciona los bytes reconstruidos tras review 120 ciclo 3.
  Checkpoint 5 completa core `0.3.0` público bajo `next` tras review 122 ciclo 3
  sin hallazgos; `latest` queda en `0.2.0`. Checkpoint 6 completa base Angular
  `0.3.0` bajo `next` tras review 124 ciclo 2; ambos `latest` quedan en `0.2.0`
  y el piloto permanece ausente. Checkpoint 7 pre-publication pasa review 125
  ciclo 5 y la publicación/verificación piloto completa checkpoint 7 tras
  review 126 ciclo 4. Los tres `next` son exactos; npm creó automáticamente el
  `latest: 0.1.0` piloto, pendiente solo de la observación/retención separada de
  checkpoint 8. Review 127 ciclo 2 completa esa retención sin mutación; D-043
  permanece Deferred. Checkpoint 9 pre-transition pasa review 128 ciclo 1 y la
  transición base completa tras review 129 ciclo 1, dejando la ventana mixta
  prevista con core `latest: 0.2.0`. Checkpoint 10 pre-transition pasa review
  130 ciclo 1 y la transición core completa tras review 131 ciclo 1. Core/base
  `next/latest: 0.3.0` y piloto `next/latest: 0.1.0` quedan coordinados.
  Checkpoint 11 repite la matriz completa y review 132 ciclo 4 pasa sin
  hallazgos, completando PLAN-021/M19 sin autorizar otra acción externa.
- **Release M21 seleccionada:** Ricard eligió el 20 de julio de 2026 la opción
  A de review 145. Review 146 ciclo 3 pasa catorce áreas sin hallazgos y
  promueve solo ADR-018 revisión 5 para diseñar core/base Angular `0.4.0` y
  Angular Aria `0.2.0`, con peers `^0.4.0`. No cambia manifests, versiones,
  candidatos ni estado externo y no autoriza todavía un plan.
- **Arquitectura M21 aceptada:** ADR-018 revisión 5 está Accepted tras review
  147 ciclo 5. Fija las versiones/peers exactos, `next` core/base/piloto,
  transición `latest` piloto/base/core, recuperación immutable y gates. Solo
  el plan separado puede autorizar implementación.
- **Plan M21 aprobado:** PLAN-023 revisión 0 está Approved tras review 148
  ciclo 2. Autoriza únicamente checkpoints locales 1–3; checkpoint 4, Git y
  toda lectura/escritura de registry permanecen sujetos a gates posteriores.
- **Checkpoint local 1 completado:** review 149 ciclo 2 valida descriptor,
  manifests, peers, tooling, baseline M19 y consumidores M20 sin candidato,
  Git, registry ni estado externo.
- **Checkpoint local 2 completado:** review 150 ciclo 5 valida notas `0.4.0`,
  onboarding fuente/live, migración/compatibilidad, recuperación exacta y
  checks fail-closed sin candidato, lockfile, Git, registry ni estado externo;
  en ese límite aún faltaba checkpoint 3.
- **Checkpoint local 3 completado:** review 151 ciclo 2 valida la matriz
  congelada completa, las 27 filas SPEC-009, tres candidatos dirty-tree
  deterministas, Corresponding Source, seguridad, consumidores lower/latest y
  dry runs neutrales. `sourceCommit: null` impide seleccionarlos como evidencia
  publicable; checkpoint 4, Git, registry y toda acción externa siguen gated.
- **Checkpoint Git/limpio 4 completado:** review 152 ciclo 3 valida el scope de
  128 archivos, commit/push privado `07755b4`, reconstrucción limpia y tres
  candidatos byte-idénticos con `sourceCommit` exacto. `angular.json` sigue
  excluido; checkpoint 5 y toda lectura/escritura de registry mantienen gates
  separados.
- **Checkpoint 5 read-only pausado:** el primer intento autorizado confirma npm
  10.9.8 y registry oficial, pero identidad, perfil, organización y access
  devuelven `E401`. Ricard debe restaurar la sesión; no se consultaron
  paquetes/versiones/tags ni se intentó mutación.
- **Pre-publicación checkpoint 5 completada:** Ricard restaura la sesión y
  review 153 ciclo 3 valida nueve áreas sin hallazgos: identidad, 2FA write,
  autoridad Rabassoft, settings, M19 byte-idéntico, ausencia M21, core
  seleccionado y dry run neutral. Publicar conserva gate inmediato separado.
- **Core M21 publicado/verificado:** Ricard ejecuta el publish exacto y review
  154 ciclo 5 valida core `0.4.0` byte-idéntico, firmado, público, exact/`next`
  con consumidores lower/latest. `latest: 0.3.0`, base/piloto y settings no
  cambian; checkpoint 6 conserva gate read-only separado.
- **Pre-publicación base checkpoint 6 completada:** review 155 ciclo 1 valida
  core live, candidato base/peers/source, ausencia, aliases/settings,
  consumidores lower/latest y dry run neutral sin hallazgos. Publicar base
  conserva gate inmediato independiente.
- **Base M21 publicada/verificada:** Ricard ejecuta el publish exacto y review
  156 ciclo 2 valida base Angular `0.4.0` byte-idéntica, firmada, pública y el
  par core/base exact/`next` con consumidores Angular `22.0.6`/`22.0.7`.
  Core/base `latest: 0.3.0`, piloto y settings no cambian; checkpoint 7 conserva
  gate read-only separado.
- **Piloto M21 publicado/verificado:** reviews 157–158 completan preflight,
  publicación y verificación exacta del piloto `0.2.0`; los tres paquetes
  quedan bajo `next` con consumidores exact/`next` lower/latest verdes.
- **Defaults M21 coordinados:** reviews 159–163 verifican y mueven los aliases
  en orden piloto/base/core. La llegada anticipada del último alias se recupera
  fail-closed sin otra mutación; core/base quedan `next/latest: 0.4.0` y piloto
  `next/latest: 0.2.0`, con ocho matrices registrales verdes.
- **M21 completado:** PLAN-023 revisión 0 y checkpoint 11 quedan Completed tras
  review 164 ciclo 3. Identidad/autoridad, bytes/firmas/metadata, M19 inmutable,
  matriz local, 27 filas SPEC-009, regresión M18, consumidores y documentación
  pasan la revisión final completa con cero hallazgos. No se autoriza otra
  versión, acción registral, Git/GitHub, repositorio, provenance o D-043.
- **Arquitectura actual:** ADR-018 revisión 6 y ADR-026 conservan el
  Corresponding Source histórico, 2FA y los aliases ya verificados, y separan
  PLAN-024 de cualquier futura metadata/publicación OIDC. El repositorio sigue
  privado hasta completar los gates M22; `next` es recomendado y todo `latest`
  observado no implica Stable.
- **Estado de entrega:** PLAN-013 revision 4 publicó y verificó byte a byte core
  y Angular `0.1.0`; ambos exponen `next` y el alias Experimental observado
  `latest`. Checkpoint 7 y M13 cierran con publicación interactiva/2FA, sin
  provenance, workflow ni cambio de settings externo.

## D-041: Resolución estática de referencias locales JSON Schema

- **Estado:** Promoted
- **Pregunta:** ¿Cómo resolver `$defs` y `$ref` estático por JSON Pointer dentro
  del mismo documento antes de normalizar `FormDefinition`?
- **Motivo:** Las referencias requieren separar identidad/provenance de schema,
  detección de ciclos y derivación UI sin activar composición ni resolución
  externa.
- **Promoción aceptada:** Ricard aceptó
  [`review 016`](../reviews/016-m11-resolution-promotion-readiness.md) el 14 de
  julio de 2026. Solo se promueve el slice local estático y la responsabilidad
  estrecha de D-014 necesaria para su capa Internal de resolución.
- **Incluye:** Draft 2020-12 existente, root `$defs`, fragment-only `$ref` por
  JSON Pointer, resolución descriptor-safe/iterativa, provenance inmutable,
  ciclos deterministas, schema original para `SchemaValidator` y
  `FormDefinition` público sin cambios por defecto.
- **Excluye:** `$id`, anchors, `$dynamicRef`, recursos/documentos externos,
  red/callbacks, applicators, condicionales, vocabularios, AST público/versionado,
  render plan, multi-formato, publicación y Stable.
- **Documento actual:**
  [`ADR-016` Accepted](../adrs/016-resolucion-referencias-locales.md).
- **Revisión completa:** [`review 017`](../reviews/017-adr-016-review.md) corrigió
  cinco hallazgos; el ciclo 2 pasó las ocho áreas sin hallazgos.
- **Aceptación:** Ricard aceptó ADR-016 formalmente el 14 de julio de 2026.
- **Documento normativo actual:**
  [`ADR-005 revision 3` Accepted](../adrs/005-politica-dialecto-json-schema.md).
- **Revisión normativa:**
  [`review 018`](../reviews/018-adr-005-revision-3-review.md) corrigió seis
  hallazgos; el ciclo 2 pasó las diez áreas sin hallazgos.
- **Aceptación normativa:** Ricard aceptó ADR-005 revision 3 formalmente el 14
  de julio de 2026.
- **Aceptación de SPEC:** Ricard aceptó
  [`SPEC-004 v0.1.1`](../specs/004-local-reference-resolution.md) el 15 de julio
  de 2026 después de que [`review 019`](../reviews/019-spec-004-review.md) ciclo
  5 pasara sin hallazgos.
- **Plan aprobado:**
  [`PLAN-011 revision 0`](../plans/011-local-reference-resolution.md) fue
  aprobado formalmente y mapea los
  19 escenarios y cinco checkpoints sin cambiar firmas públicas;
  [`review 020`](../reviews/020-plan-011-review.md) ciclo 1 pasó las diez áreas
  sin hallazgos.
- **Entrega:** PLAN-011 revisión 0 completó sus cinco checkpoints; registry,
  decoder, resolución mecánica, integración del compiler, los 19 escenarios,
  paquetes y consumidores pasan. Review 021 ciclo 2 repitió la revisión final
  completa con cero hallazgos.
- **Siguiente gate:** ninguno para D-041; cualquier ampliación requiere promover
  separadamente D-007, D-014 u otra capacidad diferida aplicable.

## D-042: Grupos de presentación estáticos y neutrales

- **Estado:** Promoted
- **Pregunta:** ¿Cómo representar un único primitivo de agrupación estática de
  presentación sin confundirlo con la estructura de datos ni trasladar
  workflow, scopes o estado visual al core?
- **Motivo:** Los árboles normalizados y hosts fijos de M9/M10 prueban la
  separación estructural, pero no constituyen un contrato neutral de layout.
- **Promoción aceptada:** Ricard aceptó formalmente la
  [revisión 022](../reviews/022-m12-advanced-ui-promotion-readiness.md) el 15 de
  julio de 2026. Solo esta responsabilidad estrecha entra en diseño normativo
  M12; D-011 y D-012 permanecen Deferred fuera de ella.
- **Incluye:** un primitivo estático tipo `section`, salida normalizada e
  inmutable, identidad, pertenencia, anidamiento, orden, diagnósticos, semántica
  de label accesible y primera proyección Angular nativa fija.
- **Excluye:** grids, tabs, accordions, wizards, slots, acciones, responsive,
  visibilidad condicional, estado de layout, custom container renderers,
  capability negotiation, scopes declarativos y agrupación por instancia de
  colección.
- **Invariantes:** no cambia paths gestionados, validación, operaciones, dirty,
  touched, foco, estado controlado ni schema entregado al validator; Angular
  consume únicamente output normalizado.
- **Documento actual:**
  [`ADR-017 revision 0`](../adrs/017-grupos-presentacion-estaticos.md) está
  Accepted; [`review 023`](../reviews/023-adr-017-review.md) corrigió dos
  hallazgos documentales y el ciclo 3 pasó las ocho áreas sin hallazgos.
- **Documento observable implementado:**
  [`SPEC-005 v0.1.1`](../specs/005-static-presentation-groups.md) está Accepted
  tras corregir cuatro hallazgos y superar review 024 ciclo 2 sin hallazgos.
- **Plan completado:**
  [`PLAN-012 revision 1`](../plans/012-static-presentation-groups.md) superó
  review 025 ciclo 2 sin hallazgos tras dos correcciones y completó sus cinco
  checkpoints tras una revisión final repetida sin hallazgos.

## D-043: Publicación del repositorio y automatización segura de releases

- **Estado:** Promoted and completed for M23 delivery; ADR-026 revision 1 and
  coordinated ADR-018 revision 7 are Accepted after review 179 cycle 2.
  Completed PLAN-024/review 177 deliver M22 repository sanitization,
  publication, governance, protected controls and fail-closed workflow
  preparation. PLAN-025 revision 0 was Approved after review 180 cycle 2;
  checkpoints 1–6 are complete after reviews 181–186. Review 186 cycle 5
  verifies the complete read-only preflight with all three trust lists empty
  and zero findings. Checkpoint 7 configures and post-observes all three
  stage-only relations, and review 187 cycle 1 passes with zero findings;
  review 188 cycle 2 passes the checkpoint-8 read-only pre-dispatch gate, while
  exact run `30304490264` passes verify/stage on protected `main`. Review 189
  cycle 1 blocks because staged gzip bytes differ from selected candidates
  despite exact TAR/content. Ricard selects exact `.tgz` preservation and
  review 190 cycle 3 validates the local platform-independent gzip correction
  with zero findings. PR #18 merges it into protected `develop@5e60796`, and
  review 191 cycle 2 validates the clean deterministic rebuild with zero
  findings. PR #19 delivers that evidence to protected `develop@e99193b`; its
  required/post-merge CI and review 192 cycle 6 pass. Review evidence delivery
  completes through PR #20 as protected `develop@84d72f9`; both CI gates and
  review 193 cycle 2 pass. PR #21 delivers that reconciliation as
  `develop@ed1cd2d`; PR #22 promotes it as protected `main@028a98c` and PR #23
  reconciles it as `develop@0933924`, with all required/post-merge CI passing.
  Review 194 cycle 3 selects corrected deterministic candidates from exact
  protected `main` with zero findings. Reviews 195–196 verify replacement
  staging after rejection of the obsolete stages. Review 197 cycle 2 completes
  core checkpoint 9, review 198 cycle 1 completes base checkpoint 10 and review
  199 cycle 2 completes pilot checkpoint 11: the full M23 line is public under
  `next` with exact provenance. Review 200 cycle 1 passes checkpoint 12's
  read-only pilot-`latest` preflight. Review 201 cycle 1 corrects three stale
  documentation/policy claims, cycle 2 corrects two final current-state claims
  and cycle 3 verifies the intended pilot alias already active without
  repeating the mutation; base/core aliases, token restrictions and backup
  deletion remain gated. Review 202 cycles 1–2 corrects two stale
  release/current-state claims and cycle 3 repeats the separately executed base
  Angular alias and exact-byte review with zero findings; core, tokens and
  backup deletion remain gated. Review 203 cycles 1–2 corrects four stale
  onboarding/review/current-state claims and cycle 3 repeats the separately
  executed core alias, coordinated default routing, signatures/attestations and
  all eight consumer invocations with zero findings; token restrictions and
  backup deletion remain gated. Review 204 cycle 3 then verifies all three
  public package policies, exact stage-only trusted publishers, account 2FA and
  zero tokens without mutation or findings; the three stronger package-policy
  changes remain separately gated. Review 205 cycle 1 then verifies only the
  core stronger policy, unchanged trust/access/aliases, zero tokens and
  unchanged Angular policies with zero findings; base and pilot remain
  separately gated. Review 206 cycle 2 then verifies core/base strict policies,
  unchanged trust/access/aliases, zero tokens and unchanged pilot policy with
  zero findings; only the pilot remains separately gated. Review 207 cycle 1
  then verifies all three strict policies, unchanged trust/access/aliases and
  zero tokens with zero findings, completing checkpoint 15. Review 208 cycle 1
  corrects four final verification findings, cycle 2 corrects final Approved
  wording, cycle 3 corrects the final public-tree evidence and cycle 4 repeats
  the complete
  closure with zero findings, completing PLAN-025 revision 0 and M23
- **Pregunta:** ¿Cuándo y cómo sanear/publicar GitHub y activar metadata pública,
  trusted publishing OIDC, staged approval, restricciones de tokens y
  provenance verificable?
- **Motivo:** npm exige que `package.json#repository` coincida con GitHub para
  trusted publishing, pero M13 mantiene el repositorio privado y prohíbe
  anunciar una URL inaccesible. Estas medidas solo son coherentes si se deciden
  y verifican conjuntamente.
- **Incluye:** revisión de todo el historial alcanzable, secretos/datos
  personales/documentación interna, rama por defecto, Issues y políticas de
  seguridad/comunidad/contribución; metadata `repository`; workflow en runner
  GitHub-hosted con OIDC; permisos stage-only, aprobación humana 2FA,
  restricciones de tokens y provenance; ruta neutra de publicación y auditoría
  de metadata registral.
- **Excluye:** cambiar runtime/API/SPEC, publicar otra versión, hacer público el
  repositorio, crear workflows o cambiar settings por la mera existencia de
  esta entrada.
- **Frontera promovida:** diseño normativo de saneamiento/historial y contenido
  público, topología/protecciones, políticas comunitarias y de seguridad,
  metadata futura, trusted publishing OIDC y provenance. No promueve SPEC,
  implementación, versión, release ni mutación local/externa.
- **Resolución:** Ricard seleccionó conservar el historial alcanzable tras
  saneamiento y publicar `.ai-docs` solo después de su clasificación y
  saneamiento completos. Publicar el repositorio actual tal cual queda
  rechazado.
- **Plan completado:** PLAN-024 separó política/tooling local, adquisición de
  herramientas, commit/push privado, mirror/auditoría, candidato saneado,
  sustitución de refs/adopción local, visibilidad y settings. Metadata de
  paquetes, npm trusted publishing y la primera release con provenance requieren
  una promoción/plan de release posterior.
- **Cierre M22:** checkpoints 1–9 están completos. Review 177 ciclo 3 verifica
  el clon anónimo, historial/contenido saneado, mapa, recuperación, controles
  GitHub, aislamiento npm y matriz completa sin hallazgos. PRs protegidas
  #9–#11 publicaron, promovieron y reconciliaron el registro exacto; todos sus
  CI pasaron, los árboles finales son idénticos y `main` es ancestro de
  `develop`. El residual de metadata/OIDC/provenance requiere una promoción y
  plan de release futuros.
- **Preparación M23:** [`review 178`](../reviews/178-d043-m23-trusted-publication-promotion-readiness.md)
  ciclo 2 pasa sin hallazgos; Ricard seleccionó la opción A: PATCH coordinado
  core/base `0.4.1` y piloto `0.2.1`, peer floors `^0.4.0` preservados, trusted
  publisher stage-only, aprobaciones 2FA por paquete y provenance automática.
  [`ADR-026 revision 1`](../adrs/026-public-repository-and-secure-releases.md) y
  [`ADR-018 revision 7`](../adrs/018-licencia-dual-publicacion-experimental.md)
  quedan Accepted tras review 179 ciclo 2. PLAN-025 revisión 0 quedó Approved
  tras review 180 ciclo 2; checkpoints 1–3 quedan completos tras reviews
  181–183 ciclo 2. Checkpoint 4 entrega PR #13 a `develop@39a0d60`, pasa CI
  requerida/post-merge y review 184 ciclo 1, y produce candidatos limpios
  byte-idénticos con ese `sourceCommit`. Checkpoint 5 promueve a
  `main@4bcb6ea`, reconcilia a `develop@6d00ed0` y selecciona candidatos
  byte-idénticos tras review 185 ciclo 4. Review 186 ciclo 3 corrige la matriz
  histórica y ciclo 5 verifica el preflight completo, incluidas las tres
  listas trust vacías, sin hallazgos; checkpoint 6 queda completo y toda acción
  npm permanece inactiva. Checkpoint 7 configura y post-observa core, base
  Angular y Angular Aria por separado; review 187 ciclo 1 pasa sin hallazgos y
  review 188 ciclo 2 pasa el gate read-only previo al dispatch. Todo staging
  queda bloqueado por review 189 R189-F01: gzip difiere entre macOS/Linux aunque
  TAR y contenido son exactos. Ricard selecciona preservar identidad `.tgz`;
  review 190 ciclo 3 valida sin hallazgos la corrección gzip determinista local
  y deja entrega protegida, reselección, rechazo de stages y nuevo staging bajo
  sus gates separados. PR #18 entrega a `develop@5e60796`; review 191 ciclo 2
  valida sin hallazgos dos generaciones limpias, evidencia de source exacta,
  source rebuilds y seguridad. PR #19 entrega la evidencia a
  `develop@e99193b`; su CI requerida/post-merge y review 192 ciclo 6 pasan sin
  hallazgos. PR #20 entrega esa evidencia a `develop@84d72f9`; ambas CI y
  review 193 ciclo 2 pasan. PR #21 entrega la reconciliación como
  `develop@ed1cd2d`; PR #22 promueve a `main@028a98c` y PR #23 reconcilia a
  `develop@0933924`, con todas las CI requeridas/post-merge superadas. Review
  194 ciclo 3 selecciona desde ese `main` los bytes deterministas corregidos
  sin hallazgos. Ricard rechaza por separado los tres stages obsoletos; reviews
  195–196 verifican el reemplazo exacto. Review 197 ciclo 2 verifica core
  `0.4.1` público bajo `next`; review 198 ciclo 1 verifica base `0.4.1`, peer,
  firma, provenance y consumidores exactos. Review 199 ciclo 2 verifica piloto
  `0.2.1`, contrato, provenance y matriz exact/`next`; aliases, tokens y demás
  acciones permanecen gated. Review 200 ciclo 1 pasa el preflight read-only de
  `latest` piloto sin mutación. Review 201 ciclo 1 corrige tres afirmaciones
  documentales/políticas obsoletas, ciclo 2 corrige dos resúmenes finales y
  ciclo 3 verifica después el alias piloto ya activo y el estado mixto exacto.

## D-044: Plataforma multi-framework de referencia, consumo y demostración

- **Estado:** Implemented; ADR-020 revision 0 and completed PLAN-016 revision 0
  delivered the promoted M15 boundary after final review 063 cycle 2 passed
  with zero findings on 17 July 2026
- **Resolución:**
  [Review 053](../reviews/053-d044-m15-reference-platform-promotion-readiness.md)
  promotes only its section 3 boundary: one private neutral scenario catalog,
  one first Angular 22 shell and isolated compatibility evidence.
- **Pregunta:** ¿Cómo compartir escenarios neutrales entre consumidores
  standard/sin framework, Angular, React, Vue y futuros targets, manteniendo
  shells independientes que validen el producto en uso real sin convertir la
  plataforma en fuente de verdad del core ni ocultar defectos de empaquetado?
- **Motivo:** Los consumidores limpios actuales prueban contratos, tarballs y
  compatibilidad, pero no permiten revisar de forma interactiva la experiencia,
  el flujo controlado, la accesibilidad ni ejemplos completos de integración.
- **Frontera promovida:** Plataforma privada al repositorio dentro de `apps/`
  con un catálogo neutral compartido de schemas/UI Schemas, valores iniciales y
  baseline, operaciones/issues esperados, metadata explicativa y fixtures. Cada
  target tiene un shell independiente, importa exclusivamente entry points
  Public y presenta paneles de schema/UI/value/baseline/operaciones/issues y
  ejemplos copiables. La entrega implementada incluye el catálogo y un shell
  Angular 22 standalone; complementa, no sustituye, los consumidores limpios.
- **Límites de reutilización:** Compartir contratos de escenario y evidencia,
  no lifecycle, reactividad, componentes, registries, templates ni una
  abstracción visual común. El catálogo no es paquete público ni puede adquirir
  runtime semantics. El target standard/DOM necesita decidir si será un ejemplo
  directo sobre core o un adapter soportado; React, Vue y otros shells solo se
  incorporan después de aceptar su propia frontera de adapter.
- **Selección de review 053:** `apps/*` privados; catálogo y shells con ownership
  separado; builder oficial Angular; workspace para desarrollo y consumidores
  limpios para tarballs/npm/matriz; smoke Playwright/Chromium; snippets
  build-checked; hosting y shells posteriores bajo gates propios. No activa
  persistencia, backend, D-011/D-012, D-026, D-033, D-035 ni otra capacidad
  diferida.
- **Condición satisfecha:** PLAN-015 está completo; review 053 aceptó la
  promoción estrecha, ADR-020 revisión 0 cerró su arquitectura y PLAN-016
  revisión 0 completó checkpoints 1–8 tras review 063 ciclo 2. El alcance no se
  amplía a shells posteriores.
- **Documento entregado:** PLAN-016 revisión 0 está Completed. Cada shell
  posterior requiere su propio alcance aceptado. No requiere SPEC nueva
  mientras no cambie comportamiento público.

## D-045: Familias de compatibilidad Angular legacy

- **Estado:** Deferred; no existe soporte declarado fuera del rango Angular
  `>=22.0.6 <23.0.0`
- **Pregunta:** ¿Qué majors Angular anteriores a 19 deben soportarse y mediante
  qué familias de código, paquetes/entry points, builds y matrices sin degradar
  el adaptador moderno basado en Signal Forms?
- **Motivo:** La adopción enterprise puede requerir versiones antiguas, pero el
  artefacto actual se compila con Angular 22 y usa APIs que no permiten ampliar
  honestamente el peer range hacia atrás. El floor exacto y la demanda real aún
  no están seleccionados.
- **Dirección futura no normativa:** Reutilizar el catálogo neutral D-044 y
  mantener un shell canónico por familia de integración source-compatible,
  acompañado por consumidores aislados para los extremos de cada matriz. No
  duplicar una aplicación completa por patch o major compatible.
- **Retomar cuando:** Exista un consumidor enterprise concreto o una selección
  explícita de majors objetivo, y la base compartida M15 esté implementada.
- **Documento esperado:** revisión de promoción propia; después, si procede,
  ADR que revise ADR-009/010, límites de paquetes/entry points, toolchains,
  mantenimiento y coexistencia. Requiere SPEC si cambia comportamiento Public
  observable.

## D-046: Shell de referencia Standard/DOM con consumo directo del core

- **Estado:** Implemented en M16; ADR-021 revisión
  1 quedó Accepted el 18 de julio de 2026 tras review 090 ciclo 3 sin hallazgos.
  PLAN-018 revisión 1 quedó Approved tras review 091 ciclo 3 sin hallazgos y
  final review 095 ciclo 2 completó sus checkpoints 1–8 y M16 sin hallazgos el
  18 de julio de 2026
- **Pregunta:** ¿Cómo demostrar todos los escenarios aceptados en una
  aplicación browser sin framework que consuma directamente el core Public,
  sin convertir el ejemplo en un adaptador o producto DOM soportado?
- **Motivo:** El shell Angular confirma la primera integración, pero no prueba
  por sí solo que un consumidor pueda componer compiler, runtime, operaciones y
  snapshots sin framework. El usuario seleccionó Standard/DOM como siguiente
  target antes de React y Vue.
- **Frontera promovida:** Un proyecto privado `apps/reference-standard`,
  dependiente solo del core Public y del catálogo neutral, con bootstrap,
  estado, renderizado DOM, lifecycle, snippets, build, tests y smoke Chromium
  propios. Cubre los seis escenarios actuales sin compartir controller, UI,
  estilos ni semántica runtime con Angular.
- **Exclusiones:** No crea adapter/package/entry point Public, Web Components,
  D-026, D-035, React, Vue, legacy Angular, SSR/hydration, hosting, release ni
  cambios de SPEC.
- **Resolución de preparación:**
  [`review 075`](../reviews/075-d046-m16-standard-dom-promotion-readiness.md)
  promovió la frontera y [`ADR-021`](../adrs/021-shell-standard-dom-core-directo.md)
  revisión 1 fija la arquitectura Accepted. PLAN-018 revisión 0 pasó review 077
  ciclo 1 sin hallazgos y sus checkpoints 1–4 están completos. PLAN-018 revisión
  1 incorpora la paridad de experiencia/configuración y review 091 ciclo 3 la
  dejó sin hallazgos; Ricard la aprobó formalmente el 18 de julio. Checkpoint 5
  completó editores/configuración y aislamiento tras review 092 ciclo 2;
  checkpoint 6 completó workspace/evidencia/snippets tras review 093 ciclo 1.
  Checkpoint 7 completó Chromium/aislamiento/documentación tras review 094 ciclo 2. Final review 095 ciclo 2 completó checkpoint 8, PLAN-018 revisión 1 y M16
  tras repetir catorce áreas y toda la matriz sin hallazgos. Las acciones
  externas posteriores conservan gates separados.

## D-047: Integración síncrona reutilizable de validación JSON Schema con Ajv

- **Estado:** Implemented en M17; ADR-022 revisión 1, SPEC-007 v0.1.0 y
  PLAN-019 revisión 1 quedaron completados tras review 089 ciclo 2 sin hallazgos
  el 17 de julio de 2026
- **Pregunta:** ¿Cómo proporcionar validación Draft 2020-12 real y sustituible
  a consumidores framework-neutral y shells de referencia sin convertir Ajv en
  dependencia o semántica del core?
- **Motivo:** Los validadores del catálogo codifican los escenarios originales
  y no pueden validar constraints soportados añadidos mediante el editor. La
  recompilación actualiza el formulario, pero no esa lógica fija.
- **Frontera promovida:** Paquete workspace privado
  `@rabassoft/schema-engine-validator-ajv`, factory síncrona Public Experimental
  sobre el puerto existente, Ajv 8.20.0/Draft 2020-12 con opciones deterministas
  no mutantes, normalización immutable de issues e integración en los shells
  Angular y Standard.
- **Exclusiones:** Core validator interno, async/partial validation, formats,
  carga o resolución remota, bridges de framework, nuevo dialecto, publicación,
  versión de release, repositorio público o automatización externa.
- **Resolución de preparación:**
  [`review 082`](../reviews/082-d047-m17-ajv-validator-promotion-readiness.md)
  promovió el diseño; ADR-022/SPEC-007 fijaron el contrato y PLAN-019 implementó
  el paquete y ambos shells. Publicación, commit y push no están autorizados.

## 4. Próximo trabajo de decisión

1. **M22 repository delivery:** PLAN-024 y checkpoints 1–9 están canónicamente
   completados tras review 177 ciclo 3 y PRs protegidas #9–#11.
2. **M23 delivery:** PLAN-025 revisión 0 y M23 están Completed tras review 208
   ciclo 4. Core/base `0.4.1` y piloto `0.2.1` están verificados exactos y
   mediante `next`, `latest` y resolución unqualified, con provenance y
   políticas estrictas. Otra release y el backup privado permanecen gated.
3. **M20 delivery:** SPEC-009 v0.1.0 y PLAN-022 revisión 0 permanecen
   Completed tras review 144 ciclo 3; constituyen el contrato/comportamiento que
   M21 pretende entregar sin ampliarlo.
4. **M19 release:** ADR-018 revisión 4 y PLAN-021 revisión 0 permanecen
   Completed tras review 132 ciclo 4. Core/base `0.3.0` y piloto `0.1.0` están
   verificados bajo `next`, `latest` y resolución unqualified. Toda acción
   externa posterior sigue separada.
5. **M18 delivery:** SPEC-008 v0.1.0 y ADR-023/ADR-024 permanecen Accepted;
   PLAN-020 revisión 0 y M18 están Completed tras review 113 ciclo 2 sin
   hallazgos.
6. **D-043:** el slice promovido está completado por M22/PLAN-024 y
   M23/PLAN-025. Publicación OIDC/provenance, aliases coordinados y restricciones
   de tokens están verificados.
7. **D-045:** conserva Angular legacy como trabajo futuro sin versión mínima ni
   familia de artefactos seleccionada.
8. **D-046/M16:** checkpoints 1–8 y el prerrequisito M17 están completos;
   ADR-021 revisión 1 está Accepted y PLAN-018 revisión 1 está Completed tras
   review final 095 ciclo 2 sin hallazgos.

[`ROADMAP.md`](../project/ROADMAP.md) distingue el gate G0 completado de la
secuencia posterior. ADR-013 y PLAN-008 completaron únicamente la preparación
de M8; D-034/D-040 permanecen limitadas a M13, D-005 está implementado
dentro del alcance de M9 aunque conserva su estado registral Promoted, D-006
queda Promoted con M10 completado por PLAN-010, D-041 queda Promoted con M11
completado por PLAN-011 y D-042 queda Promoted con su slice estrecho M12
implementado por PLAN-012.
Todas las demás entradas mantienen su estado hasta una promoción y aprobación
explícitas.

## 5. Historial

| Fecha      | Cambio                                                                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 03-08-2026 | PLAN-034 revision 0 y M32 quedan Completed tras review 313 ciclo 2 repetir matriz congelada, 22 filas y Chromium 14+17 sin hallazgos.                  |
| 03-08-2026 | PLAN-034 checkpoint 5 completa SPEC-018 fila 21 tras review 312 ciclo 3; checkpoint 6 queda siguiente, sin release/Git.                                |
| 03-08-2026 | PLAN-034 checkpoint 4 completa SPEC-018 filas 19–20 tras review 311 ciclo 2; checkpoint 5 queda siguiente, sin release/Git.                            |
| 03-08-2026 | PLAN-034 checkpoint 3 completa SPEC-018 fila 18 tras review 310 ciclo 1 pasar diez áreas sin hallazgos; checkpoint 4 queda siguiente.                  |
| 03-08-2026 | PLAN-034 checkpoint 2 completa SPEC-018 filas 10–17 tras review 309 ciclo 2 pasar doce áreas sin hallazgos; checkpoint 3 queda siguiente.              |
| 03-08-2026 | PLAN-034 checkpoint 1 completa SPEC-018 filas 1–9 tras review 308 ciclo 2 pasar doce áreas sin hallazgos; checkpoint 2 queda siguiente.                |
| 03-08-2026 | PLAN-034 revision 0 queda Approved tras review 307 ciclo 3 pasar doce áreas y ownership exacto de 22 filas; autoriza checkpoints 1–6, sin release/Git. |
| 03-08-2026 | SPEC-018 v0.1.0 queda Accepted tras review 306 ciclo 2 pasar quince áreas y 22 filas sin hallazgos; autoriza solo PLAN-034, sin código.                |
| 03-08-2026 | ADR-035 revision 0 queda Accepted tras review 305 ciclo 2 pasar doce áreas sin hallazgos; autoriza solo SPEC-018, sin plan/código.                     |
| 03-08-2026 | Ricard selecciona D-018/M32; review 304 ciclo 2 promueve solo grupos planos all/any de condiciones M30 y reserva ADR-035, sin SPEC/plan/código.        |
| 03-08-2026 | PLAN-033 revision 0 y M31 quedan Completed tras review 303 ciclo 2 repetir matriz congelada, 26 filas y ambos Chromium sin hallazgos; sin release/Git. |
| 03-08-2026 | PLAN-033 revision 0 queda Approved tras review 296 ciclo 2; autoriza checkpoints 1–7 en orden, sin release/Git.                                        |
| 03-08-2026 | SPEC-017 v0.1.0 queda Accepted tras review 295 ciclo 2 pasar 26 filas sin hallazgos; autoriza solo PLAN-033, sin código.                               |
| 03-08-2026 | ADR-005 revision 8 queda Accepted tras review 294 ciclo 2 sin hallazgos; autoriza solo SPEC-017, sin plan/código.                                      |
| 03-08-2026 | ADR-034 revision 0 queda Accepted tras review 293 ciclo 3 sin hallazgos; autoriza solo ADR-005 revision 8, sin SPEC/plan/código.                       |
| 03-08-2026 | Review 292 ciclo 3 corrige el gate ADR-005r8 y promueve D-006/M31 solo para ADR-034; sin SPEC, contrato ni código.                                     |
| 03-08-2026 | PLAN-032 revision 1 y M30 quedan Completed tras review 291 ciclo 1 repetir matriz congelada y 24 filas sin hallazgos; sin release/Git.                 |
| 03-08-2026 | PLAN-032 revision 1 queda Approved tras review 284 ciclo 1 sin hallazgos; formaliza ejecución autónoma de checkpoints 1–7 con paradas acotadas.        |
| 03-08-2026 | SPEC-016 v0.1.1 queda Accepted tras review 283 ciclo 1 sin hallazgos; C-002 omite `actualType` en índices ausentes/no enumerables.                     |
| 03-08-2026 | PLAN-032 revision 0 queda Approved tras review 282 ciclo 1 sin hallazgos; autoriza checkpoints 1–7 en orden, sin release/Git.                          |
| 03-08-2026 | SPEC-016 v0.1.0 queda Accepted tras review 281 ciclo 3 pasar diecisiete áreas y 24 filas sin hallazgos; autoriza solo PLAN-032, sin código.            |
| 03-08-2026 | ADR-033 revision 0 queda Accepted tras review 280 ciclo 2 sin hallazgos; autoriza solo preparar/revisar SPEC-016, sin plan ni código.                  |
| 03-08-2026 | Ricard selecciona D-018/M30; review 279 ciclo 2 promueve visibilidad/enabled por igualdad y deja snapshots item en defaults constantes.                |
| 03-08-2026 | PLAN-031 revision 0 y M29 quedan Completed tras review 278 ciclo 2 repetir la matriz completa y las 21 filas sin hallazgos; sin release/Git.           |
| 03-08-2026 | PLAN-031 revision 0 queda Approved tras review 272 ciclo 2 sin hallazgos; autoriza checkpoints 1–6 en orden, sin release ni Git.                       |
| 03-08-2026 | SPEC-015 v0.1.0 queda Accepted tras review 271 ciclo 1 sin hallazgos; autoriza solo preparar/revisar PLAN-031, sin implementación.                     |
| 03-08-2026 | Ricard selecciona D-039/M29; ADR-032 revision 0 queda Accepted tras review 270 ciclo 2 sin hallazgos y autoriza solo preparar SPEC-015.                |
| 03-08-2026 | Review 269 compara candidatos post-M28 sin hallazgos; recomienda D-039 solo como default técnico y deja selección de producto pendiente.               |
| 03-08-2026 | PLAN-030 revision 0 y M28 quedan Completed tras review 268 ciclo 2 repetir matriz completa y 21 filas sin hallazgos; sin release/Git.                  |
| 03-08-2026 | PLAN-030 checkpoints 2–5 completan reviews 264–267 sin hallazgos; las 21 filas quedan cubiertas y checkpoint 6 de cierre está activo.                  |
| 03-08-2026 | PLAN-030 checkpoint 1 completa review 263 ciclo 4 sin hallazgos y 587 tests core; checkpoint 2 queda como siguiente acción.                            |
| 03-08-2026 | PLAN-030 revision 0 queda Approved tras review 262 ciclo 2 sin hallazgos; solo checkpoint 1 queda activo, sin acciones externas/Git.                   |
| 03-08-2026 | PLAN-030 revision 0 Draft distribuye las 21 filas de SPEC-014 en seis checkpoints; revisión/aprobación pendiente, sin implementación.                  |
| 03-08-2026 | SPEC-014 v0.1.0 queda Accepted tras review 261 ciclo 5; autoriza solo preparar/revisar PLAN-030, sin implementación activa.                            |
| 03-08-2026 | SPEC-014 v0.1.0 Draft supera review 261 ciclo 5 con cero hallazgos; aceptación pendiente, sin plan/implementación activa.                              |
| 03-08-2026 | ADR-005 revision 7 queda Accepted tras review 260 ciclo 5; autoriza solo preparar/revisar la SPEC M28, sin plan/implementación activa.                 |
| 03-08-2026 | ADR-005 revision 7 Draft supera review 260 ciclo 5 con cero hallazgos; aceptación pendiente, sin SPEC/plan/implementación activa.                      |
| 03-08-2026 | ADR-031 revision 0 queda Accepted tras review 259 ciclo 5; autoriza solo preparar/revisar ADR-005 revision 7, sin SPEC/plan/implementación activa.     |
| 03-08-2026 | Draft ADR-031 supera review 259 ciclo 5 con cero hallazgos; aceptación formal pendiente, sin ADR-005r7/SPEC/plan/implementación activa.                |
| 03-08-2026 | Ricard selecciona el slice D-007 recomendado; M28 reserva ADR-031 solo para diseño estático object-`allOf`, sin SPEC/plan/implementación activa.       |
| 03-08-2026 | Review 258 ciclo 2 recomienda un slice estático de objetos con `allOf`; D-007 sigue Deferred hasta selección y no existe M28/ADR/contrato activo.      |
| 02-08-2026 | SPEC-013 v0.1.1 y PLAN-029 revision 1 resuelven C-001 tras reviews 250/251 sin cambiar el alcance; checkpoint 1 se reanuda.                            |
| 02-08-2026 | PLAN-029 revision 0 queda Approved tras review 248 ciclo 3; checkpoint 1 activa la implementación M27 sin export Public todavía.                       |
| 02-08-2026 | SPEC-013 v0.1.0 queda Accepted bajo autorización tras review 247 ciclo 3; PLAN-029 se puede preparar/revisar, sin implementación activa.               |
| 02-08-2026 | Draft SPEC-013 v0.1.0 supera review 247 ciclo 3 con cero hallazgos; aceptación formal pendiente y ninguna implementación activa.                       |
| 02-08-2026 | ADR-030 revision 0 queda Accepted tras review 246 ciclo 2; se autoriza preparar/revisar SPEC-013, sin activar contrato ni implementación.              |
| 02-08-2026 | ADR-030 revision 0 supera review 246 ciclo 2 con cero hallazgos; la aceptación formal M27 queda pendiente y no hay contrato/implementación activa.     |
| 02-08-2026 | Review 245 ciclo 1 selecciona D-038 para diseño arquitectónico M27 acotado; ADR-030 es el siguiente gate y no hay contrato/implementación activa.      |
| 02-08-2026 | PLAN-028/M26 completa sus seis checkpoints tras review 244 ciclo 2; el siguiente gate es seleccionar otra capacidad Deferred acotada.                  |
| 02-08-2026 | PLAN-028 checkpoint 5 completa escenario/efectos/paridad Angular-Standard tras review 243 ciclo 5; checkpoint 6 global es el siguiente gate.           |
| 02-08-2026 | PLAN-028 checkpoint 4 completa forwarding/Signal/retry Angular tras review 242 ciclo 2; escenario compartido es el siguiente gate.                     |
| 02-08-2026 | PLAN-028 checkpoint 3 completa normalización, composición, scopes, sharing, retry/disposal tras review 241 ciclo 2; Angular es el siguiente gate.      |
| 27-07-2026 | Review 189 bloquea checkpoint 8: tres stages sin aprobar tienen TAR/contenido exactos, pero `.tgz` distinto por gzip macOS/Linux.                      |
| 27-07-2026 | Run M23 `30304490264` pasa verify en 4m44s y espera aprobación separada de `npm-publish`; stage aún no inicia.                                         |
| 27-07-2026 | PLAN-025 checkpoint 8 lanza run exacto `30304490264` en `main@4bcb6ea`; aprobación de entorno y staging siguen gated.                                  |
| 27-07-2026 | Review 188 ciclo 2 pasa el gate read-only previo al dispatch M23; source, workflow, entorno, trust, candidatos y registro son exactos.                 |
| 27-07-2026 | Review 187 ciclo 1 completa checkpoint 7 con las tres relaciones stage-only exactas; stages y versiones M23 siguen ausentes.                           |
| 27-07-2026 | PLAN-025 checkpoint 7 configura y post-observa la relación stage-only de base Angular; core no deriva y Angular Aria sigue vacía.                      |
| 27-07-2026 | PLAN-025 checkpoint 7 configura y post-observa solo la relación trusted publisher stage-only de core; ambas relaciones Angular siguen vacías.          |
| 27-07-2026 | Review 186 ciclo 5 confirma las tres listas trust vacías y completa checkpoint 6 sin hallazgos ni mutación.                                            |
| 27-07-2026 | Review 186 ciclo 4 verifica el preflight autenticado salvo tres lecturas trust con 2FA; sin mutación externa.                                          |
| 27-07-2026 | PLAN-025 checkpoint 5 promueve/reconcilia ramas protegidas y review 185 selecciona candidatos exactos de `main@4bcb6ea`; npm sigue gated.              |
| 27-07-2026 | PLAN-025 checkpoint 4 entrega PR #13 a `develop@39a0d60`; review 184 valida rebuild limpio byte-idéntico y deja `main`/npm gated.                      |
| 20-07-2026 | Review 163 ciclo 3 completa checkpoint 10 tras recuperación: core/base `next/latest: 0.4.0`, piloto `0.2.0` y ocho matrices pasan.                     |
| 20-07-2026 | Review 162 ciclo 2 completa checkpoint 9: base `latest` pasa a `0.4.0`; piloto permanece `0.2.0`, core `0.3.0` y settings no cambian.                  |
| 20-07-2026 | Review 161 ciclo 5 completa el preflight read-only de checkpoint 9 sin hallazgos; solo el dist-tag base `latest` espera aprobación inmediata.          |
| 20-07-2026 | Review 160 ciclo 3 completa checkpoint 8: solo piloto `latest` pasa a `0.2.0`; core/base defaults y todo settings permanecen sin cambios.              |
| 20-07-2026 | Review 159 ciclo 1 completa el preflight read-only de checkpoint 8 sin hallazgos; solo el dist-tag piloto `latest` espera aprobación inmediata.        |
| 20-07-2026 | Review 158 ciclo 2 completa checkpoint 7: piloto `0.2.0` byte-idéntico bajo `next`; todos los `latest` y settings permanecen sin cambios.              |
| 20-07-2026 | Review 157 ciclo 2 completa preflight piloto checkpoint 7 sin hallazgos; piloto `0.2.0` sigue sin publicar y conserva gate inmediato separado.         |
| 20-07-2026 | Review 156 ciclo 2 completa checkpoint 6: base Angular `0.4.0` byte-idéntico bajo `next`; `latest`, piloto y settings permanecen sin cambios.          |
| 20-07-2026 | Review 155 ciclo 1 completa preflight base checkpoint 6 sin hallazgos; Angular `0.4.0` sigue sin publicar y conserva gate inmediato separado.          |
| 20-07-2026 | Review 154 ciclo 5 completa checkpoint 5: core `0.4.0` byte-idéntico bajo `next`; `latest`, base, piloto y settings permanecen sin cambios.            |
| 20-07-2026 | Review 153 ciclo 3 completa preflight checkpoint 5 sin hallazgos; core `0.4.0` sigue sin publicar y conserva aprobación inmediata separada.            |
| 20-07-2026 | PLAN-023 checkpoint 5 read-only se pausa en identidad/perfil/org/access `E401`; Ricard restaura sesión y no se consultó paquete/tag ni mutó npm.       |
| 20-07-2026 | PLAN-023 checkpoint 4 fija/sube `07755b4` y selecciona candidatos limpios byte-idénticos tras review 152 ciclo 3; registry sigue gated.                |
| 20-07-2026 | PLAN-023 checkpoint 3 completa matriz/27 filas/candidatos dirty-tree/dry runs tras review 151 ciclo 2; checkpoint 4 Git queda gated.                   |
| 20-07-2026 | PLAN-023 checkpoint 2 completa notas/onboarding/checks M21 tras review 150 ciclo 5; sin candidato, lockfile, Git, registry ni acción externa.          |
| 20-07-2026 | PLAN-023 checkpoint 1 completa descriptor/manifests/tooling M21 tras review 149 ciclo 2; no crea candidato ni toca Git/npm.                            |
| 20-07-2026 | PLAN-023 revisión 0 queda Approved tras review 148 ciclo 2; autoriza solo checkpoints locales 1–3 y mantiene Git/npm gated.                            |
| 20-07-2026 | ADR-018 revisión 5 queda Accepted tras review 147 ciclo 5; autoriza solo PLAN-023 para M21 `0.4.0`/piloto `0.2.0`.                                     |
| 20-07-2026 | Review 146 ciclo 3 promueve solo ADR-018 revisión 5 para M21 core/base `0.4.0` y piloto `0.2.0`; todo cambio/acción sigue gated.                       |
| 19-07-2026 | PLAN-022/M20 completan ocho checkpoints y 27 filas tras review 144 ciclo 3; no cambian dependencia, versión, release, Git ni estado externo.           |
| 19-07-2026 | PLAN-022 revisión 0 queda Approved tras review 136 ciclo 2; autoriza ocho checkpoints M20 locales sin dependencia, versión, Git ni acción externa.     |
| 19-07-2026 | SPEC-009 v0.1.0 queda Accepted tras review 135 ciclo 6; cierra el contrato local M20 y autoriza únicamente preparar/revisar PLAN-022.                  |
| 19-07-2026 | ADR-025 revisión 0 queda Accepted tras review 134 ciclo 4; autoriza únicamente preparar/revisar SPEC-009 para el slice local D-011/M20.                |
| 19-07-2026 | Review 133 ciclo 3 promueve solo el diseño D-011/M20 de bosques locales nested/item y autoriza redactar/revisar ADR-025.                               |
| 19-07-2026 | PLAN-021/M19 completan checkpoint 11 tras review 132 ciclo 4; matriz completa y 22 filas pasan sin hallazgos, sin nueva mutación externa.              |
| 19-07-2026 | PLAN-021 checkpoint 10 coordina core/base `next/latest: 0.3.0` tras review 131 ciclo 1; `latest`/unqualified pasan y checkpoint 11 sigue gated.        |
| 19-07-2026 | PLAN-021 checkpoint 10 pre-transition pasa review 130 ciclo 1; solo el dist-tag core `latest` exacto espera ejecución manual de Ricard.                |
| 19-07-2026 | PLAN-021 checkpoint 9 mueve solo base `latest` a `0.3.0` tras review 129 ciclo 1; core queda `latest: 0.2.0` en la ventana mixta prevista.             |
| 19-07-2026 | PLAN-021 checkpoint 9 pre-transition pasa review 128 ciclo 1; solo el dist-tag base `latest` exacto espera aprobación inmediata.                       |
| 19-07-2026 | PLAN-021 checkpoint 8 reobserva y retiene el `latest: 0.1.0` piloto sin mutación tras review 127 ciclo 2; checkpoint 9 sigue gated.                    |
| 19-07-2026 | PLAN-021 checkpoint 7 completa piloto `0.1.0` exacto/`next` tras review 126 ciclo 4; npm creó su `latest`, pendiente de checkpoint 8 read-only.        |
| 19-07-2026 | PLAN-021 checkpoint 7 pre-publication pasa review 125 ciclo 5; solo el publish piloto exacto espera aprobación inmediata.                              |
| 19-07-2026 | PLAN-021 checkpoint 6 completa base Angular `0.3.0` bajo `next` tras review 124 ciclo 2; ambos `latest` siguen `0.2.0` y piloto ausente.               |
| 19-07-2026 | PLAN-021 checkpoint 6 pre-publication pasa review 123 ciclo 3; solo el publish base exacto espera aprobación inmediata.                                |
| 19-07-2026 | PLAN-021 checkpoint 5 completa core `0.3.0` bajo `next` tras review 122 ciclo 3; `latest` sigue `0.2.0` y checkpoint 6 queda gated.                    |
| 19-07-2026 | PLAN-021 checkpoint 5 pre-publication pasa review 121 ciclo 2; solo el publish core exacto espera aprobación inmediata.                                |
| 19-07-2026 | PLAN-021 checkpoint 5 read-only se pausa en `npm whoami` `E401`; Ricard debe restaurar la sesión y no se intentó ninguna mutación.                     |
| 19-07-2026 | PLAN-021 checkpoint 4 fija/sube `ce3ef3d` y selecciona candidatos limpios byte-idénticos tras review 120 ciclo 3; registry sigue gated.                |
| 19-07-2026 | PLAN-021 checkpoint 3 completa gate local/candidatos/dry runs/22 filas tras review 119 ciclo 5; checkpoint 4 Git queda gated.                          |
| 19-07-2026 | PLAN-021 checkpoint 2 completa release notes/onboarding/checks M19 tras review 118 ciclo 3; checkpoint local 3 sigue sin Git ni registry.              |
| 19-07-2026 | PLAN-021 checkpoint 1 completa descriptor/tooling/evidence M19 tras review 117 ciclo 2; checkpoint local 2 sigue sin Git ni acción externa.            |
| 19-07-2026 | PLAN-021 revisión 0 queda Approved tras review 116 ciclo 3; checkpoint local 1 es el siguiente paso y todos los gates Git/npm siguen separados.        |
| 19-07-2026 | ADR-018 revisión 4 queda Accepted tras review 115 ciclo 4; PLAN-021 es el siguiente gate y no hay acción externa autorizada.                           |
| 19-07-2026 | Review 114 ciclo 2 selecciona M19 y promueve solo ADR-018 revisión 4 para la release coordinada `0.3.0`/piloto `0.1.0`.                                |
| 18-07-2026 | PLAN-020/M18 completan checkpoint 8 y las 22 filas tras review 113 ciclo 2 sin hallazgos; no queda implementación activa.                              |
| 18-07-2026 | PLAN-020 checkpoint 7 completa lower/latest clean consumers y las 22 filas tras review 112 ciclo 1.                                                    |
| 18-07-2026 | PLAN-020 checkpoint 7 local pasa review 111 ciclo 3; solo la lane latest-compatible registry-backed permanece gated.                                   |
| 18-07-2026 | PLAN-020 checkpoint 6 completa el piloto Aria aislado y su boundary de tema tras review 110 ciclo 2.                                                   |
| 18-07-2026 | PLAN-020 checkpoint 5 resuelve Aria/CDK 22.0.5 y pasa review 109 ciclo 1 sin hallazgos.                                                                |
| 18-07-2026 | PLAN-020 checkpoint 5 local pasa review 108 ciclo 3; versiones/esqueleto están listos y el comando Aria/CDK conserva su gate de red separado.          |
| 18-07-2026 | PLAN-020 checkpoint 4 completa escenario/proyección Standard y Angular independiente tras review 107 ciclo 5; checkpoint 5 es la siguiente acción.     |
| 18-07-2026 | PLAN-020 checkpoint 3 completa SPI Angular base/proyección nativa tras review 106 ciclo 3; checkpoint 4 es la siguiente acción.                        |
| 18-07-2026 | PLAN-020 checkpoint 2 completa validación manual/invariancia runtime tras review 105 ciclo 3; checkpoint 3 es la siguiente acción.                     |
| 18-07-2026 | PLAN-020 checkpoint 1 completa contratos/compiler/fixtures core tras review 104 ciclo 3; checkpoint 2 es la siguiente acción.                          |
| 18-07-2026 | PLAN-020 revisión 0 queda Approved tras review 103 ciclo 2; checkpoint 1 es la siguiente acción y los gates externos siguen separados.                 |
| 18-07-2026 | SPEC-008 v0.1.0 queda Accepted tras review 102 ciclo 5; PLAN-020 es el siguiente gate y aún no autoriza implementación.                                |
| 18-07-2026 | ADR-024 revisión 1 queda Accepted tras review 101 ciclo 4; Angular Aria 22 es el único piloto y SPEC-008 es el siguiente gate.                         |
| 18-07-2026 | Review 100 ciclo 4 promueve el seam Angular Experimental estrecho de D-025; ADR-024 es el siguiente gate y SPEC-008 sigue bloqueada.                   |
| 18-07-2026 | ADR-023 revisión 1 queda Accepted tras review 099 ciclo 3; D-025 promotion readiness es el siguiente gate y SPEC-008 continúa bloqueada.               |
| 18-07-2026 | Review 098 ciclo 2 promueve el slice estático neutral de D-011 para ADR-023/M18; D-025 conserva un gate separado antes de SPEC/plan.                   |
| 18-07-2026 | PLAN-018 revisión 1/D-046/M16 quedan Completed; review final 095 ciclo 2 repite catorce áreas y toda la matriz sin hallazgos.                          |
| 18-07-2026 | PLAN-018 checkpoint 7 completa Chromium/aislamiento/onboarding; review 094 ciclo 2 cierra sin hallazgos.                                               |
| 18-07-2026 | PLAN-018 checkpoint 6 completa workspace/evidencia/snippets; review 093 ciclo 1 cierra sin hallazgos.                                                  |
| 18-07-2026 | PLAN-018 checkpoint 5 completa CodeMirror/configuración/active Ajv; review 092 ciclo 2 cierra sin hallazgos.                                           |
| 18-07-2026 | PLAN-018 revisión 1 queda Approved para checkpoints 5–8; checkpoint 5 espera el gate exacto de dependencias.                                           |
| 18-07-2026 | PLAN-018 revisión 1 queda Proposed tras review 091 ciclo 3 sin hallazgos; checkpoints 5–8 esperan aprobación formal.                                   |
| 18-07-2026 | ADR-021 revisión 1 queda Accepted; autoriza redactar/revisar PLAN-018 revisión 1, no implementar checkpoint 5 todavía.                                 |
| 17-07-2026 | ADR-021 revisión 1 queda Proposed tras review 090 ciclo 3 sin hallazgos; aceptación formal y revisión de PLAN-018 siguen pendientes.                   |
| 17-07-2026 | PLAN-019/M17 completa el paquete Ajv privado y ambos shells; review 089 ciclo 2 cierra sin hallazgos y PLAN-018 checkpoint 5 puede reanudarse.         |
| 17-07-2026 | Review 082 promueve D-047/M17 para diseñar un paquete privado Ajv síncrono y reutilizable; publicación y capacidades avanzadas siguen fuera.           |
| 17-07-2026 | PLAN-018 checkpoint 1 completa Vite/skeleton/watch/boundaries; review 078 ciclo 2 cierra sin hallazgos tras corregir tipos CSS.                        |
| 17-07-2026 | PLAN-018 revisión 0 queda Approved tras review 077 ciclo 1 sin hallazgos; checkpoint 1 espera el gate exacto de Vite.                                  |
| 17-07-2026 | ADR-021 revisión 0 queda Accepted tras review 076 ciclo 1 sin hallazgos; autoriza solo preparar y revisar PLAN-018.                                    |
| 17-07-2026 | Review 075 promueve D-046/M16 solo para ADR-021: shell privado Standard/DOM directo al core, sin adapter ni contrato Public.                           |
| 17-07-2026 | PLAN-016 checkpoints 1–2 completan workspace privado y authoring seguro del catálogo; review 057 ciclo 3 cierra sin hallazgos.                         |
| 16-07-2026 | Review 053 promueve D-044/M15 para ADR-020 y registra D-045 Deferred para futuras familias Angular anteriores a 19.                                    |
| 16-07-2026 | D-044 se amplía a plataforma multi-framework; el primer alcance candidato sigue limitado a catálogo neutral y shell Angular.                           |
| 16-07-2026 | PLAN-015 cierra la release coordinada 0.2.0; D-044 queda Candidate para revisar una aplicación Angular de referencia, consumo y demo.                  |
| 15-07-2026 | ADR-018 r3/PLAN-013 r4 cierran M13 con release manual/2FA verificada; D-043 difiere repositorio público, OIDC y provenance.                            |
| 15-07-2026 | PLAN-012 y M12 se completan; review 026 ciclo 6 cierra sin hallazgos tras siete correcciones; la matriz completa pasó en ciclo 3.                      |
| 15-07-2026 | SPEC-005 v0.1.1 queda Accepted tras review 024 ciclo 2 sin hallazgos; autoriza preparar PLAN-012, no implementar.                                      |
| 15-07-2026 | SPEC-005 v0.1.0 queda Draft para D-042; requiere revisión y aceptación antes de PLAN-012.                                                              |
| 15-07-2026 | ADR-017 revision 0 queda Accepted tras review 023 ciclo 3 sin hallazgos; autoriza preparar SPEC, no plan ni implementación.                            |
| 15-07-2026 | ADR-017 revision 0 queda Proposed; review 023 ciclo 3 pasa ocho áreas sin hallazgos tras dos correcciones documentales.                                |
| 15-07-2026 | Ricard acepta review 022; D-042 queda Promoted solo para grupos de presentación estáticos y D-011/D-012 siguen Deferred.                               |
| 15-07-2026 | PLAN-011 y M11 se completan; review 021 ciclo 2 y toda la matriz pasan sin hallazgos tras corregir provenance de políticas.                            |
| 15-07-2026 | PLAN-011 checkpoint 4 completa los 19 escenarios, paquetes y consumidores; 326 core/68 Angular tests pasan.                                            |
| 15-07-2026 | PLAN-011 checkpoint 3 integra `$defs`/`$ref`, ciclos, orden y provenance en el compiler; 304 tests core pasan.                                         |
| 15-07-2026 | PLAN-011 checkpoint 2 completa registry/decoder/resolver Internal y 297 tests core pasan; compiler/reference behavior sigue intacto.                   |
| 15-07-2026 | PLAN-011 checkpoint 1 completa fundamentos Internal inmutables y 252 tests core pasan; referencias siguen inactivas.                                   |
| 15-07-2026 | PLAN-011 revisión 0 queda Approved; checkpoint 1 inicia solo fundamentos Internal inmutables sin activar referencias.                                  |
| 15-07-2026 | PLAN-011 revisión 0 supera revisión completa ciclo 1 sin hallazgos y permanece Proposed pendiente de aprobación formal.                                |
| 15-07-2026 | PLAN-011 revisión 0 queda Proposed con 19 escenarios y cinco checkpoints; requiere revisión completa y aprobación antes de implementar.                |
| 15-07-2026 | SPEC-004 v0.1.1 queda Accepted tras revisión completa ciclo 5 sin hallazgos; se autoriza preparar/revisar PLAN-011, no implementar.                    |
| 14-07-2026 | SPEC-004 v0.1.1 corrige nueve hallazgos y la revisión completa ciclo 5 pasa sin hallazgos; aceptación formal pendiente.                                |
| 14-07-2026 | SPEC-004 v0.1.0 queda Draft con el contrato observable D-041; requiere revisión completa y aceptación antes de cualquier plan.                         |
| 14-07-2026 | ADR-005 revision 3 queda Accepted tras revisión completa sin hallazgos; se autoriza redactar SPEC-004, no plan ni implementación.                      |
| 14-07-2026 | ADR-016 queda Accepted tras revisión completa sin hallazgos; se autoriza redactar ADR-005 revisión 3, no SPEC ni implementación.                       |
| 14-07-2026 | Ricard acepta review 016; D-041 queda Promoted para diseño local estático y se propone ADR-016 sin autorizar implementación.                           |
| 14-07-2026 | La revisión de preparación M11 recomienda separar resolución local estática de D-007 completo; aceptación pendiente.                                   |
| 14-07-2026 | PLAN-010 checkpoint 7 repite revisión y matriz completas sin hallazgos; PLAN-010 y M10 quedan completados sin publicar.                                |
| 14-07-2026 | PLAN-010 checkpoint 6 migra docs, declaraciones, paquetes, artefactos y consumidores; checkpoint 7 queda pendiente.                                    |
| 14-07-2026 | PLAN-010 checkpoint 5 completa la proyección Angular estable y accesible de colecciones/ítems; checkpoint 6 queda pendiente.                           |
| 14-07-2026 | PLAN-010 checkpoint 4 completa runtime, snapshots, requests, scopes, interacción y sharing de colecciones; checkpoint 5 queda pendiente.               |
| 14-07-2026 | PLAN-010 checkpoint 3 completa las cinco operaciones de colección y sus fixtures puras/form; checkpoint 4 queda pendiente.                             |
| 14-07-2026 | PLAN-010 checkpoint 2 completa policies, compiler array/item/UI, templates inmutables y fixtures con matriz verde.                                     |
| 14-07-2026 | PLAN-010 checkpoint 1 completa contratos Public, helpers Internal, validación de definición y paquetes/consumidores.                                   |
| 14-07-2026 | PLAN-010 revisión 0 se aprueba tras revisión completa sin hallazgos; M10 queda autorizado, checkpoint 1 aún no iniciado.                               |
| 14-07-2026 | Se acepta la revisión de promoción M10; D-006 queda Promoted para diseño normativo, sin autorizar implementación.                                      |
| 14-07-2026 | Revisión de promoción M10 pasa sin hallazgos y recomienda D-006 para diseño estrecho; aceptación sigue pendiente.                                      |
| 14-07-2026 | PLAN-009 checkpoint 7 supera revisión integral repetida y matriz completa; M9 queda completado sin activar M10 ni publicación.                         |
| 14-07-2026 | PLAN-009 checkpoint 6 migra paquetes, declaraciones, artefactos y consumidores limpios; checkpoint 7 queda pendiente.                                  |
| 14-07-2026 | PLAN-009 checkpoint 5 completa la proyección Angular recursiva y accesible; checkpoint 6 queda pendiente.                                              |
| 14-07-2026 | PLAN-009 checkpoint 4 completa runtime, snapshots, scopes y sharing anidados; checkpoint 5 queda pendiente.                                            |
| 14-07-2026 | PLAN-009 checkpoint 3 completa operaciones profundas y fixtures con matriz verde; checkpoint 4 queda pendiente.                                        |
| 14-07-2026 | PLAN-009 checkpoint 2 completa el compiler schema/UI recursivo y sus fixtures con matriz verde; checkpoint 3 queda pendiente.                          |
| 14-07-2026 | PLAN-009 checkpoint 1 completa contratos/helpers neutrales y migración plana con matriz verde; checkpoint 2 queda pendiente.                           |
| 14-07-2026 | Se aprueba PLAN-009 revisión 1 tras la revisión repetida sin hallazgos; la implementación de M9 aún no ha comenzado.                                   |
| 14-07-2026 | PLAN-009 revisión 1 corrige cuatro hallazgos y supera la revisión completa repetida; aprobación e implementación siguen pendientes.                    |
| 14-07-2026 | Se aceptan ADR-014 revision 2 y SPEC-002 v0.1.2 tras revisión sin hallazgos; PLAN-009 sigue pendiente y M9 inactivo.                                   |
| 14-07-2026 | ADR-014 revision 2 propuesta y SPEC-002 v0.1.2 corrigen seis hallazgos; la revisión repetida pasa y la aceptación queda pendiente.                     |
| 14-07-2026 | Se aceptan coordinadamente ADR-014 revision 1 y ADR-005 revision 1; SPEC-002 y la implementación de M9 siguen pendientes.                              |
| 14-07-2026 | Se acepta la revisión de promoción, D-005 pasa a Promoted para diseño y se proponen ADR-014, ADR-005 revisión 1 y SPEC-002.                            |
| 14-07-2026 | PLAN-008 y M8 se completan con candidatos privados 0.1.0 verificados; D-040 y D-034 continúan Deferred.                                                |
| 14-07-2026 | PLAN-008 revision 2 supera la revisión formal repetida; M8 sigue inactivo y D-040 continúa Deferred.                                                   |
| 14-07-2026 | Se acepta ADR-013 revision 1; D-040 sigue Deferred y PLAN-008 puede pasar a revisión sin activar M8.                                                   |
| 14-07-2026 | ADR-013 revision 1 supera la revisión formal repetida; D-040 continúa Deferred y la aceptación sigue pendiente.                                        |
| 14-07-2026 | Se propone ADR-013 y PLAN-008 para preparar artefactos 0.1 locales; D-040 separa y difiere la publicación real.                                        |
| 14-07-2026 | Se acepta ADR-012 revision 1, D-010 queda Promoted y M7 avanza a sincronización de SPEC y preparación de PLAN-007.                                     |
| 14-07-2026 | ADR-012 revision 1 supera sus ocho criterios tras precisar foco, accesibilidad y migración; D-010 sigue Candidate.                                     |
| 14-07-2026 | Se propone ADR-012 para revisar la limpieza explícita nativa; D-010 permanece Candidate y M7 no está activo.                                           |
| 14-07-2026 | G0 se completa y SPEC-001 v0.1.14 queda Accepted sin promover ninguna decisión diferida ni API a Stable.                                               |
| 14-07-2026 | G0 difiere como D-038 y D-039 los helpers no implementados de baseline parcial y aplicación explícita de defaults.                                     |
| 14-07-2026 | PLAN-006 y M6 se completan con enum string normalizado y select Angular controlado, manteniendo las exclusiones diferidas.                             |
| 13-07-2026 | M6 comienza y completa el paso 1 de contratos neutrales de PLAN-006 sin activar otra decisión aplazada.                                                |
| 13-07-2026 | Se aprueba PLAN-006 revisión 1 y sus contratos se promueven a SPEC-001 Draft v0.1.13 sin iniciar M6.                                                   |
| 13-07-2026 | Se acepta ADR-011, D-008 se promueve y `const`/`format` se separan como D-036 y D-037 sin activar su implementación.                                   |
| 13-07-2026 | D-024 registra custom renderers como resueltos por ADR-007/009 y aplaza el bridge Angular hasta existir un consumidor concreto.                        |
| 13-07-2026 | Se acepta ADR-010, ADR-002 queda Superseded y D-028 se promueve con versionado y compatibilidad explícitos.                                            |
| 13-07-2026 | Se propone ADR-010 para resolver D-028 y sustituir el lockstep Angular del ADR-002 pre-SPEC.                                                           |
| 13-07-2026 | Se acepta ADR-009 y D-029 se promueve con la frontera pública y la política de estabilidad iniciales.                                                  |
| 13-07-2026 | Se propone ADR-009 para delimitar la API pública y su política de estabilidad; D-029 permanece Candidate hasta su aceptación.                          |
| 13-07-2026 | La selección del dialecto de JSON Schema se promueve a ADR-005 y se elimina de las próximas decisiones pendientes.                                     |
| 13-07-2026 | Creación del registro con las decisiones aplazadas durante la definición de SPEC-001.                                                                  |
