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

> M7 tiene decisión y contrato aceptados, pero carece aún de PLAN-007 aprobado e
> implementación. M8-M12 continúan como propuestas de planificación. Ninguna
> otra decisión diferida se promueve sin revisar y aprobar explícitamente su
> ADR, SPEC y/o plan de implementación.

### M7 — Limpieza explícita de campos

- Candidato de origen: D-010.
- Estado: ADR-012 revision 1 Accepted; contrato sincronizado en SPEC-001
  v0.1.15, PLAN-007 pendiente e implementación no iniciada.
- Preparar, revisar y aprobar PLAN-007 para la affordance común, accesible y
  localizable que distingue missing, `""`, `0` y `false` antes de implementar.

### M8 — Preparación de la versión experimental 0.1

- Validar la instalación desde artefactos empaquetados y un consumidor limpio.
- Aplicar las comprobaciones de versión, peer ranges, matriz de compatibilidad,
  declaraciones y release notes de ADR-010.
- Mantener la publicación como decisión explícita separada; este hito no implica
  registry, licencia, provenance, credenciales ni automatización.

### M9 — Objetos anidados

- Candidato de origen: D-005.
- Promover la capacidad mediante una nueva SPEC y las ADR necesarias para
  contenedores normalizados, paths profundos, operaciones inmutables, semántica
  del runtime, scopes, diagnósticos, IDs y renderizado Angular recursivo.
- Revisar ADR-005 antes de implementar, como exigen sus criterios de revisión.

### Orden de dependencias a más largo plazo

1. **M10 — Arrays (D-006):** solo después de aceptar el modelo de objetos
   anidados.
2. **M11 — Resolución y composición de schemas (D-014 + D-007):** establecer el
   modelo intermedio resuelto antes de `$ref` y applicators.
3. **M12 — UI Schema avanzado (D-011 + D-012):** solo después de disponer de
   contenedores y un contrato neutral de layout.

Las demás entradas diferidas continúan condicionadas a demanda. Esta propuesta
no programa validación asíncrona, bridges de validación Angular, definiciones
dinámicas, plugins, persistencia, productos ni trabajo comercial.
