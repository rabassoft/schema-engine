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

> M7-M18 están completados bajo sus ADR, SPEC y planes aceptados. PLAN-013
> publicó y verificó core/Angular `0.1.0` bajo gates explícitos, sin promover
> APIs a Stable ni hacer público GitHub. M14 y PLAN-014 revision 0 están
> completados localmente. PLAN-015 publicó y verificó core y Angular `0.2.0`;
> ambos `next` y `latest` resuelven al par coordinado. D-011/D-012 y D-043
> permanecen Deferred fuera de los slices expresamente promovidos. D-045
> conserva Angular legacy como trabajo Deferred.

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
- PLAN-010 revisión 0 completó sus siete checkpoints. Los checkpoints 1–6
  entregaron contratos/templates, compiler, operaciones, runtime, proyección
  Angular y migración de paquetes/consumidores; checkpoint 7 revisó los 12
  escenarios SPEC-003, declaraciones y diff M10 completo. Tras corregir solo
  estados documentales obsoletos, la revisión integral repetida y toda la
  matriz pasaron sin hallazgos.
- M10 no activa arrays primitivos/anidados, tuples, composición, layout,
  custom collection renderers, persistencia, publicación ni APIs Stable.

### M11 — Resolución estática local de schemas — completado

- D-041 fue promovido para el slice local estático; ADR-016, ADR-005 revisión 3
  y SPEC-004 v0.1.1 fijaron la arquitectura y el comportamiento aceptados.
- PLAN-011 revisión 0 completó sus cinco checkpoints: fundamentos Internal,
  registry/decoder/resolver descriptor-safe, integración del compiler,
  19 escenarios de conformidad y revisión final completa.
- La revisión 021 corrigió una delimitación de provenance entre referencias de
  item y políticas del array; el ciclo 2 repitió la revisión y toda la matriz
  con cero hallazgos.
- M11 no activa referencias externas/dinámicas, anchors, applicators,
  composición, AST público, I/O, callbacks, publicación ni APIs Stable.

### M12 — Grupos de presentación estáticos — completado

- D-042 fue promovido para el slice estático neutral; ADR-017 revision 0 y
  SPEC-005 v0.1.1 fijaron la arquitectura y el comportamiento aceptados.
- PLAN-012 revision 1 completó contratos/defaults, inspección descriptor-safe,
  proyección Angular fija, paquetes/consumidores y revisión final repetida.
- M12 no activa D-011/D-012, agrupación anidada/item, tabs, wizards, grids,
  estado/acciones de layout, scopes generados ni container renderers custom.

### M13 — Primera publicación experimental — completado

- Review 027 cycle 2 promotes only D-034/D-040 after selecting
  `AGPL-3.0-only` or a separate commercial license.
- Ricardo Rabassó Rodríguez is the legal rights holder, operating as
  Rabassoft; the initial repository remains private pending sanitization.
- ADR-018 revision 3 is Accepted after review 028 cycle 8 closed with zero
  findings. PLAN-013 revision 4 is complete after review 029 cycle 14 closed
  with zero findings.
- Checkpoints 1–7 have accepted local, private-Git, npm identity and live
  publication evidence. Core and Angular `0.1.0` are public with byte-identical
  verified tarballs; `next` and the registry-observed `latest` alias the same
  Experimental versions.
- The release closes under interactive 2FA with no long-lived repository
  credential, private repository URL, provenance or settings mutation. D-043
  defers repository sanitization/publication, OIDC, staged approval, token
  restrictions and provenance as one future decision.

### M14 — Hojas primitivas nullable — completado y publicado

- D-009 fue promovido el 15 de julio de 2026 tras aceptar
  [review 031](../reviews/031-m14-nullable-leaves-promotion-readiness.md), cuyo
  ciclo 3 repitió ocho áreas y cerró sin hallazgos.
- El alcance se limita a una hoja primitiva existente cuyo `type` contenga
  exactamente su tipo y `null`; no habilita unions generales, containers
  nullable, `enum + null`, coerciones ni defaults.
- ADR-019 revisión 1 y ADR-005 revisión 4 fijan conjuntamente la arquitectura
  Accepted. SPEC-006 v0.1.1 fue Accepted tras review 034 ciclo 6 sin hallazgos.
  PLAN-014 revision 0 fue Approved tras review 035 ciclo 3 sin hallazgos y
  autoriza solo sus checkpoints 1–6. Versión y publicación siguen fuera.
- Los checkpoints 1–6 y PLAN-014 revisión 0 están completados tras review 041
  ciclo 2 sin hallazgos. PLAN-015 publicó y verificó el alcance como core y
  Angular `0.2.0`; review 052 cerró la release coordinada sin hallazgos.

### M15 — Plataforma de referencia multi-framework — Completed

- [Review 053](../reviews/053-d044-m15-reference-platform-promotion-readiness.md)
  ciclo 2 pasó diez áreas sin hallazgos y promovió D-044 solo para redactar y
  revisar ADR-020; no es un producto superior D-033.
- La frontera promovida comparte un catálogo privado y neutral de escenarios,
  fixtures, valores, operaciones/issues esperados y metadata explicativa, no
  runtime semantics ni una abstracción UI común a todos los frameworks.
- Cada target mantiene un shell independiente que consume solo entry points
  Public y conserva en la aplicación la propiedad de `value`/`baselineValue`,
  operaciones, persistencia y decisiones de negocio.
- La primera entrega completada incluye el catálogo compartido y el shell
  Angular. Standard/DOM, React, Vue y otros shells requieren antes una frontera
  de integración aceptada para su adapter y entregas posteriores separadas.
- La promoción separa workspace interactivo de consumidores limpios
  tarball/npm, selecciona builder oficial Angular y un smoke
  Playwright/Chromium, y mantiene fixtures/snippets bajo ownership explícito.
- ADR-020 revisión 0 fue Accepted tras review 054 ciclo 3 sin hallazgos y
  autorizó preparar/revisar PLAN-016. PLAN-016 revisión 0 superó review 055
  ciclo 5 sin hallazgos y fue aprobado explícitamente para checkpoints 1–8. La
  implementación completada no activa D-026, D-035 ni D-045.
- PLAN-016 checkpoints 1–8 están completos tras reviews 056–063 sin hallazgos.
  Catálogo, ownership Angular, UI semántica, colección, snippets build-checked
  y una única lane Chromium repetible están presentes. Aislamiento, regresiones,
  artefactos, consumidores y documentación están verificados; review 063 ciclo
  2 repitió la revisión final completa y cerró PLAN-016/M15 sin hallazgos.

### M16 — Shell de referencia Standard/DOM — completado

- [Review 075](../reviews/075-d046-m16-standard-dom-promotion-readiness.md)
  ciclo 1 pasó diez áreas con cero hallazgos y promueve D-046 únicamente para
  redactar y revisar ADR-021.
- La frontera seleccionada es una aplicación privada browser/sin framework que
  consume directamente el core Public y el catálogo neutral; no crea un
  adapter, paquete, entry point, Web Components ni contrato Public nuevos.
- El shell tendrá bootstrap, estado controlado, proyección DOM, lifecycle,
  snippets, build, tests y smoke Chromium independientes y cubrirá los seis
  escenarios actuales con UI idiomática del target.
- React, Vue, D-026, D-035, D-043, D-045, hosting, publicación y cambios de
  SPEC permanecen inactivos. ADR-021 revisión 1 quedó Accepted el 18 de julio
  tras review 090 ciclo 3 sin hallazgos y amplía la paridad privada de
  experiencia/configuración. PLAN-018 revisión 0 conserva su autoridad de
  implementación. PLAN-018 revisión 1 quedó Approved tras review 091 ciclo 3
  sin hallazgos. Los checkpoints 1–8 y D-047/M17 están completos; review final
  095 ciclo 2 repitió catorce áreas y toda la matriz sin hallazgos, cerrando
  PLAN-018 revisión 1 y M16.

### M17 — Validador JSON Schema síncrono reutilizable — completado

- [Review 082](../reviews/082-d047-m17-ajv-validator-promotion-readiness.md)
  ciclo 1 pasó diez áreas con cero hallazgos y promovió D-047 para diseño.
- La frontera selecciona un paquete workspace privado
  `@rabassoft/schema-engine-validator-ajv`, Ajv 8.20.0/Draft 2020-12, factory
  síncrona sustituible y normalización immutable al contrato core existente.
- Los shells Angular y Standard lo consumirán para que constraints soportados
  añadidos en schemas editados participen en la validación real.
- ADR-022 revisión 1 y SPEC-007 v0.1.0 están Accepted. PLAN-019 revisión 1 está
  Completed tras review 089 ciclo 2 sin hallazgos.
- El paquete privado, ambos shells, lazy Angular bootstrap, 7 tests propios,
  package smoke, builds y Chromium están verificados. Async, formats,
  referencias remotas, publicación, release y core changes permanecen fuera.

### M18 — Layout neutral avanzado — completado

- Ricard seleccionó madurar core/Angular/Standard y la portabilidad hacia
  librerías UI antes de iniciar React/Vue.
- [Review 098](../reviews/098-d011-m18-advanced-layout-promotion-readiness.md)
  ciclo 2 pasó doce áreas con cero hallazgos y promueve solo tabs estáticos,
  accordions estáticos y grid lógico estático root-only sobre el bosque de
  presentación aceptado.
- El estado de selección/expansión pertenece al target; core/runtime, scopes,
  operaciones, datos, workflow y persistencia no cambian.
- ADR-023 revisión 1 está Accepted tras review 099 ciclo 3 con cero hallazgos.
  Review 100 ciclo 4 promovió solo el seam Angular Experimental de contenedores,
  fallback nativo y un piloto opcional. ADR-024 revisión 1 está Accepted tras
  review 101 ciclo 4 con cero hallazgos y selecciona Angular Aria 22 como único
  piloto. SPEC-008 v0.1.0 está Accepted tras review 102 ciclo 5 sin hallazgos;
  PLAN-020 revisión 0 fue Approved tras review 103 ciclo 2 sin hallazgos y
  autorizó sus ocho checkpoints. Checkpoint 1 completa los contratos Public
  core, compilador y fixtures tras review 104 ciclo 3 sin hallazgos. Checkpoint
  2 completa validación manual e invariancia runtime tras review 105 ciclo 3;
  checkpoint 3 completa el SPI Angular base y la proyección nativa tras review
  106 ciclo 3; checkpoint 4 completa la proyección Standard independiente y el
  escenario compartido tras review 107 ciclo 5. La preparación local del
  checkpoint 5 pasa review 108 ciclo 3 y su resolución exacta Aria/CDK pasa
  review 109 ciclo 1. Checkpoint 6 completa el piloto aislado tras review 110
  ciclo 2. La porción local de checkpoint 7 pasa review 111 ciclo 3 y su lane
  latest-compatible completa el checkpoint tras review 112 ciclo 1. El frozen
  install y la matriz final pasan; review 113 ciclo 2 repite catorce áreas y
  las 22 filas sin hallazgos, completando checkpoint 8, PLAN-020 y M18.
- Wizards, acciones, D-012, D-018, nested/item layout, breakpoints arbitrarios,
  dependencias UI y React/Vue permanecen Deferred. Release quedó fuera de M18;
  M19 la selecciona después solo para diseño normativo bajo gates propios.

### M19 — Release coordinada Experimental 0.3 — plan aprobado

- Ricard seleccionó publicar el valor completado de M18 antes de acumular otro
  milestone funcional o framework target.
- [Review 114](../reviews/114-m19-coordinated-0-3-release-promotion-readiness.md)
  ciclo 2 pasó doce áreas sin hallazgos y promueve solo la release coordinada de
  core/base Angular `0.3.0` más el primer piloto Angular Aria `0.1.0` para
  diseño normativo.
- SPEC-008 ya fija versiones, peers, exports y contrato observable; ADR-010
  permite las líneas independientes y no requiere revisión.
- ADR-018 revisión 4 está Accepted tras review 115 ciclo 4 sin hallazgos. Admite
  exactamente los tres paquetes, publicación `next` dependency-first,
  transición `latest` dependent-first, observación del primer tag del piloto y
  recuperación immutable.
- PLAN-021 revisión 0 está Approved tras review 116 ciclo 3, que repitió
  catorce áreas y documentación de cierre sin hallazgos. Autoriza solo sus
  checkpoints locales 1–3. Checkpoint 1 completa el descriptor desigual de
  tres paquetes, tooling/evidence y modos consumidores tras review 117 ciclo 2
  sin hallazgos. Checkpoint 2 completa release notes, onboarding y checks
  documentales exactos tras review 118 ciclo 3. Checkpoint 3 completa el gate
  local, los tres candidatos dirty-tree deterministas, dry runs neutrales y las
  22 filas tras review 119 ciclo 5 sin hallazgos.
- Repositorio público/OIDC/provenance, D-043, Stable, nuevas capacidades,
  React/Vue y Angular legacy permanecen fuera. No hay tarea de implementación
  activa ni acción externa autorizada.

### Orden de dependencias a más largo plazo

1. **Next action:** stop for explicit PLAN-021 checkpoint 4 authorization to
   review the scoped diff, commit, push privately and rebuild from that exact
   clean commit before selecting publication candidates.
2. **External gates:** checkpoint 4 Git actions, every registry read and every
   npm mutation remain separately gated.
3. **Later candidates:** React, Vue and all other capabilities remain
   demand-driven; D-043 and D-033 are not implied by M15/M16.

Las demás entradas diferidas continúan condicionadas a demanda. Esta propuesta
no programa validación asíncrona, bridges de validación Angular, definiciones
dinámicas, plugins, persistencia, productos ni trabajo comercial.
