# ADR 009: Límite de API pública y política de estabilidad

- **Estado:** Proposed
- **Fecha:** 13 de julio de 2026
- **Revisión:** 1 — correcciones de la revisión formal
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md), [`ADR-006`](./006-limite-paquete-inicial.md), [`D-029`](../roadmap/deferred-decisions.md)
- **Requiere revisión posterior:** [`D-028`](../roadmap/deferred-decisions.md)

## 1. Contexto

M1-M5 han producido dos paquetes privados con entry points raíz reales:

- `@rabassoft/schema-engine`, con compilador, operaciones, runtime y contratos
  neutrales;
- `@rabassoft/schema-engine-angular`, con directivas, resolución y creación de
  renderers, proveedores, renderers nativos y resolución de textos.

Ambos paquetes siguen en `0.0.0`, tienen `private: true` y todavía no se
publican. Sin embargo, sus índices ya forman contratos entre paquetes, package
smoke tests y ejemplos futuros. Si no se fija ahora el límite público, una
exportación accidental o un deep import puede convertirse en una obligación de
compatibilidad sin una decisión explícita.

ADR-006 fijó el nombre y entry point inicial del core, pero dejó la política de
estabilidad en D-029. D-028 conserva por separado la decisión de SemVer,
versionado entre paquetes y matriz de compatibilidad con Angular.

## 2. Decisión propuesta

### 2.1 Qué constituye API pública

La API pública importable de un paquete es únicamente la intersección de:

1. los entry points declarados explícitamente en `package.json#exports`;
2. los símbolos exportados por el módulo de declaración de ese entry point.

También forma parte de la compatibilidad cualquier tipo que aparezca de manera
transitiva en la firma pública de uno de esos símbolos, aunque TypeScript lo
represente estructuralmente.

No son API pública:

- rutas bajo `src/`, `dist/`, `test/` o cualquier fichero físico no declarado
  como entry point;
- helpers, clases, tokens o tipos que no exporte el módulo raíz;
- fixtures, fake renderers, funciones de test y configuración de build;
- detalles de implementación observables solo mediante reflection o acceso a
  propiedades privadas.

No se soportan deep imports ni se añadirán export maps con wildcards. Un nuevo
entry point necesita una decisión de límite de paquete o un plan aprobado.

### 2.2 Entry points iniciales

Mientras no se apruebe otra decisión, existen exactamente estos dos entry
points públicos candidatos:

| Paquete                            | Entry point | Responsabilidad                                                  |
| ---------------------------------- | ----------- | ---------------------------------------------------------------- |
| `@rabassoft/schema-engine`         | `.`         | Compiler, operaciones, runtime y contratos neutrales             |
| `@rabassoft/schema-engine-angular` | `.`         | Adaptador Angular, extensibilidad de renderers y kit HTML nativo |

El paquete Angular consumirá el core exclusivamente desde
`@rabassoft/schema-engine`, nunca desde rutas físicas del workspace.

### 2.3 Inventario público actual

El inventario normativo de símbolos será la lista explícita de exports de cada
`src/index.ts`, reflejada en las declaraciones construidas. La auditoría M5
clasifica así la superficie actual:

| Área                        | Símbolos o familias                                                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Core — funciones            | `compileFormDefinition`, `applyOperation`, `applyFormOperation`, `createControlledFormRuntime`                                 |
| Core — contratos            | Todos los types exportados explícitamente por el índice raíz: schemas, definiciones, operaciones, runtime, validación y textos |
| Angular — consumo           | `SchemaFormDirective`, `SchemaFieldOutletDirective`, `provideSchemaEngineAngular`, `provideSchemaEngineAngularNative`          |
| Angular — renderers nativos | `SchemaStringRendererComponent`, `SchemaNumberRendererComponent`, `SchemaBooleanRendererComponent`                             |
| Angular — extensión         | `provideSchemaRenderer`, `AngularRendererResolver` y los contratos públicos de renderer                                        |
| Angular — textos            | `provideSchemaTextResolver`, `SCHEMA_TEXT_RESOLVER`, `AngularFieldTextSnapshot`                                                |
| Angular — configuración     | `AngularControlledFormConfig`                                                                                                  |

`SCHEMA_RENDERER_REGISTRATIONS`, `AngularTextProjector`, `adapterDiagnostic`,
`emptyTextSnapshot`, el codec numérico, los helpers de IDs y los fake renderers
permanecen internos porque no se exportan desde el entry point raíz. Los
consumidores registran extensiones mediante `provideSchemaRenderer()`; el token
multi-provider crudo no es un contrato soportado.

La revisión formal retira `SCHEMA_RENDERER_REGISTRATIONS` del índice raíz antes
de estabilizar o publicar el paquete. El token sigue siendo un detalle interno
del adaptador. No se añade ni se renombra ningún otro símbolo.

### 2.4 Visibilidad, estabilidad y ciclo de vida

La accesibilidad, la estabilidad y la deprecación son dimensiones distintas.
No se representarán mediante un único estado excluyente.

**Visibilidad:**

- **Public:** forma parte de un entry point soportado.
- **Internal:** no forma parte de ningún entry point público y no recibe
  garantía de compatibilidad.

**Estabilidad de APIs Public:**

- **Experimental:** importable y documentada, pero todavía puede cambiar antes
  de estabilizarse.
- **Stable:** sujeta a la política de compatibilidad y deprecación aprobada.

**Ciclo de vida de APIs Public:**

- **Active:** disponible sin intención de retirada registrada.
- **Deprecated:** sigue disponible, conserva su nivel Experimental o Stable y
  tiene reemplazo o ruta de migración documentada.

Todos los exports raíz incluidos en el inventario reciben esta clasificación
inicial: **Public**, **Experimental** y **Active**. Cambiar `private`, `0.0.0`,
la versión o el estado de publicación no los promociona automáticamente. Solo
una decisión explícita puede cambiar su nivel de estabilidad. La aceptación de
esta ADR no los promociona a Stable ni autoriza publicar los paquetes.

Promover un símbolo, grupo o entry point a Stable requiere una revisión
explícita basada en:

- contratos normativos en SPEC o ADR;
- pruebas de comportamiento y construcción desde perspectiva de consumidor;
- documentación de uso y errores esperables;
- ausencia de decisiones abiertas que alteren materialmente su firma.

### 2.5 Cambios y deprecaciones

Un cambio de API incluye añadir, eliminar o renombrar exports; cambiar firmas,
genéricos, optionalidad o mutabilidad; ampliar requisitos de DI; cambiar
semántica observable; o modificar el export map.

Para APIs Public + Experimental:

- se permiten cambios incompatibles sin una fase de deprecación;
- cada cambio debe estar autorizado por SPEC, ADR o plan aprobado;
- debe documentar migración cuando exista código consumidor en el repositorio;
- debe actualizar tests de paquete y persistent project state;
- no se permiten cambios públicos silenciosos dentro de una tarea no
  relacionada.

Para APIs Public + Stable:

- un reemplazo debe estar disponible y documentado antes de retirar el contrato
  anterior;
- la API anterior debe marcarse `@deprecated` y permanecer importable durante
  un periodo posterior;
- la retirada solo puede ocurrir en una release posterior y conforme a la
  ventana exacta que decida D-028;
- una excepción por seguridad o imposibilidad técnica requiere ADR específico.

Marcar una API como Deprecated no reduce sus garantías: una API Public, Stable
y Deprecated continúa siendo Stable hasta su retirada. Toda API Deprecated,
Experimental o Stable debe conservarse en el entry point mientras la política
aplicable exija que siga disponible.

D-028 decidirá las unidades de release, SemVer, coordinación entre paquetes y
duración mínima de la deprecación. Esta ADR fija el orden —introducir,
deprecar, retirar— pero no anticipa esa política de versiones.

### 2.6 Enforcement

Los entry points se gobernarán mediante:

- listas explícitas, sin `export *` desde módulos internos;
- export maps explícitos, sin wildcards;
- package smoke tests que importen y construyan valores públicos desde el nombre
  del paquete;
- pruebas TypeScript desde perspectiva de consumidor para contratos que solo
  existen en declaraciones;
- revisión del diff de declaraciones cuando cambie un índice o una firma
  pública;
- TSDoc `@deprecated` obligatorio para contratos Deprecated.

La automatización concreta se definirá en un plan posterior. No se añade una
herramienta de API extraction mediante esta ADR.

## 3. Consecuencias

### Positivas

- Los consumidores tienen una regla inequívoca: solo importan desde entry
  points declarados.
- Los ficheros internos pueden evolucionar sin convertir su estructura en
  contrato.
- El core y Angular comparten una política sin compartir versionado ni ciclo de
  release por anticipado.
- `provideSchemaRenderer`, `AngularRendererResolver` y los contratos de renderer
  son APIs de extensión públicas de forma deliberada; el token DI crudo no lo
  es.
- D-028 puede decidir SemVer sobre una superficie ya delimitada.

### Negativas

- La superficie raíz Angular sigue siendo amplia y obliga a revisar cada nuevo
  export.
- Los consumidores avanzados no pueden depender de helpers internos como el
  codec numérico.
- Mantener pruebas de declaraciones y revisar diffs de API añade trabajo a cada
  cambio público.
- Todos los contratos públicos siguen Experimental hasta una promoción
  explícita; ni cambiar la versión ni publicar los promociona por sí solo.

## 4. Alternativas consideradas

### Considerar público cualquier fichero compilado

Rechazado porque convierte la estructura física de `dist` en contrato, impide
refactors internos y contradice el export map existente.

### Exponer subpaths por área desde ahora

Rechazado porque todavía no existe evidencia para separar `runtime`,
`renderers`, `native` o `testing` como entry points con ciclos propios.

### Tratar todos los exports actuales como Stable

Rechazado porque SPEC-001 sigue Draft, los paquetes son privados y D-028 no ha
resuelto versiones ni compatibilidad.

### No gobernar la API hasta la primera publicación

Rechazado porque los dos paquetes ya se consumen entre sí y el coste de retirar
exports accidentales aumenta con cada plan.

### Usar una herramienta de API extraction como fuente de verdad

Rechazado por ahora. Puede ayudar a verificar, pero la decisión arquitectónica
de qué es público debe seguir siendo humana y explícita.

## 5. Fuera de alcance

- SemVer, lockstep, versiones independientes y matriz Angular: D-028.
- Publicación, registry, provenance, release automation y changelog de release.
- Licencia y modelo comercial.
- Nuevos paquetes o entry points.
- Promoción de SPEC-001 o de cualquier símbolo a Stable.
- Bridges de `ValidatorFn` y ampliación de D-024.
- Compatibilidad binaria o soporte de CommonJS.

## 6. Criterios de revisión

Revisar esta decisión cuando se proponga un nuevo paquete o entry point, antes
de la primera publicación, cuando exista un segundo adaptador de framework o si
la superficie raíz Angular necesita dividirse por costes medidos.

## 7. Checklist de aceptación

Antes de aceptar, confirmar:

1. Que `package.json#exports` más el índice raíz es el límite público correcto.
2. Que todos los exports del inventario quedan Public + Experimental + Active
   hasta una promoción explícita, independientemente de versión o publicación.
3. Que `provideSchemaRenderer`, `AngularRendererResolver` y los contratos de
   renderer son públicos, mientras `SCHEMA_RENDERER_REGISTRATIONS` es Internal.
4. Que deep imports, testing y helpers internos quedan sin soporte.
5. Que visibilidad, estabilidad y ciclo de vida son ejes separados y que una API
   Stable conserva sus garantías durante la deprecación.
6. Que D-028 conserva SemVer, coordinación de paquetes y ventana exacta de
   deprecación.
7. Que la aceptación no autoriza publicación ni cambios de implementación
   adicionales a la internalización ya revisada del token.
