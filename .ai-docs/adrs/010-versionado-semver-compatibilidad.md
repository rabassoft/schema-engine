# ADR 010: Versionado independiente, SemVer Stable y compatibilidad explícita

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Revisión:** 1 — correcciones de la revisión formal
- **Relacionado con:** [`ADR-002`](./002-versionado-lockstep.md), [`ADR-006`](./006-limite-paquete-inicial.md), [`ADR-009`](./009-politica-api-publica-estabilidad.md), [`D-028`](../roadmap/deferred-decisions.md)
- **Sustituiría al aceptarse:** [`ADR-002`](./002-versionado-lockstep.md)

## 1. Contexto

El workspace contiene dos paquetes privados en versión `0.0.0`:

- `@rabassoft/schema-engine`, neutral respecto a frameworks;
- `@rabassoft/schema-engine-angular`, que depende del core y de Angular.

ADR-009 ya delimita sus APIs públicas y las clasifica inicialmente como Public,
Experimental y Active. Falta decidir cómo expresar cambios de producto,
compatibilidad entre paquetes, compatibilidad con Angular y la ventana mínima de
deprecación de futuras APIs Stable.

El ADR-002 pre-SPEC propone que la major del adaptador coincida con la major de
Angular. Esa numeración confundiría la madurez y los breaking changes de Schema
Engine con el calendario semestral del framework: una versión 22 del adaptador
no significaría que hayan existido 21 majors del producto. También impediría
expresar que un mismo artefacto es compatible con más de una major de Angular.

El repositorio compila actualmente el adaptador con Angular 22.0.6 en modo
parcial y declara `@angular/core` y `@angular/forms` como peer dependencies. La
documentación oficial de Angular requiere peers para las dependencias
`@angular/*` de una librería y establece que la aplicación consumidora use una
versión de Angular igual o posterior a la usada para construir la librería.

## 2. Decisión

### 2.1 Unidad de versionado

Cada paquete publicable tendrá su propio SemVer de producto:

- `@rabassoft/schema-engine` evoluciona según los cambios de su API y
  comportamiento neutrales;
- `@rabassoft/schema-engine-angular` evoluciona según los cambios de su API,
  comportamiento y matriz de compatibilidad;
- la major del adaptador no coincide necesariamente con la major de Angular;
- los paquetes no están obligados a compartir versión ni a publicarse juntos;
- el paquete raíz del workspace sigue siendo privado y no forma parte del
  versionado público.

La primera publicación planificada de cada paquete partirá de `0.1.0`. Esta ADR
no cambia todavía `0.0.0`, `private: true` ni autoriza publicación.

### 2.2 SemVer y niveles de estabilidad

Schema Engine aplica SemVer 2.0.0 a la superficie de compatibilidad declarada
como Public + Stable. ADR-009 también denomina Public a exports Experimental
importables, por lo que la política completa es explícitamente **SemVer para la
superficie Stable más una extensión Experimental**. Mientras un entry point
contenga exports Experimental, no se afirmará que toda su superficie importable
recibe las garantías estrictas de SemVer.

Mientras un paquete permanezca en `0.y.z`:

- PATCH contiene correcciones compatibles y no introduce incompatibilidades
  intencionadas;
- MINOR puede añadir funcionalidad o cambiar de forma incompatible APIs
  Experimental, siempre mediante SPEC, ADR o plan aprobado y con notas de
  migración cuando existan consumidores;
- la primera promoción explícita de una superficie Public + Stable requiere
  versionar el paquete como `1.0.0` o superior.

Desde `1.0.0`, la superficie Public + Stable gobierna SemVer:

- PATCH: correcciones compatibles sin nueva API pública;
- MINOR: funcionalidad compatible, nuevas APIs y deprecaciones;
- MAJOR: retirada o cambio incompatible de una API Stable, o reducción
  incompatible de una matriz de dependencias soportada.

Las APIs Experimental siguen fuera de las garantías SemVer de la superficie
Stable, incluso dentro de un paquete `1.x`. Cada export Experimental deberá
estar identificado como tal en la documentación de API y cualquier cambio
incompatible deberá aparecer en las release notes. Un consumidor no puede
inferir compatibilidad Experimental solo a partir de la versión del paquete.
Aun así, un cambio incompatible Experimental requiere como mínimo MINOR, nunca
PATCH. Ni `1.0.0` ni cualquier incremento de versión promociona una API
automáticamente: la promoción continúa siendo una decisión explícita según
ADR-009.

### 2.3 Coordinación entre core y adaptador

El adaptador expondrá tipos y valores del core en contratos públicos, por lo que
declarará `@rabassoft/schema-engine` como peer dependency con un rango SemVer
compatible y como dependencia de desarrollo del workspace. Esto evita instalar
silenciosamente una segunda copia incompatible y hace visible la combinación
requerida al consumidor.

Durante desarrollo se usará el protocolo `workspace:`. El plan de publicación
deberá verificar que el paquete generado contiene un rango SemVer normal, no un
specifier local. Para la línea inicial `0.1`, el rango compatible previsto es
`^0.1.0`, equivalente a `>=0.1.0 <0.2.0`.

Los paquetes se publicarán de forma independiente:

- un cambio solo del core no fuerza una release del adaptador si su rango y su
  matriz ya lo cubren y las pruebas de integración pasan;
- un cambio solo del adaptador no fuerza una release del core;
- ampliar el rango compatible del core o de Angular requiere una release MINOR
  del adaptador;
- reducir un rango compatible es breaking: MINOR durante `0.y` y MAJOR desde
  `1.0.0`;
- un cambio coordinado incompatible necesita releases compatibles de ambos
  paquetes y una ruta de actualización documentada.

`tslib` permanece como dependencia directa del adaptador. Las dependencias
`@angular/*` usadas por la librería permanecen como peer dependencies, nunca
como dependencias runtime privadas.

### 2.4 Matriz de compatibilidad Angular

Cada release del adaptador publicará una matriz con, como mínimo:

| Adaptador | Core     | Angular core/forms | Build/test Angular | Estado                            |
| --------- | -------- | ------------------ | ------------------ | --------------------------------- |
| `0.1.x`   | `^0.1.0` | `>=22.0.6 <23.0.0` | `22.0.6`           | Inicial, pendiente de publicación |

El límite inferior inicial es 22.0.6 porque es la versión con la que se compila
el artefacto parcial actual; no se declarará compatibilidad con una versión de
aplicación anterior a la versión de build. La matriz distinguirá el rango
soportado de las versiones concretas de build y test. Antes de publicar se
probarán el límite inferior y el último patch disponible dentro del rango.
Minors y patches futuros que ya satisfagan el rango se consideran compatibles
por el contrato SemVer de Angular, pero se incorporarán a CI a medida que estén
disponibles; no requieren ampliar el peer range.

La política para ampliar o reducir la matriz será:

- no se promete equivalencia automática con `current`, `current - 1` ni con
  todas las majors que Angular mantenga en LTS;
- una nueva major de Angular se añade solo después de superar build, tipos,
  tests, package smoke y una aplicación consumidora mínima;
- si el mismo artefacto y API funcionan, el rango se amplía en una MINOR del
  adaptador;
- si soportarla exige romper la API del adaptador, se aplica el incremento
  breaking correspondiente;
- elevar el mínimo o retirar una major Angular soportada es breaking;
- una major Angular declarada por una release Stable del adaptador no se
  retirará antes de finalizar su LTS oficial, salvo excepción de seguridad o
  imposibilidad técnica registrada en un ADR.

Los peers iniciales seguirán siendo únicamente `@angular/core` y
`@angular/forms`, con el mismo rango acotado. El contrato de compatibilidad solo
es válido cuando ambos resuelven a la misma versión exacta de Angular. Los rangos
peer por sí solos no expresan esa igualdad, de modo que la matriz, la
documentación de instalación y las pruebas consumidoras usarán y verificarán
tuplas alineadas; una combinación desalineada queda explícitamente sin soporte.
No se declararán peers de Angular que el código no importe.

### 2.5 Ventana exacta de deprecación

Para una API Public + Stable:

1. La deprecación se introduce en una MINOR con `@deprecated`, reemplazo, guía
   de migración y fecha pública de inicio.
2. Después de esa deprecación debe publicarse al menos una release MINOR
   posterior que todavía contenga el contrato deprecado.
3. La API permanece disponible durante al menos 180 días desde la release que
   introdujo la deprecación. Deben cumplirse tanto este plazo como la MINOR
   posterior.
4. La retirada solo ocurre en una MAJOR posterior. Si no se ha publicado esa
   MINOR, no puede retirarse aunque hayan transcurrido 180 días.
5. Durante la ventana conserva las garantías Stable definidas por ADR-009.

Las APIs Experimental no reciben una ventana temporal mínima, pero cualquier
retirada o cambio incompatible debe estar aprobado y documentado, y nunca se
publica como PATCH.

Reducir una matriz Stable se anuncia en una MINOR. Después debe publicarse otra
MINOR que conserve el rango anterior, y este permanece soportado durante al
menos 180 días desde el anuncio antes de retirarlo en una MAJOR. Retirar una
major de Angular sigue además la regla de LTS de la sección 2.4. Una excepción
por seguridad o imposibilidad técnica requiere aviso explícito y un ADR
específico, como ya exige ADR-009.

### 2.6 Verificación de una release

Antes de publicar cualquier versión se deberá verificar:

- clasificación del cambio contra la superficie de ADR-009;
- diff de exports y declaraciones;
- rangos peer, alineación exacta de peers Angular y matriz de compatibilidad;
- instalación desde tarballs empaquetados en una aplicación consumidora limpia;
- build, lint, tipos, tests y package smoke para cada combinación declarada;
- ausencia de specifiers `workspace:` en los manifests consumibles;
- notas de migración y deprecación cuando correspondan.

La automatización concreta, registry, provenance, tags y credenciales se
definirán en un plan de publicación separado.

## 3. Conflictos resueltos

- ADR-002 queda **Superseded**: se conserva como contexto histórico, pero se
  rechaza alinear la major del adaptador con Angular.
- ADR-006 mantiene el nombre y límite del core; esta decisión añade únicamente
  su política de versión.
- ADR-009 mantiene la clasificación de API; esta decisión concreta SemVer y la
  ventana de deprecación sin promocionar ningún símbolo a Stable.
- D-028 queda promovida a esta ADR.

## 4. Consecuencias

### Positivas

- Las versiones comunican cambios del producto, no el calendario de Angular.
- Un artefacto puede declarar compatibilidad con una o varias majors Angular sin
  renumerarse artificialmente.
- Core y adaptador pueden evolucionar de forma independiente con combinaciones
  verificables.
- Los consumidores reciben límites instalables y una ventana de migración
  objetiva para APIs Stable.

### Negativas

- Es obligatorio mantener una matriz y probar sus extremos.
- Las releases coordinadas requieren decidir y validar dos rangos de versión.
- Una dependencia peer del core hace explícita su instalación al consumidor.
- Los 180 días más una MINOR posterior pueden retrasar una limpieza deseada.

## 5. Alternativas consideradas

### Alinear la major del adaptador con Angular

Rechazado porque mezcla dos ciclos de producto, aparenta una madurez inexistente
y no representa compatibilidad con más de una major. Es la opción histórica de
ADR-002.

### Versionar todos los paquetes en lockstep de producto

Rechazado porque una corrección neutral del core no debe producir una release
vacía del adaptador, ni una ampliación de peers Angular debe renumerar el core.

### Usar rangos Angular abiertos o solo una matriz documental

Rechazado porque permitiría instalar combinaciones no verificadas. Los peers y
la matriz deben expresar el mismo límite.

### Mantener el core como dependencia runtime privada del adaptador

Rechazado porque los contratos públicos Angular exponen tipos del core y una
copia anidada incompatible podría divergir de la usada directamente por la
aplicación.

### Ventana de 90 días o de dos majors Angular

Noventa días se considera demasiado breve para una API Stable. Dos majors
Angular acoplarían de nuevo la política del producto al calendario del framework.
La regla de 180 días más una MINOR posterior es temporal y estructural.

## 6. Fuera de alcance

- Publicar ahora, retirar `private`, cambiar `0.0.0` o crear tags.
- Seleccionar npm u otro registry, access, provenance y firma.
- Automatización de changelog, release notes o `ng update` migrations.
- Promover SPEC-001 o cualquier API a Stable.
- Soporte CommonJS, nuevos entry points o nuevos paquetes.
- Política de soporte de Node.js, TypeScript y navegadores más allá de los
  requisitos heredados de la matriz Angular.

## 7. Criterios de revisión

Revisar la decisión antes de la primera publicación, al promover la primera API
a Stable, cuando exista un segundo adaptador o si la matriz demuestra que el
versionado independiente produce incompatibilidades difíciles de gestionar.

## 8. Resultado de la aceptación

La revisión formal y la aceptación confirmaron:

1. SemVer independiente para core y adaptador, sin lockstep entre sí ni con
   Angular.
2. Primera release prevista `0.1.0`, SemVer aplicado a la superficie Stable,
   extensión Experimental explícita con incompatibilidades solo en MINOR y
   primera superficie Stable en `1.0.0` o superior.
3. Core como peer del adaptador, peers Angular acotados, misma versión exacta
   para Angular core/forms y matriz obligatoria.
4. Compatibilidad inicial `>=22.0.6 <23.0.0`, compilación parcial y prueba de los
   extremos declarados.
5. Ampliar rangos en MINOR y reducirlos como breaking change.
6. Deprecación Stable durante 180 días, al menos una release MINOR posterior que
   retenga el contrato y retirada solo en MAJOR.
7. Que aceptar la ADR no modifica manifests, publica paquetes ni promociona APIs
   a Stable.

## 9. Referencias

- [Semantic Versioning 2.0.0](https://semver.org/)
- [npm: About semantic versioning](https://docs.npmjs.com/about-semantic-versioning/)
- [Angular: Versioning and releases](https://angular.dev/reference/releases)
- [Angular: Version compatibility](https://angular.dev/reference/versions)
- [Angular: Creating libraries](https://angular.dev/tools/libraries/creating-libraries)
- [Angular Package Format](https://angular.dev/tools/libraries/angular-package-format)
