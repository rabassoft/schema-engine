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

- **Estado:** Candidate
- **Pregunta:** ¿Cómo representar, compilar, renderizar y operar sobre objetos anidados?
- **Motivo:** Requiere resolver contenedores, paths profundos, layouts y errores de ramas.
- **Retomar cuando:** El walking skeleton de campos raíz esté cubierto por pruebas.

## D-006: Arrays

- **Estado:** Deferred
- **Pregunta:** ¿Cómo modelar elementos, índices, identidad estable, inserción, borrado y movimiento?
- **Motivo:** Requiere nuevas operaciones y una identidad diferente de la posición.
- **Retomar cuando:** Se haya definido el modelo de objetos anidados.
- **Documento esperado:** SPEC de colecciones y operaciones estructurales.

## D-007: Composición y condicionales de JSON Schema

- **Estado:** Deferred
- **Incluye:** `$ref`, `allOf`, `anyOf`, `oneOf`, `if/then/else`, `dependentSchemas` y vocabularios.
- **Motivo:** Exige resolver semántica de evaluación antes de derivar UI.
- **Retomar cuando:** Se seleccione el dialecto y exista una capa de resolución de schema.

## D-008: Enum, const y format

- **Estado:** Candidate
- **Pregunta:** ¿Cómo deducir selectores, radios, fechas, emails y renderers especializados?
- **Motivo:** Depende del sistema definitivo de resolución de renderers.
- **Retomar cuando:** El registry/tester básico esté implementado.

## D-009: Null y campos triestado

- **Estado:** Deferred
- **Pregunta:** ¿Cómo representar `missing`, `null`, `false` y `true` sin ambigüedad?
- **Motivo:** La primera versión usa booleanos binarios y no soporta null explícito.
- **Retomar cuando:** Se amplíe el subconjunto de tipos.

## D-010: Acción explícita para limpiar un campo

- **Estado:** Candidate
- **Pregunta:** ¿Debe todo renderer poder solicitar `remove-value` mediante una acción visual de limpieza?
- **Motivo:** No es imprescindible para el walking skeleton, salvo el vaciado numérico.
- **Retomar cuando:** Se diseñe la API común de affordances del renderer.

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
- **Retomar cuando:** Se implementen objetos, referencias o múltiples formatos de entrada.
- **Documento esperado:** ADR sobre pipeline de compilación y compatibilidad del modelo intermedio.

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

- **Estado:** Candidate
- **Pregunta:** ¿Cómo registrar componentes propios y adaptar validadores como Angular `ValidatorFn`?
- **Motivo:** Debe preservarse el contrato neutral y normalizar todos los resultados.
- **Retomar cuando:** Se defina el registry del adaptador Angular.

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

- **Estado:** Research
- **Pregunta:** ¿Lockstep con la major del framework o SemVer propio con peer dependencies y matriz de compatibilidad?
- **Motivo:** El ADR actual de lockstep necesita revisión antes de publicarse.
- **Dirección recomendada:** SemVer del producto + rangos de peer dependencies + matriz de compatibilidad.
- **Retomar cuando:** Se confirme el mapa de paquetes y la API pública inicial.

## D-029: Estabilidad de API pública

- **Estado:** Candidate
- **Pregunta:** ¿Qué paquetes, tipos y funciones serán públicos y cuáles internos?
- **Motivo:** Debe definirse antes de la primera publicación, pero después del walking skeleton.
- **Documento esperado:** ADR de public API y política de deprecación.
- **Propuesta en revisión:** [`ADR-009`](../adrs/009-politica-api-publica-estabilidad.md)

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

## 4. Próximas decisiones a promover

Las entradas más cercanas a convertirse en ADR son:

1. **D-024 — Custom renderers y bridges Angular.**
2. **D-028 — Versionado de paquetes.**
3. **D-029 — API pública.**

## 5. Historial

| Fecha      | Cambio                                                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------- |
| 13-07-2026 | Se propone ADR-009 para delimitar la API pública y su política de estabilidad; D-029 permanece Candidate hasta su aceptación. |
| 13-07-2026 | La selección del dialecto de JSON Schema se promueve a ADR-005 y se elimina de las próximas decisiones pendientes.            |
| 13-07-2026 | Creación del registro con las decisiones aplazadas durante la definición de SPEC-001.                                         |
