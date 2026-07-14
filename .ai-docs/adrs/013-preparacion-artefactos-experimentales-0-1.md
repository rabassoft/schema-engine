# ADR 013: Preparación verificable de artefactos experimentales 0.1

- **Estado:** Accepted
- **Fecha:** 14 de julio de 2026
- **Fecha de aceptación:** 14 de julio de 2026
- **Revisión:** 1 — precisión de red, versión superior y no distribución
- **Estado de revisión:** revisión formal repetida sin hallazgos; revisión 1
  aceptada explícitamente
- **Relacionado con:** [`ADR-006`](./006-limite-paquete-inicial.md),
  [`ADR-009`](./009-politica-api-publica-estabilidad.md),
  [`ADR-010`](./010-versionado-semver-compatibilidad.md),
  [`SPEC-001`](../specs/001-controlled-form-runtime.md) y
  [`D-040`](../roadmap/deferred-decisions.md#d-040-publicacion-real-de-paquetes)
- **Milestone:** M8 — Preparación de la versión experimental 0.1

## 1. Contexto

M1–M7 y G0 han completado y revisado el primer runtime controlado. El workspace
contiene dos paquetes instalables desde sus artefactos construidos, pero ambos
siguen en `0.0.0`, con `private: true`, y sus manifests todavía reflejan la
configuración de desarrollo anterior a ADR-010.

La revisión de M8 encuentra dos conflictos concretos con ADR-010:

- `@rabassoft/schema-engine-angular` declara el core como dependencia runtime
  `workspace:*`, no como peer más dependencia de desarrollo;
- sus peers Angular usan `^22.0.0`, que permite versiones anteriores al mínimo
  verificado `22.0.6`.

También faltan artefactos de documentación orientados al consumidor, release
notes de la candidata inicial y una prueba reproducible que instale los
tarballs en consumidores limpios. Los package smoke actuales prueban el output
construido dentro del workspace, no el manifest transformado ni el contenido
exacto del tarball.

ADR-009 mantiene toda la API Public como Experimental + Active. ADR-010 fija
versionado independiente, primera release prevista `0.1.0`, el rango inicial de
Angular y las comprobaciones previas a publicación. Ninguna de ellas decide
licencia, registry, access, provenance, firma, credenciales o automatización.

## 2. Decisión propuesta

### 2.1 Frontera de M8

M8 preparará una candidata local, instalable y verificable de cada paquete, pero
no publicará ni hará publicable accidentalmente ningún artefacto:

- ambos paquetes usarán inicialmente `0.1.0`; la coincidencia inicial no crea
  lockstep y versiones posteriores seguirán siendo independientes;
- ambos conservarán `private: true` durante todo M8;
- el paquete raíz seguirá privado y sin versión pública;
- no se crearán tags Git, releases GitHub, dist-tags ni escrituras, publicación
  o autenticación contra un registry;
- cambiar la versión no promocionará ningún símbolo a Stable.

M8 termina cuando los dos tarballs candidatos y su combinación se instalan y
ejercitan desde entornos limpios. La publicación real queda separada en D-040.

### 2.2 Manifest del core

`@rabassoft/schema-engine` pasará a versión `0.1.0` y conservará:

- un único entry point ESM `.` con tipos explícitos;
- `sideEffects: false`;
- cero dependencias runtime y cero peers;
- `private: true`;
- el allowlist de ficheros publicables limitado al output y documentación
  necesaria del paquete.

No se añadirán CommonJS, nuevos entry points, engines ni dependencias.

### 2.3 Manifest del adaptador Angular

`@rabassoft/schema-engine-angular` pasará a versión `0.1.0` y declarará:

- `tslib` como única dependencia runtime directa;
- `@rabassoft/schema-engine` como peer `workspace:^`, transformado por
  `pnpm pack` a `^0.1.0`, y también como dependencia de desarrollo
  `workspace:*` para compilar y probar contra el workspace;
- `@angular/core` y `@angular/forms` como peers exactos por rango
  `>=22.0.6 <23.0.0`;
- `private: true`, el entry point raíz actual y compilación Angular parcial.

El tarball no podrá contener un specifier `workspace:`. El consumidor deberá
resolver exactamente la misma versión de `@angular/core` y `@angular/forms`;
combinaciones desalineadas quedan fuera de soporte aunque satisfagan los rangos
por separado.

### 2.4 Contenido y documentación de los artefactos

Cada paquete tendrá un README propio incluido en su tarball con:

- estado Experimental y ausencia de garantías Stable;
- instalación mediante los nombres públicos de los paquetes;
- entry point soportado y prohibición de deep imports;
- responsabilidad del paquete y límites del prototipo;
- para Angular, peer requirements y matriz de compatibilidad.

Ambos README identificarán el tarball como candidato local no publicado, sin
términos de distribución seleccionados y no apto para distribución externa. El
estado Experimental describe estabilidad técnica; no concede una licencia.

Se prepararán release notes `0.1.0` comunes en el repositorio con inventario de
capacidades, clasificación Experimental, cambios incompatibles futuros
permitidos por ADR-010 y limitaciones conocidas. No se añadirá una licencia ni
un `publishConfig` durante M8.

Los tarballs contendrán únicamente el manifest transformado, README y output
necesario. No incluirán tests, fixtures, fuentes TypeScript, configuración,
lockfiles, credenciales, caches ni secretos.

### 2.5 Verificación de la candidata

La verificación será reproducible y separará preparación de publicación:

1. instalación congelada, formato, lint, tipos, tests, builds, package smoke y
   consumidor existente;
2. `pnpm pack` de cada paquete en un directorio temporal;
3. inspección del inventario y del `package.json` de cada tarball;
4. instalación del core desde tarball en un consumidor ESM/TypeScript limpio;
5. instalación conjunta de ambos tarballs en consumidores Angular limpios;
6. build, typecheck y prueba mínima con Angular `22.0.6` y con la versión
   estable más alta disponible dentro de `>=22.0.6 <23.0.0` en el momento de
   ejecutar M8;
7. comprobación de peers Angular alineados, exports/declaraciones, ausencia de
   `workspace:` y ausencia de dependencias o ficheros inesperados.

La versión superior se resolverá mediante metadata pública de paquetes,
excluyendo prereleases y versiones deprecated, y se aplicará como una tupla
exactamente alineada a todos los paquetes Angular del consumidor. Se registrará
su número exacto, fecha de resolución y fuente en la matriz y en las release
notes. Consultar metadata y descargar dependencias para consumidores temporales
son los únicos accesos de red permitidos en M8; no usarán credenciales ni
producirán mutaciones remotas. No se modificará el límite `<23.0.0` solo porque
aparezca una versión nueva.

La comprobación podrá usar scripts de verificación versionados. Las pruebas de
artefacto local serán deterministas; la consulta superior será repetible contra
la metadata disponible y dejará fijada como evidencia la versión resuelta. Los
scripts no crearán automatización de publicación, credenciales ni mutaciones
remotas. Los tarballs y consumidores temporales no se incorporarán al
repositorio ni se distribuirán fuera del entorno de verificación.

## 3. Consecuencias

### Positivas

- Los manifests cumplirán ADR-009/010 antes de elegir un canal de publicación.
- La instalación se probará sobre el artefacto real y no solo sobre el
  workspace enlazado.
- `private: true` mantendrá una barrera contra publicación accidental.
- La matriz distinguirá rangos prometidos de versiones exactas probadas.
- Los consumidores recibirán documentación Experimental junto al paquete.

### Negativas

- Mantener consumidores limpios para dos extremos Angular añade coste y acceso
  de red a la verificación.
- Los dos paquetes comienzan casualmente en `0.1.0`, por lo que la documentación
  deberá evitar sugerir lockstep futuro.
- La candidata seguirá sin poder publicarse ni distribuirse externamente hasta
  resolver D-040 y D-034.
- Los peers del core obligan al consumidor Angular a instalarlo explícitamente.

## 4. Alternativas consideradas

### Publicar directamente en npm durante M8

Rechazado porque faltan decisiones explícitas de licencia, visibilidad,
registry, access, provenance, credenciales y automatización.

### Mantener `0.0.0` y probar solo el output local

Rechazado porque no valida la primera unidad SemVer ni la transformación real de
los manifests consumibles prevista por ADR-010.

### Eliminar `private: true` para probar `npm publish --dry-run`

Rechazado porque `pnpm pack` y consumidores desde tarball cubren la preparación
sin retirar la protección contra publicación accidental.

### Mantener el core como dependencia runtime del adaptador

Rechazado por ADR-010: los contratos Angular exponen tipos del core y una copia
privada podría divergir de la instalada por la aplicación.

### Declarar `^22.0.0`

Rechazado porque afirma compatibilidad con Angular anterior a la versión mínima
de build y test `22.0.6`.

## 5. Fuera de alcance

- Elegir un registry de publicación o realizar operaciones de escritura sobre
  él; solo se permite consultar metadata pública y descargar dependencias para
  la matriz temporal.
- Decidir paquete público o privado en el registry, access o dist-tag.
- Licencia, modelo comercial o términos de distribución.
- Provenance, firma, SBOM, attestations, secretos o credenciales.
- Automatización de release, changelog automático, Git tags o GitHub Releases.
- Promoción de API a Stable, nuevos exports, entry points o comportamiento.
- Soporte Angular 23, CommonJS, nuevos paquetes o política general de Node,
  TypeScript y navegadores.

## 6. Criterios de revisión

1. M8 no produce ninguna mutación remota, no usa credenciales y no reduce la
   protección `private: true`.
2. Los manifests candidatos cumplen exactamente ADR-009 y ADR-010.
3. `0.1.0` no implica lockstep ni promoción a Stable.
4. Los tarballs no contienen `workspace:`, ficheros o dependencias inesperados.
5. Core se instala solo y Angular se instala con core como peer explícito.
6. La matriz prueba `22.0.6` y la versión estable superior exacta de Angular 22,
   sin prereleases/deprecated y con todos los paquetes Angular alineados.
7. README, release notes y declaraciones describen la superficie Experimental.
8. D-040/D-034 y todas las capacidades funcionales diferidas siguen inactivas.

## 7. Resultado de la revisión formal

- **Fecha:** 14 de julio de 2026
- **Primera pasada:** tres precisiones requeridas.
- **Repetición:** las ocho áreas pasan sin hallazgos ni cambios pendientes.
- **Estado:** Accepted revision 1.

Correcciones aplicadas:

1. Se distingue la consulta/descarga pública necesaria para probar
   compatibilidad de cualquier escritura, publicación o autenticación contra un
   registry.
2. La versión superior queda definida como la versión estable más alta dentro
   del rango, excluye prereleases/deprecated, usa una tupla Angular alineada y
   registra número, fecha y fuente.
3. Los tarballs sin licencia quedan limitados al entorno local de verificación;
   Experimental no se interpreta como permiso de distribución.

Resultado repetido:

1. **Frontera:** pasa; M8 prepara candidatos locales y no publica, distribuye ni
   activa otra capacidad.
2. **Versionado:** pasa; `0.1.0` es inicial pero independiente y no promociona
   API a Stable.
3. **Manifests:** pasa; core, Angular, peers, dev dependency y transformación
   `workspace:` coinciden con ADR-009/010.
4. **Artefactos:** pasa; contenido, documentación y exclusiones son
   verificables sin convertir el tarball en distribución autorizada.
5. **Compatibilidad:** pasa tras la corrección; límite inferior y superior
   estable usan tuplas Angular exactas y evidencia reproducible.
6. **Red y seguridad:** pasa tras la corrección; solo metadata/descargas
   públicas, sin credenciales ni mutaciones remotas.
7. **Publicación:** pasa tras la corrección; `private: true`, D-040 y D-034
   conservan toda decisión de publicación y licencia.
8. **Entrega:** pasa; pruebas locales, consumidores temporales, documentación y
   stop conditions permiten preparar PLAN-008 sin cambiar producto.

Ricard aceptó explícitamente ADR-013 revisión 1 el 14 de julio de 2026. La
aceptación permite revisar PLAN-008, pero no aprueba el plan, no activa M8 y no
autoriza cambios de manifest ni publicación.

## 8. Referencias

- [pnpm workspace protocol and pack transformation](https://pnpm.io/workspaces)
- [npm package.json fields, files, exports and private](https://docs.npmjs.com/files/package.json/)
- [npm pack](https://docs.npmjs.com/cli/pack/)
- [Angular library peer dependencies and partial compilation](https://angular.dev/tools/libraries/creating-libraries)
