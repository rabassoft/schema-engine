# Schema Engine — Roadmap

## Completed milestones

- [x] M1 — Compilador mínimo
  - Completado el 13 de julio de 2026.
  - `compileFormDefinition()`, contratos neutrales, diagnósticos, 30 fixtures y 40 tests.
- [x] M2 — Operaciones inmutables
  - Completado el 13 de julio de 2026.
  - Operaciones raíz puras, diagnósticos runtime, 27 fixtures y 82 tests totales.
- [x] M3 — Runtime controlado
  - Completado el 13 de julio de 2026.
  - Estado controlado, validación, snapshots, interacción, scopes, listeners y disposal.
- [x] M4 — Adaptador Angular
  - Completado el 13 de julio de 2026.
  - Adaptador headless Angular 22, Signals, resolución de renderers y outlet con ViewContainerRef.
- [x] M5 — Renderer HTML
  - Completado el 13 de julio de 2026.
  - Renderers nativos accesibles, Signal Forms locales, textos reemplazables y edición numérica localizada y controlada.
- [x] M6 — Enum de strings y select nativo
  - Completado el 14 de julio de 2026 bajo PLAN-006 revisión 1.
  - Enum string y `enumLabels` normalizados, choices y textos resolubles,
    validación estructural segura y select Angular controlado según ADR-011.
- [x] M7 — Limpieza explícita de campos
  - Completado el 14 de julio de 2026 bajo PLAN-007 revisión 2 y ADR-012.
  - Acción nativa accesible y localizable para los cuatro renderers, flujo
    `remove-value` controlado y protección de foco/rutas durante lifecycle.
- [x] M8 — Preparación de la versión experimental 0.1
  - Completado el 14 de julio de 2026 bajo ADR-013 revisión 1 y PLAN-008
    revisión 2, sin publicación.
  - Candidatos privados `0.1.0`, manifests/peers alineados, tarballs
    inspeccionados y consumidores limpios para los extremos Angular 22.

## Gate de revisión completado

### G0 — Cierre formal del prototipo

- **Estado:** completado el 14 de julio de 2026; SPEC-001 v0.1.14 Accepted.
- **Frontera:** revisión y evidencia sobre el comportamiento ya implementado;
  no autoriza cambios funcionales, promoción de APIs ni capacidades diferidas.

- Relacionar todos los criterios de aceptación de SPEC-001 con evidencia
  ejecutable.
- Ejercitar los paquetes construidos desde un consumidor Angular mínimo.
- Revisar SPEC-001 de extremo a extremo y marcarla Accepted solo si supera la
  revisión.
- Mantener todas las APIs públicas como Experimental salvo que una ADR separada
  las promueva.

**Progreso:** la matriz relaciona los 22 criterios con evidencia automatizada;
el consumidor Angular mínimo y la verificación completa con 176 tests han
pasado. Las resoluciones aprobadas de G0-F001 a G0-F003 se incorporaron en
SPEC-001 v0.1.14 y D-038/D-039 sin cambiar producto. La revisión integral
repetida pasó sin hallazgos y cerró G0 con la SPEC Accepted.

G0 solo podrá cerrarse y marcar SPEC-001 como Accepted si toda la evidencia
pasa. Cualquier hallazgo mantendrá la SPEC en Draft y se trasladará a trabajo
separado antes de repetir la revisión.

## Secuencia post-G0

> M7-M10 están completados bajo sus ADR, SPEC y planes aceptados. M11-M12
> continúan como propuestas de planificación. La publicación real permanece
> Deferred en D-040 y requiere una solicitud y aprobación explícitas.

### M9 — Objetos anidados — completado

- D-005 promovido el 14 de julio de 2026 tras aceptar su revisión de promoción;
  implementación autorizada únicamente por SPEC-002 y PLAN-009.
- La revisión conjunta 3 de ADR-014 revisión 1 y ADR-005 revisión 1 pasó sin
  hallazgos ni conflictos documentales; ambas decisiones fueron aceptadas
  coordinadamente para diseño normativo sin activar implementación.
- ADR-014 revisión 2 y SPEC-002 v0.1.2 corrigieron los seis hallazgos de la
  primera revisión, superaron la revisión completa repetida y fueron aceptadas
  explícitamente en ese orden.
- El gate normativo está completado. PLAN-009 revisión 1 corrigió cuatro
  hallazgos de entrega y superó la revisión completa repetida sin hallazgos.
  Ricard lo aprobó explícitamente el 14 de julio de 2026.
- El requisito de revisar ADR-005 antes de implementar quedó satisfecho por su
  revisión 1 Accepted; PLAN-009 revisión 1 satisfizo el último gate y sus siete
  checkpoints están completados.
- Checkpoint 1 completado: contratos Public core, helpers Internal iterativos de
  paths/definiciones, bridge plano, fixtures migradas y matriz completa verde.
- Checkpoint 2 completado: compilación iterativa recursiva de schema/UI,
  diagnósticos profundos, ciclos de ascendencia, definición normalizada y
  fixtures focalizadas con matriz completa verde.
- Checkpoint 3 completado: operaciones estructurales/form profundas iterativas,
  validación compartida de definiciones, materialización/clonado por cadena y
  fixtures migradas con matriz completa verde.
- Checkpoint 4 completado: runtime, snapshots, interacción, scopes y sharing
  anidados con recorrido iterativo y matriz completa verde.
- Checkpoint 5 completado: proyección Angular recursiva, grupos semánticos,
  textos/IDs de objetos y bloqueo de intenciones incompatibles.
- Checkpoint 6 completado: declaraciones, paquetes, documentación, artefactos y
  consumidores construidos/limpios migrados a la frontera anidada.
- Checkpoint 7 completado: corrigió conflictos documentales y huecos de
  evidencia, y la revisión integral repetida más toda la matriz finalizaron sin
  hallazgos.

### M10 — Colecciones homogéneas de objetos — completado

- D-006 fue promovido tras su revisión; ADR-015 revisión 4, ADR-005 revisión 2
  y SPEC-003 v0.1.2 fijaron la frontera normativa aceptada.
- PLAN-010 revisión 0 fue aprobado y sus checkpoints 1–6 implementaron
  contratos/templates, compiler, operaciones, runtime, proyección Angular y
  migración de paquetes/consumidores.
- Checkpoint 7 revisó los 12 escenarios SPEC-003, declaraciones y diff M10
  completo. Tras corregir solo estados documentales obsoletos, la revisión
  integral repetida y toda la matriz pasaron sin hallazgos.
- M10 no activa arrays primitivos/anidados, tuples, composición, layout,
  custom collection renderers, persistencia, publicación ni APIs Stable.

### Orden de dependencias a más largo plazo

1. **M11 — Resolución y composición de schemas (D-014 + D-007):** establecer el
   modelo intermedio resuelto antes de `$ref` y applicators.
2. **M12 — UI Schema avanzado (D-011 + D-012):** solo después de disponer de
   contenedores y un contrato neutral de layout.

Las demás entradas diferidas continúan condicionadas a demanda. Esta propuesta
no programa validación asíncrona, bridges de validación Angular, definiciones
dinámicas, plugins, persistencia, productos ni trabajo comercial.
