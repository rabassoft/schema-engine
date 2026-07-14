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

- **Estado:** Deferred
- **Pregunta:** ¿Cómo integrar validaciones remotas o dependientes de servicios?
- **Motivo:** Requiere pending, cancelación, debounce, `AbortSignal`, orden de respuestas y errores de red.
- **Retomar cuando:** La validación síncrona y su normalización estén estabilizadas.
- **Documento esperado:** ADR de validación asíncrona y composición de validadores.

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

- **Estado:** Promoted
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

## D-007: Composición y condicionales de JSON Schema

- **Estado:** Deferred
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

- **Estado:** Deferred
- **Pregunta:** ¿Cómo representar `missing`, `null`, `false` y `true` sin ambigüedad?
- **Motivo:** La primera versión usa booleanos binarios y no soporta null explícito.
- **Retomar cuando:** Se amplíe el subconjunto de tipos.

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

- **Estado:** Deferred
- **Incluye:** grids, tabs, accordions, secciones, wizards, slots, acciones y layouts responsivos.
- **Motivo:** Primero se validará la separación entre semántica de datos y presentación básica.
- **Retomar cuando:** Existan objetos anidados y un contrato de layout neutral.

## D-012: Scopes declarativos en UI Schema

- **Estado:** Deferred
- **Pregunta:** ¿Deben los pasos y secciones declararse en metadatos?
- **Motivo:** En la primera versión los scopes pertenecen a la aplicación.
- **Retomar cuando:** Se diseñe UI Schema avanzado.

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

- **Estado:** Deferred
- **Incluye:** visible, enabled, readonly, required dinámico, computed y defaults condicionales.
- **Motivo:** Requiere lenguaje, sandbox, dependencias, evaluación incremental y diagnósticos.
- **Retomar cuando:** Los formularios estáticos y objetos anidados estén consolidados.

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

- **Estado:** Deferred
- **Pregunta:** ¿Cómo personalizar estilos sin acoplar el core a Material o Tailwind?
- **Dirección propuesta:** Design tokens y contratos visuales en paquetes de UI.
- **Retomar cuando:** Exista al menos un renderer kit estable.

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

- **Estado:** Deferred
- **Opciones:** MIT, open core, plugins comerciales, soporte, SaaS o licencias enterprise.
- **Motivo:** Debe validarse primero el valor técnico y la demanda.
- **Retomar cuando:** Exista una comunidad inicial o consumidores empresariales.

## D-035: Especificación pública independiente de la implementación

- **Estado:** Deferred
- **Pregunta:** ¿Debe el proyecto publicar una especificación que terceros puedan implementar sin usar el código oficial?
- **Motivo:** Requiere contratos suficientemente maduros y pruebas de conformidad.
- **Retomar cuando:** Exista al menos un segundo adaptador o implementación independiente.

## D-036: Const y presentación de valores fijos

- **Estado:** Deferred
- **Pregunta:** ¿Debe `const` producir una presentación fixed, readonly, hidden
  o ningún renderer?
- **Motivo:** La assertion de datos no determina por sí sola la interacción ni
  la presentación adecuada.
- **Retomar cuando:** Exista un caso consumidor concreto para valores fijos y
  se defina quién controla su presencia y visualización.
- **Documento esperado:** ADR de semántica normalizada y presentación de
  valores fijos.

## D-037: Format y renderers semánticos especializados

- **Estado:** Deferred
- **Pregunta:** ¿Qué formatos se soportan y cuáles actúan como annotation,
  assertion o hint de presentación?
- **Motivo:** ADR-005 trata `format` como anotación ignorada; cambiarlo requiere
  una política explícita de validación y renderers por formato.
- **Retomar cuando:** Exista un caso consumidor concreto para un formato y se
  defina su vocabulario, validación y fallback visual.
- **Documento esperado:** ADR que revise explícitamente ADR-005.

## D-038: Utilidad para confirmar un scope en el baseline

- **Estado:** Deferred
- **Pregunta:** ¿Debe el core exponer una utilidad pura
  `commitScopeToBaseline(baselineValue, currentValue, scope)` para construir una
  actualización parcial del baseline?
- **Motivo:** SPEC-001 llegó a prometer el helper, pero PLAN-003, la API pública
  y la implementación no lo promovieron. El prototipo mantiene a la aplicación
  como única propietaria del baseline y permite que lo actualice de forma
  inmutable mediante `updateExternalState()`.
- **Retomar cuando:** Dos o más consumidores necesiten compartir semántica de
  confirmación parcial, incluidos paths válidos, propiedades ausentes,
  structural sharing y diagnósticos.
- **Documento esperado:** SPEC o plan que defina el contrato puro, su relación
  con scopes y su frontera de API pública.

## D-039: Aplicación explícita de defaults del schema

- **Estado:** Deferred
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

## D-040: Publicación real de paquetes

- **Estado:** Deferred
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
- **Plan propuesto:**
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

## 4. Próximo trabajo de decisión

1. **M12 — UI Schema avanzado:** evaluar la preparación conjunta de D-011 y
   D-012 antes de redactar arquitectura, SPEC o plan; no hay implementación
   autorizada.
2. **D-040 — Publicación real:** permanece Deferred y solo se retomará tras una
   solicitud explícita de publicación.

[`ROADMAP.md`](../project/ROADMAP.md) distingue el gate G0 completado de la
secuencia posterior. ADR-013 y PLAN-008 completaron únicamente la preparación
de M8; D-040 conserva la publicación como Deferred, D-005 está implementado
dentro del alcance de M9 aunque conserva su estado registral Promoted, D-006
queda Promoted con M10 completado por PLAN-010 y todas las demás entradas
mantienen su estado hasta una promoción y aprobación explícitas.

## 5. Historial

| Fecha      | Cambio                                                                                                                                   |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 15-07-2026 | PLAN-011 y M11 se completan; review 021 ciclo 2 y toda la matriz pasan sin hallazgos tras corregir provenance de políticas.              |
| 15-07-2026 | PLAN-011 checkpoint 4 completa los 19 escenarios, paquetes y consumidores; 326 core/68 Angular tests pasan.                              |
| 15-07-2026 | PLAN-011 checkpoint 3 integra `$defs`/`$ref`, ciclos, orden y provenance en el compiler; 304 tests core pasan.                           |
| 15-07-2026 | PLAN-011 checkpoint 2 completa registry/decoder/resolver Internal y 297 tests core pasan; compiler/reference behavior sigue intacto.     |
| 15-07-2026 | PLAN-011 checkpoint 1 completa fundamentos Internal inmutables y 252 tests core pasan; referencias siguen inactivas.                     |
| 15-07-2026 | PLAN-011 revisión 0 queda Approved; checkpoint 1 inicia solo fundamentos Internal inmutables sin activar referencias.                    |
| 15-07-2026 | PLAN-011 revisión 0 supera revisión completa ciclo 1 sin hallazgos y permanece Proposed pendiente de aprobación formal.                  |
| 15-07-2026 | PLAN-011 revisión 0 queda Proposed con 19 escenarios y cinco checkpoints; requiere revisión completa y aprobación antes de implementar.  |
| 15-07-2026 | SPEC-004 v0.1.1 queda Accepted tras revisión completa ciclo 5 sin hallazgos; se autoriza preparar/revisar PLAN-011, no implementar.      |
| 14-07-2026 | SPEC-004 v0.1.1 corrige nueve hallazgos y la revisión completa ciclo 5 pasa sin hallazgos; aceptación formal pendiente.                  |
| 14-07-2026 | SPEC-004 v0.1.0 queda Draft con el contrato observable D-041; requiere revisión completa y aceptación antes de cualquier plan.           |
| 14-07-2026 | ADR-005 revision 3 queda Accepted tras revisión completa sin hallazgos; se autoriza redactar SPEC-004, no plan ni implementación.        |
| 14-07-2026 | ADR-016 queda Accepted tras revisión completa sin hallazgos; se autoriza redactar ADR-005 revisión 3, no SPEC ni implementación.         |
| 14-07-2026 | Ricard acepta review 016; D-041 queda Promoted para diseño local estático y se propone ADR-016 sin autorizar implementación.             |
| 14-07-2026 | La revisión de preparación M11 recomienda separar resolución local estática de D-007 completo; aceptación pendiente.                     |
| 14-07-2026 | PLAN-010 checkpoint 7 repite revisión y matriz completas sin hallazgos; PLAN-010 y M10 quedan completados sin publicar.                  |
| 14-07-2026 | PLAN-010 checkpoint 6 migra docs, declaraciones, paquetes, artefactos y consumidores; checkpoint 7 queda pendiente.                      |
| 14-07-2026 | PLAN-010 checkpoint 5 completa la proyección Angular estable y accesible de colecciones/ítems; checkpoint 6 queda pendiente.             |
| 14-07-2026 | PLAN-010 checkpoint 4 completa runtime, snapshots, requests, scopes, interacción y sharing de colecciones; checkpoint 5 queda pendiente. |
| 14-07-2026 | PLAN-010 checkpoint 3 completa las cinco operaciones de colección y sus fixtures puras/form; checkpoint 4 queda pendiente.               |
| 14-07-2026 | PLAN-010 checkpoint 2 completa policies, compiler array/item/UI, templates inmutables y fixtures con matriz verde.                       |
| 14-07-2026 | PLAN-010 checkpoint 1 completa contratos Public, helpers Internal, validación de definición y paquetes/consumidores.                     |
| 14-07-2026 | PLAN-010 revisión 0 se aprueba tras revisión completa sin hallazgos; M10 queda autorizado, checkpoint 1 aún no iniciado.                 |
| 14-07-2026 | Se acepta la revisión de promoción M10; D-006 queda Promoted para diseño normativo, sin autorizar implementación.                        |
| 14-07-2026 | Revisión de promoción M10 pasa sin hallazgos y recomienda D-006 para diseño estrecho; aceptación sigue pendiente.                        |
| 14-07-2026 | PLAN-009 checkpoint 7 supera revisión integral repetida y matriz completa; M9 queda completado sin activar M10 ni publicación.           |
| 14-07-2026 | PLAN-009 checkpoint 6 migra paquetes, declaraciones, artefactos y consumidores limpios; checkpoint 7 queda pendiente.                    |
| 14-07-2026 | PLAN-009 checkpoint 5 completa la proyección Angular recursiva y accesible; checkpoint 6 queda pendiente.                                |
| 14-07-2026 | PLAN-009 checkpoint 4 completa runtime, snapshots, scopes y sharing anidados; checkpoint 5 queda pendiente.                              |
| 14-07-2026 | PLAN-009 checkpoint 3 completa operaciones profundas y fixtures con matriz verde; checkpoint 4 queda pendiente.                          |
| 14-07-2026 | PLAN-009 checkpoint 2 completa el compiler schema/UI recursivo y sus fixtures con matriz verde; checkpoint 3 queda pendiente.            |
| 14-07-2026 | PLAN-009 checkpoint 1 completa contratos/helpers neutrales y migración plana con matriz verde; checkpoint 2 queda pendiente.             |
| 14-07-2026 | Se aprueba PLAN-009 revisión 1 tras la revisión repetida sin hallazgos; la implementación de M9 aún no ha comenzado.                     |
| 14-07-2026 | PLAN-009 revisión 1 corrige cuatro hallazgos y supera la revisión completa repetida; aprobación e implementación siguen pendientes.      |
| 14-07-2026 | Se aceptan ADR-014 revision 2 y SPEC-002 v0.1.2 tras revisión sin hallazgos; PLAN-009 sigue pendiente y M9 inactivo.                     |
| 14-07-2026 | ADR-014 revision 2 propuesta y SPEC-002 v0.1.2 corrigen seis hallazgos; la revisión repetida pasa y la aceptación queda pendiente.       |
| 14-07-2026 | Se aceptan coordinadamente ADR-014 revision 1 y ADR-005 revision 1; SPEC-002 y la implementación de M9 siguen pendientes.                |
| 14-07-2026 | Se acepta la revisión de promoción, D-005 pasa a Promoted para diseño y se proponen ADR-014, ADR-005 revisión 1 y SPEC-002.              |
| 14-07-2026 | PLAN-008 y M8 se completan con candidatos privados 0.1.0 verificados; D-040 y D-034 continúan Deferred.                                  |
| 14-07-2026 | PLAN-008 revision 2 supera la revisión formal repetida; M8 sigue inactivo y D-040 continúa Deferred.                                     |
| 14-07-2026 | Se acepta ADR-013 revision 1; D-040 sigue Deferred y PLAN-008 puede pasar a revisión sin activar M8.                                     |
| 14-07-2026 | ADR-013 revision 1 supera la revisión formal repetida; D-040 continúa Deferred y la aceptación sigue pendiente.                          |
| 14-07-2026 | Se propone ADR-013 y PLAN-008 para preparar artefactos 0.1 locales; D-040 separa y difiere la publicación real.                          |
| 14-07-2026 | Se acepta ADR-012 revision 1, D-010 queda Promoted y M7 avanza a sincronización de SPEC y preparación de PLAN-007.                       |
| 14-07-2026 | ADR-012 revision 1 supera sus ocho criterios tras precisar foco, accesibilidad y migración; D-010 sigue Candidate.                       |
| 14-07-2026 | Se propone ADR-012 para revisar la limpieza explícita nativa; D-010 permanece Candidate y M7 no está activo.                             |
| 14-07-2026 | G0 se completa y SPEC-001 v0.1.14 queda Accepted sin promover ninguna decisión diferida ni API a Stable.                                 |
| 14-07-2026 | G0 difiere como D-038 y D-039 los helpers no implementados de baseline parcial y aplicación explícita de defaults.                       |
| 14-07-2026 | PLAN-006 y M6 se completan con enum string normalizado y select Angular controlado, manteniendo las exclusiones diferidas.               |
| 13-07-2026 | M6 comienza y completa el paso 1 de contratos neutrales de PLAN-006 sin activar otra decisión aplazada.                                  |
| 13-07-2026 | Se aprueba PLAN-006 revisión 1 y sus contratos se promueven a SPEC-001 Draft v0.1.13 sin iniciar M6.                                     |
| 13-07-2026 | Se acepta ADR-011, D-008 se promueve y `const`/`format` se separan como D-036 y D-037 sin activar su implementación.                     |
| 13-07-2026 | D-024 registra custom renderers como resueltos por ADR-007/009 y aplaza el bridge Angular hasta existir un consumidor concreto.          |
| 13-07-2026 | Se acepta ADR-010, ADR-002 queda Superseded y D-028 se promueve con versionado y compatibilidad explícitos.                              |
| 13-07-2026 | Se propone ADR-010 para resolver D-028 y sustituir el lockstep Angular del ADR-002 pre-SPEC.                                             |
| 13-07-2026 | Se acepta ADR-009 y D-029 se promueve con la frontera pública y la política de estabilidad iniciales.                                    |
| 13-07-2026 | Se propone ADR-009 para delimitar la API pública y su política de estabilidad; D-029 permanece Candidate hasta su aceptación.            |
| 13-07-2026 | La selección del dialecto de JSON Schema se promueve a ADR-005 y se elimina de las próximas decisiones pendientes.                       |
| 13-07-2026 | Creación del registro con las decisiones aplazadas durante la definición de SPEC-001.                                                    |
