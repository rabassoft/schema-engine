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

### M19 — Release coordinada Experimental 0.3 — completada

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
  22 filas tras review 119 ciclo 5 sin hallazgos. Checkpoint 4 fija y sube el
  commit privado `ce3ef3d`, reconstruye limpio y selecciona los tres bytes
  idénticos tras review 120 ciclo 3. Checkpoint 5 publica/verifica core `0.3.0`
  bajo `next` tras review 122 ciclo 3; `latest` permanece `0.2.0` y base/piloto
  siguen sin publicar. Checkpoint 6 publica/verifica base `0.3.0` bajo `next`
  tras review 124 ciclo 2; ambos `latest` permanecen `0.2.0` y el piloto sigue
  ausente. Checkpoint 7 pre-publication pasa review 125 ciclo 5 y la publicación
  exacta del piloto completa checkpoint 7 tras review 126 ciclo 4. Los tres
  paquetes resuelven la línea inspeccionada bajo `next`; npm creó además
  `latest: 0.1.0` para el piloto. Checkpoint 8 lo reobserva y retiene sin
  mutación tras review 127 ciclo 2. Checkpoint 9 pre-transition pasa review 128
  ciclo 1 y la transición base completa checkpoint 9 tras review 129 ciclo 1.
  Base queda `next/latest: 0.3.0`, piloto `next/latest: 0.1.0` y core conserva
  `next: 0.3.0`, `latest: 0.2.0` en la ventana mixta prevista. Checkpoint 10
  pre-transition pasa review 130 ciclo 1 y la transición core completa
  checkpoint 10 tras review 131 ciclo 1. Core/base quedan
  `next/latest: 0.3.0`, piloto `next/latest: 0.1.0`; `latest` y unqualified
  consumers pasan. Checkpoint 11 repite finalmente workspace, artefactos,
  source, seguridad, registro, consumers y las 22 filas SPEC-008; review 132
  ciclo 1 corrige el store offline y documentación activa obsoleta; ciclo 2
  corrige la versión pnpm del borrador; ciclo 3 corrige una afirmación obsoleta
  sobre `latest`, y ciclo 4 pasa toda la revisión sin hallazgos, completando
  PLAN-021/M19.
- Repositorio público/OIDC/provenance, D-043, Stable, nuevas capacidades,
  React/Vue y Angular legacy permanecen fuera. No hay tarea de implementación
  activa ni acción externa autorizada.

### M20 — Layout estático local en objetos e items — completado

- Ricard seleccionó continuar madurando core/Angular/Standard antes de
  React/Vue mediante el slice restante de D-011 más próximo al contrato M18:
  bosques de presentación estáticos dentro de objetos anidados e items de
  colecciones homogéneas.
- [Review 133](../reviews/133-d011-m20-nested-item-layout-promotion-readiness.md)
  ciclo 3 pasó doce áreas sin hallazgos. Promueve solo secciones, tabs,
  accordions y grid lógico ya aceptados sobre los hijos directos de cada
  propietario estructural local.
- Los labels, supporting text, issues y acciones fijas de objeto/colección/item
  permanecen fuera del bosque. El layout no crea scopes, workflow, condiciones,
  operaciones, persistencia ni estado controlado.
- Cada template de item conserva una única definición estática, mientras cada
  instancia posee estado visual efímero ligado a su ID estable; el movimiento
  preserva el host y la eliminación lo destruye.
- ADR-025 revisión 0 está Accepted tras review 134 ciclo 4 sin hallazgos. Fija
  el modelo genérico con especialización de templates, bosques requeridos,
  namespaces/keys locales, IDs por instancia estable, fallback local, cache de
  textos y migración mínima del SPI Angular.
- SPEC-009 v0.1.0 está Accepted tras review 135 ciclo 6 sin hallazgos. Cierra
  gramática local, contratos genéricos, diagnósticos/fallback, identidad/estado,
  ciclo de vida, SPI, native/Aria/Standard y la matriz de conformidad M20.
- PLAN-022 revisión 0 completó sus ocho checkpoints tras reviews 137–144. La
  revisión final 144 ciclo 3 repitió la matriz congelada completa y las 27 filas
  SPEC-009 con cero hallazgos.
- M20 implementa bosques locales en core, Angular native, Standard y el piloto
  Angular Aria sin cambiar dependencias, versiones, release, Git ni estado
  externo. Los artefactos publicados conservan su contrato anterior hasta una
  release futura separadamente aprobada.
- Wizards, acciones, slots, D-012, D-018, theming general, React/Vue, Angular
  legacy, SSR/hydration y layouts responsivos continúan Deferred.

### M21 — Entrega Experimental coordinada de M20 — completado

- Ricard seleccionó la opción A de
  [review 145](../reviews/145-post-m20-milestone-selection.md): entregar M20
  antes de acumular otro milestone funcional o framework.
- [Review 146](../reviews/146-m21-coordinated-m20-release-promotion-readiness.md)
  ciclo 3 pasó catorce áreas sin hallazgos y promueve solo diseño normativo para
  core/base Angular `0.4.0` y Angular Aria `0.2.0`.
- Los peers Schema Engine previstos son core `^0.4.0` desde base y base
  `^0.4.0` desde el piloto. Angular permanece `>=22.0.6 <23.0.0`; Aria/CDK
  permanecen `>=22.0.5 <23.0.0`.
- ADR-018 revisión 5 está Accepted tras review 147 ciclo 5 sin hallazgos. Fija
  los tres paquetes ya existentes, publicación `next` dependency-first,
  transición `latest` piloto/base/core, fallos parciales y gates.
- PLAN-023 revisión 0 está Approved tras review 148 ciclo 2 sin hallazgos.
  Autoriza solo checkpoints locales 1–3; checkpoint 4, Git y toda lectura o
  mutación de registry permanecen gated.
- Checkpoint 1 queda completado tras review 149 ciclo 2: descriptor M21,
  manifests `0.4.0`/`0.4.0`/`0.2.0`, peers empaquetados, tooling y regresiones
  M19/M20 pasan sin candidato ni acción externa.
- Checkpoint 2 queda completado tras review 150 ciclo 5: las notas `0.4.0`, el
  onboarding fuente/live, la migración/compatibilidad, recuperación exacta y
  checks fail-closed pasan doce áreas sin hallazgos. No se ha seleccionado
  candidato ni cambiado lockfile, Git, npm, tags, repositorio, D-043 o estado
  externo.
- Checkpoint 3 queda completado tras review 151 ciclo 2: la matriz congelada,
  las 27 filas SPEC-009, artefactos/source/security, consumidores lower/latest,
  tres candidatos dirty-tree deterministas y dry runs neutrales pasan sin
  hallazgos. La evidencia conserva `sourceCommit: null`; no son candidatos
  seleccionados para publicar y no hubo Git, registry ni acción externa.
- Checkpoint 4 queda completado tras review 152 ciclo 3: el scope de 128
  archivos excluye `angular.json`, commit privado `07755b4` está en
  `origin/develop` y la reconstrucción limpia selecciona tres candidatos
  byte-idénticos con `sourceCommit` exacto. No hubo registry, publicación, tag
  ni cambio de settings.
- El primer intento read-only de checkpoint 5 confirma registry oficial/npm
  10.9.8 y se pausa fail-closed porque identidad, perfil, organización y acceso
  devuelven `E401`. No se consultaron paquetes/versiones/tags ni hubo mutación.
- Ricard restaura la sesión y review 153 ciclo 3 completa el preflight de
  checkpoint 5 con cero hallazgos: identidad/2FA/autoridad, settings, M19
  inmutable, ausencia M21 y core seleccionado coinciden. Publicar sigue gated.
- Ricard publica core `0.4.0`; review 154 ciclo 5 verifica bytes, firma,
  metadata, source/licencia, `next: 0.4.0`, `latest: 0.3.0` y consumidores
  exact/`next`. Base/piloto/aliases restantes no cambian.
- Review 155 ciclo 1 completa el preflight de base Angular `0.4.0`: core live,
  candidato/peers/source, ausencia, aliases, consumidores lower/latest y dry
  run neutral pasan sin hallazgos. Publicar base sigue gated.
- Ricard publica base Angular `0.4.0`; review 156 ciclo 2 verifica bytes, firma,
  metadata, peers/source/licencia, el par core/base bajo `next` y consumidores
  exact/`next` lower/latest. Ambos `latest` siguen `0.3.0`; piloto no cambia.
- Review 157 ciclo 2 completa el preflight del piloto `0.2.0`: autoridad, par
  core/base live, candidato/peer/source/exports/styles, ausencia, aliases,
  consumidores lower/latest y dry run neutral pasan sin hallazgos. Publicar el
  piloto sigue gated.
- Ricard publica piloto `0.2.0`; review 158 ciclo 2 verifica bytes, firma,
  metadata, peers/exports/source/licencia, los tres paquetes bajo `next` y las
  matrices M20 exact/`next` lower/latest. Todos los `latest` quedan sin cambios.
- Review 159 ciclo 1 completa el preflight read-only de checkpoint 8: identidad/
  autoridad, M21 exact/`next`, defaults M19, aliases/settings y matrices
  exact/`next` lower/latest pasan sin hallazgos; no hubo mutación.
- Ricard mueve solo piloto `latest` a `0.2.0`; review 160 ciclo 3 verifica el
  alias, bytes/firma/metadata y ausencia de drift. Core/base `latest` siguen
  `0.3.0`; la ventana mixta no aporta evidencia default coordinada.
- Review 161 ciclo 1 corrige una expresión obsoleta demasiado amplia de
  ROADMAP; ciclo 2 corrige el formato del acta, ciclo 3 corrige un marcador
  documental, ciclo 4 estabiliza el segundo marcador y ciclo 5 repite el
  preflight read-only completo de checkpoint 9 sin hallazgos ni mutación.
- Ricard mueve solo base Angular `latest` a `0.4.0`; review 162 ciclo 2
  verifica el alias, bytes/firma/contrato y ausencia de drift. Base/piloto son
  M21 bajo `latest`; core `latest` sigue `0.3.0`, por lo que no existe evidencia
  default coordinada.
- Antes de completar el preflight separado de checkpoint 10, la primera
  observación encuentra core `latest: 0.4.0`; no se revierte ni se muta nada
  más. Review 163 ciclo 3 verifica core/base `next/latest: 0.4.0`, piloto
  `next/latest: 0.2.0` y las ocho matrices exact/`next`/`latest`/unqualified sin
  hallazgos.
- Checkpoint 11 y PLAN-023 revisión 0 quedan completados tras review 164 ciclo 3. La revisión final repite identidad/autoridad npm, bytes y contratos
  públicos, M19 inmutable, matriz local, 27 filas SPEC-009, regresión M18, los
  ocho consumidores registrales y toda la documentación con cero hallazgos.
  M21 queda Public + Experimental + Active sin autorizar otra acción externa.

### M22 — Repositorio público y releases seguras — checkpoint 5 completado

- Ricard seleccionó D-043 como siguiente milestone el 21 de julio de 2026.
- [Review 165](../reviews/165-d043-m22-repository-publication-promotion-readiness.md)
  ciclo 2 promueve únicamente diseño normativo y rechaza publicar el repositorio
  actual tal cual.
- La auditoría inicial observa 62 commits alcanzables con una sola identidad,
  ningún secreto por heurística y una ruta local histórica; los 235 documentos
  `.ai-docs`, ramas, políticas y settings requieren clasificación y saneamiento
  fail-closed.
- Ricard seleccionó conservar el historial tras saneamiento y publicar
  `.ai-docs` solo después de su clasificación/saneamiento completos.
- ADR-026 revision 0 y ADR-018 revisión 6 están Accepted tras review 166 ciclo 3
  sin hallazgos. Autorizan preparar/revisar PLAN-024, no implementación,
  reescritura, workflow, cambio de visibilidad/settings, metadata, release,
  commit ni push.
- PLAN-024 revisión 0 está Approved tras review 167 ciclo 3 sin hallazgos. Solo
  autorizó checkpoint 1 local.
- Checkpoint 1 quedó completado tras review 168 ciclo 3 sin hallazgos no
  resueltos: políticas públicas, guardas del árbol/historial/documentación y
  preparación npm fail-closed pasan en sus modos esperados. El historial actual
  conserva exactamente la ruta local histórica ya clasificada.
- Checkpoint 2 quedó completado tras review 169 ciclo 3: herramientas oficiales
  verificadas, fixtures redactados/deterministas y workflows con SHA completo,
  mínimo privilegio y publicación fail-closed pasan sin hallazgos pendientes.
- Checkpoint 3 publicó el baseline privado `300eb78`; review 170 ciclo 1 detectó
  que un checkout limpio necesitaba build antes de lint. El commit correctivo
  normal `a594f73` quedó en private `develop`; ciclo 2 verificó ese hash remoto
  exacto desde un worktree detached limpio y pasó la matriz completa sin
  hallazgos. `main`, visibilidad y settings permanecen sin cambios.
- Checkpoint 4 quedó completado tras review 171 ciclo 1: el mirror privado
  owner-only congeló refs y 2.778 objetos; las nueve capas de secretos, rutas,
  identidad, artefactos, binarios, derechos, contenido e inventario pasaron sin
  hallazgos pendientes. Solo permanece la ruta histórica ya clasificada que
  checkpoint 5 deberá reemplazar localmente si se autoriza.
- Checkpoint 5 quedó completado tras review 172 ciclo 3: dos mirrors producen
  la misma reescritura/mapa de 65 commits y el mismo commit de evidencia; solo
  cambia la ruta clasificada, el historial saneado y la matriz completa pasan
  sin hallazgos y el remoto continúa intacto.
- Checkpoint 6 ejecutó el bundle privado verificado, reemplazo atómico con
  leases exactos y adopción local sobre `1431e45`; reviews 173 ciclos 1–2
  corrigieron frases activas obsoletas y el ciclo 3 repitió el clon remoto,
  saneamiento y matriz completa sin hallazgos. El ciclo 4 verifica el commit de
  cierre/fast-forward atómico autorizado y completa el checkpoint; visibilidad
  permanece private.

### Orden de dependencias a más largo plazo

1. **Next action:** presentar y autorizar inmediatamente checkpoint 7: cambiar
   únicamente la visibilidad GitHub de private a public.
2. **External gates:** el cierre M21 no autoriza GitHub Release, tag Git,
   provenance ni cambios de settings.
3. **Later candidates:** React, Vue and all other capabilities remain
   demand-driven; M22 does not imply D-033 or functional work.

Las demás entradas diferidas continúan condicionadas a demanda. Esta propuesta
no programa validación asíncrona, bridges de validación Angular, definiciones
dinámicas, plugins, persistencia, productos ni trabajo comercial.
