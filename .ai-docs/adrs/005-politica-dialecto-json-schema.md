# ADR 005: Política de dialecto y compatibilidad de JSON Schema

- **Estado:** Accepted revision 11
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Revisión aceptada:** 11 — compatibilidad de presentación M33
- **Fecha de aceptación de revisión 1:** 14 de julio de 2026
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md)
- **Revisado parcialmente por:**
  [`ADR-011`](./011-enum-string-normalizado-select-nativo.md)
- **Revisión 1 coordinada con:**
  [`ADR-014`](./014-modelo-objetos-anidados-paths-profundos.md) y
  [`SPEC-002`](../specs/002-nested-object-runtime.md)
- **Fecha de aceptación de revisión 2:** 14 de julio de 2026
- **Revisión 2 coordinada con:**
  [`ADR-015`](./015-modelo-colecciones-identidad-operaciones.md) y
  [`revisión de promoción M10`](../reviews/007-m10-arrays-promotion.md)
- **Revisión 3 coordinada con:**
  [`ADR-016`](./016-resolucion-referencias-locales.md) Accepted
- **Fecha de aceptación de revisión 3:** 14 de julio de 2026
- **Autoridad vigente:** las secciones 1–20 conservan la conducta Accepted de
  M1–M33 promovida; revision 11 preserva la familia
  `INVALID_UI_PRESENTATION` de SPEC-005/SPEC-009 para presentación M33
  malformed y limita `INCOMPATIBLE_UI_OPTION` a una presentación válida, bajo
  SPEC-019 v0.1.2 y PLAN-035 revision 2 Approved
- **Revisión 2 completa:** ciclo 3 pasó las nueve áreas sin hallazgos y Ricard
  aceptó formalmente revision 2
- **Revisión 3 completa y aceptada:**
  [`review 018`](../reviews/018-adr-005-revision-3-review.md) ciclo 2 pasó las
  diez áreas sin hallazgos; Ricard aceptó formalmente revision 3
- **Revisión 4 aceptada y coordinada con:**
  [`ADR-019`](./019-hojas-primitivas-nullable.md); solo D-009/M14
- **Fecha de aceptación de revisión 4:** 15 de julio de 2026
- **Revisión 4 completa:**
  [`review 032`](../reviews/032-adr-019-adr-005-revision-4-review.md) ciclo 2
  pasó las diez áreas sin hallazgos
- **Revisión 5 aceptada y coordinada con:**
  [`ADR-027`](./027-formatos-semanticos-string.md); solo D-037/M24
- **Fecha de aceptación de revisión 5:** 30 de julio de 2026
- **Revisión 5 completa:**
  [`review 210`](../reviews/210-adr-027-review.md) ciclo 3 pasó las doce áreas
  sin hallazgos
- **Revisión 6 aceptada y coordinada con:**
  [`ADR-028`](./028-const-primitivo-presentacion-fija.md); solo D-036/M25
- **Fecha de aceptación de revisión 6:** 1 de agosto de 2026
- **Revisión 6 completa:**
  [`review 219`](../reviews/219-adr-028-review.md) ciclo 2 pasó las catorce áreas
  sin hallazgos
- **Revisión 7 coordinada con:**
  [`ADR-031`](./031-static-object-allof-composition.md) Accepted; solo D-007/M28
- **Fecha de aceptación de revisión 7:** 3 de agosto de 2026
- **Autoridad de revisión 7:** diseño normativo Accepted; autoriza únicamente
  preparar/revisar la SPEC M28, no plan, implementación, dependencia, versión
  o publicación
- **Revisión 7 completa:**
  [`review 260`](../reviews/260-adr-005-revision-7-review.md) ciclo 5 pasó las
  once áreas con cero hallazgos; aceptada formalmente bajo la regla autorizada
  de revisión completa sin ampliación de alcance
- **Revisión 8 coordinada con:**
  [`ADR-034`](./034-controlled-homogeneous-string-enum-array-field.md)
  Accepted; solo D-006/M31
- **Autoridad de revisión 8:** diseño normativo Accepted; autoriza únicamente
  preparar/revisar SPEC-017, no plan, contrato activo,
  implementación, dependencia, versión, release, publicación o Git
- **Fecha de aceptación de revisión 8:** 3 de agosto de 2026
- **Revisión 8 completa:**
  [`review 294`](../reviews/294-adr-005-revision-8-review.md) ciclo 2 pasó las
  diez áreas con cero hallazgos tras cinco correcciones; aceptada bajo la regla
  autorizada de revisión completa sin ampliación de alcance
- **Revisión 9 coordinada con:**
  [`ADR-036`](./036-controlled-discriminated-object-alternatives.md) Accepted;
  solo D-007/M33
- **Autoridad de revisión 9:** propuesta normativa; no autoriza SPEC, plan,
  contrato activo, implementación, dependencia, versión, release, publicación
  o Git antes de su revisión completa y aceptación
- **Fecha de aceptación de revisión 9:** 3 de agosto de 2026
- **Revisión 9 completa:**
  [`review 316`](../reviews/316-adr-005-revision-9-adr-036-revision-1-review.md)
  ciclo 2 pasó dieciséis áreas con cero hallazgos después de cinco correcciones

## 1. Contexto y problema

El primer compilador de Schema Engine transformará un subconjunto limitado de
JSON Schema y UI Schema en una `FormDefinition`. Antes de estabilizar esa API es
necesario determinar qué dialecto se interpreta y cómo se diagnostican los
esquemas que omiten el dialecto o contienen keywords fuera del subconjunto.

JSON Schema permite que una implementación defina el comportamiento cuando
falta `$schema` y recomienda tratar las keywords desconocidas como anotaciones.
Schema Engine necesita además diagnósticos deterministas que ayuden a detectar
errores de configuración sin impedir extensiones seguras.

## 2. Decisión

### 2.1 Dialecto de referencia

El dialecto de referencia será JSON Schema Draft 2020-12, identificado por la
URI canónica:

```text
https://json-schema.org/draft/2020-12/schema
```

- La URI canónica declarada en `$schema` se aceptará.
- Si `$schema` está ausente, el compilador asumirá Draft 2020-12 y emitirá el
  warning `MISSING_SCHEMA_DIALECT`.
- El warning por ausencia se emitirá en todos los entornos. El core no conocerá
  conceptos de build de desarrollo o producción.
- Una aplicación podrá filtrar diagnósticos al presentarlos, pero no cambiará
  el resultado determinista del compilador.
- Un `$schema` presente que no sea una URI string válida producirá el error
  bloqueante `INVALID_SCHEMA_DIALECT`.
- Cualquier dialecto declarado distinto de la URI canónica producirá el error
  bloqueante `UNSUPPORTED_SCHEMA_DIALECT`.

### 2.2 Subconjunto soportado

Aceptar Draft 2020-12 no implica implementar todas sus capacidades. El
compilador solo interpretará el subconjunto declarado en `SPEC-001`.

Las keywords se clasificarán así:

1. **Soportadas:** se procesan según `SPEC-001`.
2. **Conocidas pero no soportadas:** reciben un diagnóstico explícito.
3. **Desconocidas:** reciben un warning y se ignoran durante la compilación.

El catálogo inicial queda cerrado de la siguiente forma:

- En la raíz se soportan `$schema`, `type`, `properties`, `required`, `title` y
  `description`.
- En todos los campos se soportan `type`, `title`, `description` y `default`.
- En campos `string` se soportan además `minLength`, `maxLength` y `pattern`.
- En campos `number` e `integer` se soportan además `minimum`, `maximum` y
  `multipleOf`.
- En campos `boolean` no se soportan keywords adicionales.
- `$comment`, `deprecated`, `readOnly`, `writeOnly`, `examples`, `format`,
  `contentEncoding`, `contentMediaType` y `contentSchema` se reconocen como
  anotaciones conocidas ignorables y producen `IGNORED_SCHEMA_KEYWORD`.
- Cualquier otra keyword conocida de Draft 2020-12 que no aparezca en las
  listas anteriores produce `UNSUPPORTED_SCHEMA_KEYWORD` como error
  bloqueante.

ADR-011 introduce una excepción aceptada a este catálogo: `enum` se soporta
únicamente en schemas de campo directos con `type: "string"` que satisfacen su
subconjunto no vacío, homogéneo y sin duplicados. Sus demás ubicaciones, tipos y
formas continúan siendo incompatibles o no soportados según ADR-011. `const`
permanece no soportada y `format` continúa siendo una anotación conocida
ignorada con warning.

Que una keyword figure en el catálogo soportado no permite usarla fuera de las
ubicaciones o tipos definidos en `SPEC-001`. Un uso incompatible es un error de
configuración del schema, no una keyword desconocida.

### 2.3 Keywords desconocidas

Una keyword es desconocida cuando no pertenece al catálogo de Draft 2020-12
conocido por el compilador ni al subconjunto soportado por `SPEC-001`.

- Se emitirá `UNKNOWN_SCHEMA_KEYWORD` como warning no bloqueante por cada
  ubicación desconocida inspeccionada.
- La keyword se ignorará al construir `FormDefinition` y su valor se tratará
  como una anotación opaca.
- El esquema fuente se conservará sin modificaciones para el adaptador externo
  de validación.
- En el primer incremento, ninguna keyword desconocida será bloqueante por sí
  sola, incluido un nombre desconocido que empiece por `$`.
- El compilador no recorrerá el contenido de una keyword desconocida buscando
  subschemas, porque hacerlo supondría interpretar una extensión que no conoce.

Esta regla solo se aplica a los objetos de esquema que el subconjunto inicial
inspecciona: la raíz y los esquemas de campo contenidos directamente en
`properties`.

### 2.4 Validación externa

El compilador comprueba compatibilidad estructural y capacidad de generar una
`FormDefinition`; no sustituye a un validador JSON Schema completo. El
compilador no modificará el esquema fuente. La forma en que el runtime o la
aplicación proporcionarán ese esquema al puerto `SchemaValidator` continúa
siendo una decisión separada y no queda definida por este ADR.

## 3. Diagnósticos

| Código                       | Severidad | Comportamiento                 | `documentPath`     |
| ---------------------------- | --------- | ------------------------------ | ------------------ |
| `MISSING_SCHEMA_DIALECT`     | `warning` | Asume Draft 2020-12 y continúa | `['$schema']`      |
| `INVALID_SCHEMA_DIALECT`     | `error`   | Bloquea la compilación         | `['$schema']`      |
| `UNSUPPORTED_SCHEMA_DIALECT` | `error`   | Bloquea la compilación         | `['$schema']`      |
| `UNSUPPORTED_SCHEMA_KEYWORD` | `error`   | Bloquea la compilación         | Ruta de la keyword |
| `IGNORED_SCHEMA_KEYWORD`     | `warning` | Ignora la anotación conocida   | Ruta de la keyword |
| `UNKNOWN_SCHEMA_KEYWORD`     | `warning` | Ignora la keyword desconocida  | Ruta de la keyword |

Todos estos diagnósticos tendrán `source: 'schema'`. Sus parámetros incluirán:

- `MISSING_SCHEMA_DIALECT`: `assumedDialect`.
- `INVALID_SCHEMA_DIALECT`: `declaredDialect`.
- `UNSUPPORTED_SCHEMA_DIALECT`: `declaredDialect` y `supportedDialect`.
- Diagnósticos de keyword: `keyword`.

Los warnings no impedirán devolver una compilación satisfactoria. Cualquier
error hará que `CompileFormResult.success` sea `false` y que no se devuelva una
definición parcial. El análisis de la rama afectada podrá detenerse para evitar
errores en cascada, mientras se recopilan los demás diagnósticos independientes,
siguiendo la política general de `SPEC-001`.

## 4. Casos soportados y no soportados

Se soportan:

- Draft 2020-12 declarado con su URI canónica.
- `$schema` ausente, con asunción explícita y warning.
- El subconjunto de raíz, campos y constraints definido en `SPEC-001`.
- Anotaciones conocidas ignorables y keywords desconocidas, con warning.

No se soportan:

- Otros dialectos oficiales o personalizados.
- Valores de `$schema` inválidos.
- Keywords estándar fuera del subconjunto que alteren la semántica necesaria
  para compilar el formulario.
- Vocabularios personalizados, resolución de referencias o subschemas ocultos
  dentro de extensiones desconocidas.

## 5. Consecuencias y trade-offs

Consecuencias positivas:

- La interpretación es estable y explícita incluso sin `$schema`.
- Los diagnósticos son iguales en desarrollo, producción y cualquier framework.
- Las extensiones desconocidas no bloquean formularios que pueden compilarse de
  forma segura.
- Los errores tipográficos pueden detectarse mediante warnings.
- El compilador permanece limitado al alcance de `SPEC-001`.

Consecuencias negativas:

- Ignorar una keyword desconocida puede omitir una intención que su autor
  esperaba que afectara al formulario.
- Emitir warnings para extensiones intencionadas puede generar ruido.
- Solo se admite una URI exacta de dialecto durante el primer incremento.
- Será necesario mantener un catálogo de keywords conocidas para distinguir
  capacidades no soportadas de extensiones desconocidas.

## 6. Alternativas consideradas

### Exigir siempre `$schema`

Rechazada para el primer incremento porque JSON Schema permite que una
implementación elija un dialecto por defecto y el warning conserva visibilidad
sin impedir esquemas sencillos.

### Omitir el warning en producción

Rechazada porque haría que la compilación dependiera del entorno e introduciría
una política de presentación dentro del core.

### Bloquear todas las keywords desconocidas

Rechazada porque impediría anotaciones y extensiones compatibles con el modelo
abierto de JSON Schema.

### Ignorar keywords desconocidas sin diagnóstico

Rechazada porque dificultaría detectar errores tipográficos y diferencias entre
la intención del autor y el subconjunto realmente compilado.

## 7. Criterios para revisar la decisión

Esta decisión deberá revisarse cuando se promueva alguno de estos trabajos:

- Vocabularios o dialectos personalizados.
- `$ref`, recursos embebidos o resolución remota.
- Objetos anidados, arrays o composición de schemas.
- Un sistema de plugins o extensiones del compilador.
- Soporte de más de un dialecto oficial.
- Evidencia de que los warnings por extensiones desconocidas generan ruido
  significativo en consumidores reales.

## 8. Referencias

- [JSON Schema Core Draft 2020-12](https://json-schema.org/draft/2020-12/json-schema-core)
- [Dialect and vocabulary declaration](https://json-schema.org/understanding-json-schema/reference/schema)
- [RFC 3986: URI Generic Syntax](https://www.rfc-editor.org/rfc/rfc3986)
- [RFC 6901: JSON Pointer](https://www.rfc-editor.org/rfc/rfc6901)

## 9. Enmienda aceptada por ADR-011

El 13 de julio de 2026 se aceptó ADR-011 como ampliación mínima del subconjunto
de keywords. Esta enmienda no sustituye la política de dialecto, keywords
desconocidas, diagnósticos deterministas ni validación externa de esta ADR; solo
retira `enum` de la categoría genérica de keyword conocida no soportada para el
caso string definido por ADR-011.

## 10. Revisión 1 aceptada — objetos inline recursivos

> Esta sección amplía la decisión Accepted de las secciones 1–9 y es
> autoritativa desde su aceptación coordinada con ADR-014. SPEC-002 v0.1.2 fue
> aceptada posteriormente; ni esta revisión ni la SPEC autorizan por sí solas la
> implementación de objetos anidados sin PLAN-009 aprobado.

### 10.1 Motivo y frontera

La promoción aceptada de D-005 activa el criterio de revisión de la sección 7.
La revisión mantiene Draft 2020-12, una única URI canónica, la clasificación de
keywords, los warnings deterministas y la validación externa. Amplía únicamente
los objetos de schema inspeccionados desde raíz + campos directos a una
estructura recursiva de propiedades object inline.

Siguen sin soportarse arrays, `$ref`, `$defs`, recursos, anchors, resolución
remota, composición, condicionales, vocabularios personalizados y dialectos
adicionales.

### 10.2 Ubicaciones de schema soportadas

El compilador inspeccionará:

1. el schema raíz object;
2. cada schema propio contenido directamente en `properties` de un object
   soportado; y
3. recursivamente, los `properties` de un campo con `type: "object"` válido.

La raíz conserva `$schema`, `type`, `properties`, `required`, `title` y
`description`. Un object de campo soporta `type`, `properties`, `required`,
`title`, `description` y `default`. `default` sigue siendo metadata y no se
aplica ni se copia a la definición normalizada.

Cada object, incluida una propiedad object vacía, debe declarar una data
property propia `properties` cuyo valor sea un object ordinario con prototype
`Object.prototype` o null. `required` continúa siendo opcional y solo puede
nombrar propiedades hermanas. Una entrada requerida no gestionada produce
`UNMANAGED_REQUIRED_PROPERTY` en el object que la declara.

El `title` de un object, cuando esté presente, deberá ser una string no blank;
un valor inválido produce `INVALID_SCHEMA_KEYWORD_VALUE` con
`expected: 'non-blank string'`. Si está ausente, el nombre local será el
fallback accesible cuando sea no blank; para un nombre vacío o compuesto solo
por espacios se usará `JSON.stringify(name)`. Esta regla no cambia el
tratamiento Accepted de `title` en hojas primitive.

Los schemas primitive conservan el catálogo de SPEC-001 y la enmienda ADR-011,
con una única ampliación de ubicación: el subconjunto `enum` string aceptado se
soporta en cualquier hoja primitive alcanzada mediante una cadena válida de
`properties` inline, no solo en una propiedad directa de la raíz. `enum` sobre
number, integer, boolean u object de campo continúa siendo
`INCOMPATIBLE_SCHEMA_KEYWORD`; `enum` en la raíz conserva el
`UNSUPPORTED_SCHEMA_KEYWORD` aceptado por ADR-011.

El catálogo cerrado por ubicación es:

| Ubicación           | Soportadas                                                          | Incompatibles en esa ubicación                                                  |
| ------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| object de campo     | `type`, `properties`, `required`, `title`, `description`, `default` | `enum`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, `multipleOf` |
| hoja string         | catálogo string Accepted, incluido `enum` ADR-011                   | `properties`, `required`, constraints numéricas                                 |
| hoja number/integer | catálogo numérico Accepted                                          | `properties`, `required`, `enum`, constraints string                            |
| hoja boolean        | catálogo boolean Accepted                                           | `properties`, `required`, `enum` y constraints string/numéricas                 |

`$comment`, `deprecated`, `readOnly`, `writeOnly`, `examples`, `format`,
`contentEncoding`, `contentMediaType` y `contentSchema` conservan
`IGNORED_SCHEMA_KEYWORD` tanto en objects de campo como en hojas primitive.
`$ref`, `$dynamicRef`, `$defs`, `$id`, `$anchor`, `$dynamicAnchor`,
`$vocabulary`, applicators, condicionales, keywords de array y keywords de
recursos conocidas permanecen `UNSUPPORTED_SCHEMA_KEYWORD` en cualquier nodo
de campo. También permanecen no soportadas `const`, `additionalProperties`,
`patternProperties`, `propertyNames`, `minProperties`, `maxProperties`,
`dependentRequired`, `dependentSchemas` y `unevaluatedProperties`; ninguna de
estas keywords se interpreta como editor de claves y su contenido no se
recorre.

`$schema` solo se interpreta en la raíz del documento. Una declaración nested
no crea un recurso ni cambia dialecto y se diagnostica como keyword no
soportada. El contenido de una keyword desconocida continúa siendo opaco y no
se recorre buscando subschemas.

### 10.3 Traversal descriptor-safe y ciclos

- Toda propiedad estructural se obtiene mediante su descriptor propio; ningún
  accessor se ejecuta.
- Los nombres de propiedades se recorren mediante `Object.keys(properties)`.
- Cada schema hijo debe ser un object ordinario no array con data properties
  propias para los miembros inspeccionados.
- La identidad de cada object de schema se registra solo en la cadena activa de
  ancestros. Reutilizar el mismo object en ramas hermanas se compila por cada
  ruta; reencontrarlo en su propia cadena produce `CYCLIC_SCHEMA_OBJECT`.
- Una rama cíclica o estructuralmente inválida se detiene sin impedir recopilar
  diagnósticos independientes de ramas hermanas.
- La implementación deberá soportar profundidad finita sin depender de una
  recursión JS no acotada; M9 no introduce un límite público arbitrario.

### 10.4 Orden de diagnósticos

El orden global será:

1. entrada y dialecto raíz;
2. schema en depth-first pre-order siguiendo el orden de propiedades;
3. para cada object, forma exterior y keywords del propio nodo antes de sus
   hijos;
4. para cada primitive, diagnósticos de tipo/keywords antes de UI Schema; y
5. UI Schema en el mismo recorrido estructural después de terminar los
   diagnósticos de schema independientemente recopilables.

Un error que impide conocer la clase de un nodo suprime solo diagnósticos
derivados de esa rama. Un error de forma exterior independiente del UI node
correspondiente puede seguir emitiéndose según SPEC-002.

`documentPath` reproduce la ruta exacta del documento, por ejemplo
`['properties', 'address', 'properties', 'street', 'minLength']`.
`dataPath` reproduce la ruta de datos, por ejemplo `['address', 'street']`.
Los diagnósticos de un object usan su propia ruta; los de raíz no incluyen
`dataPath`.

### 10.5 Diagnóstico de ciclo

Se añade a la propuesta:

| Código                 | Severidad | Fuente   | Comportamiento         |
| ---------------------- | --------- | -------- | ---------------------- |
| `CYCLIC_SCHEMA_OBJECT` | `error`   | `schema` | Bloquea la compilación |

Sus parámetros serán `{ firstDocumentPath }`, con copia inmutable de la primera
ubicación activa del mismo object. `documentPath` y `dataPath` señalarán la
ubicación que cierra el ciclo. No se inspeccionará el contenido de la rama
cíclica.

### 10.6 Compatibilidad y validación externa

Aceptar un object inline no implica validar por completo Draft 2020-12. El
compilador sigue determinando si puede crear la definición neutral; el puerto
`SchemaValidator` conserva autoridad sobre la validez del dato, incluida la
obligatoriedad y los tipos object en el valor externo.

La revisión no convierte unknown keywords en errores, no recorre extensiones
opacas y no permite `additionalProperties` como editor de claves arbitrarias.

### 10.7 Criterios de aceptación satisfechos

La revisión deberá comprobar:

1. conservación exacta de la política Accepted para dialecto y unknowns;
2. catálogo object/primitive cerrado en cada ubicación;
3. traversal descriptor-safe, ciclos y profundidad finita;
4. `documentPath`, `dataPath`, orden y branch stopping deterministas;
5. consistencia con el árbol normalizado y UI estructural de ADR-014;
6. exclusión de arrays, refs, recursos, composición y dialectos adicionales;
7. fixtures válidos y malformed a múltiples profundidades; y
8. ausencia de autorización de implementación o publicación.

Tras cada corrección se repitió la revisión completa. La revisión conjunta 3
superó las ocho áreas sin hallazgos ni conflictos documentales y Ricard aceptó
coordinadamente esta revisión y ADR-014 revisión 1 el 14 de julio de 2026.
SPEC-002 v0.1.2 superó después su gate separado y extiende la conducta de
SPEC-001 solo para M9. PLAN-009 revisión 1 superó posteriormente su revisión
repetida y fue aprobado explícitamente; la aprobación no inició implementación
ni autorizó publicación. Los checkpoints 1–6 posteriores implementaron los
contratos/helpers neutrales, compiler recursivo descriptor-safe, operaciones y
runtime profundos, proyección Angular y migración de paquetes/consumidores. El
checkpoint 7 completó después la revisión y verificación final sin hallazgos.

## 11. Revisión 2 aceptada — arrays homogéneos de objetos inline

> Esta sección es Accepted para diseño normativo M10. No modifica la autoridad
> de revision 1 sobre el comportamiento M9 implementado y no activa arrays en
> SPEC-001/SPEC-002, PLAN-010 ni implementación.

### 11.1 Motivo, autoridad y frontera

La aceptación de ADR-015 activa el criterio de revisión de la sección 7 para el
subconjunto M10 promovido. Revision 2 conserva Draft 2020-12, su URI canónica
única, la política de dialecto ausente, la clasificación de keywords
conocidas/desconocidas, la validación externa y todas las reglas M9 que no se
sustituyen expresamente aquí.

La única ampliación propuesta es una propiedad `type: "array"` en cualquier
objeto soportado fuera de otro item template, con un único `items` object inline
homogéneo. Ese item puede contener los objetos inline y hojas primitive
actuales, pero ninguna propiedad array. La identidad se declara exclusivamente
mediante `CollectionPolicy` conforme a ADR-015; no se introduce una keyword JSON
Schema ni una opción UI para identidad.

Siguen fuera arrays primitive, nested arrays, tuples, `prefixItems`, refs,
recursos, composición, condicionales, dialectos adicionales, defaults
aplicados, factories y cualquier keyword de colección no listada como
soportada.

### 11.2 Ubicaciones y catálogo cerrado

La raíz continúa siendo el object de SPEC-001/SPEC-002; `type: "array"` en raíz
permanece bloqueante. Un array es válido solo como propiedad directa de un
object raíz/nested soportado que no forme parte de un item template.

Un nodo array soporta exactamente:

- `type`, con valor exacto `"array"`;
- `items`, obligatorio y con la forma cerrada de la sección 11.3;
- `title` y `description`, con las reglas de texto actuales para nodos; y
- `default` como metadata reconocida que no se aplica ni se copia.

El object raíz de `items` soporta exactamente `type`, `properties` y `required`.
No representa un nodo de datos con texto propio: `title`, `description`,
`default` y metadatos de presentación son incompatibles allí. Sus propiedades,
salvo la identidad, vuelven a usar el catálogo object/primitive de revision 1.
Objetos nested dentro del item conservan `title`, `description` y `default`
porque sí son nodos normalizados ordinarios.

La propiedad de identidad declarada por `CollectionPolicy` debe resolver una
propiedad directa propia de `items.properties`, aparecer exactamente una vez en
el `items.required` propio y declarar exclusivamente `type: "string"`, salvo las
anotaciones conocidas ignorables que conservan su warning. No admite `title`,
`description`, `default`, constraints, `enum` ni metadata UI porque ADR-015 la
normaliza como metadata de instancia no editable.

| Ubicación                           | Soportadas                                         | Incompatibles/no soportadas                                            |
| ----------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------------- |
| array property fuera de item        | `type`, `items`, `title`, `description`, `default` | `properties`, `required`, constraints primitive y demás keywords array |
| raíz object de `items`              | `type`, `properties`, `required`                   | textos/default, constraints, `items` y keywords de array               |
| identidad directa                   | `type: "string"`                                   | textos/default, constraints, `enum`, `properties`, `required`, `items` |
| descendant object/primitive de item | catálogo Accepted M9, salvo arrays                 | cualquier `type: "array"` y exclusiones existentes                     |

`minItems`, `maxItems`, `uniqueItems`, `contains`, `minContains`, `maxContains`,
`prefixItems` y `unevaluatedItems` son keywords Draft 2020-12 conocidas pero no
soportadas y producen `UNSUPPORTED_SCHEMA_KEYWORD`. `items` en raíz, object o
hoja no array es `INCOMPATIBLE_SCHEMA_KEYWORD`; una keyword de object/primitive
en un array también es incompatible. Ninguna rama incompatible se recorre como
subschema.

Cada keyword listada como incompatible en la tabla produce exactamente
`INCOMPATIBLE_SCHEMA_KEYWORD` en su ubicación, con los parámetros Accepted
`{ keyword, fieldType }`. `fieldType` es exactamente `'array'` en el nodo
collection, `'object'` en item root y `'string'` en identity. `dataPath`,
`documentPath` y `templatePath` aportan la ubicación sin ampliar los parámetros.
Una forma propia malformed conserva el diagnóstico de valor/shape
correspondiente y no añade además incompatibilidad.

Las anotaciones ignorables de revision 1 conservan
`IGNORED_SCHEMA_KEYWORD` en arrays, item root y descendientes. Una keyword
desconocida continúa siendo opaca, genera `UNKNOWN_SCHEMA_KEYWORD` y nunca se
recorre buscando items o subschemas. `$schema` continúa interpretándose solo en
la raíz del documento.

### 11.3 Forma exacta de `items`

`items` debe ser una data property propia. Su ausencia, herencia o descriptor
accessor produce `INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de `items` con
`expected: 'inline object item schema'` y `actualType: 'missing'` o
`'accessor'`. Un boolean, array, null, primitive, class instance u object con
prototype distinto de `Object.prototype`/null produce el mismo código y
`expected` con su descripción segura.

El object `items` debe declarar data properties propias `type`, con valor exacto
`"object"`, y `properties`, como object ordinario no array con prototype
`Object.prototype` o null. `required` es opcional y usa la forma Accepted. La
policy de identidad añade el requisito de que su nombre aparezca exactamente
una vez.

Un `items.type` ausente/no string/otro tipo usa los diagnósticos de tipo
existentes en la ruta exacta; un tipo primitive no activa arrays primitive.
`properties` puede estar vacío estructuralmente, pero entonces no satisface la
identidad obligatoria y la compilación falla por policy.

Un array schema descubierto dentro de cualquier descendant del item template
produce `UNSUPPORTED_FIELD_TYPE` en su keyword `type`, con reason cerrado
`nested-array-not-supported`; no se inspecciona su `items`. Fuera de un item
template, varias propiedades array hermanas o en ramas object independientes son
válidas y cada una exige su propia policy.

### 11.4 Integración de `CollectionPolicy`

Revision 2 no convierte la policy en JSON Schema. La inspección de
`collectionPolicies` ocurre después de conocer de forma segura los array paths
candidatos y antes de normalizar templates.

Para cada array candidato debe existir exactamente una policy own válida con
path absoluto string-only igual al path del array y
`itemIdentityProperty` string exacta. Policies duplicadas, accessors, paths
malformed/numeric, una policy sin array correspondiente y un array sin policy
son errores de configuración bloqueantes. La inspección no ejecuta accessors ni
retiene objetos caller en diagnósticos.

SPEC-003 cerrará los códigos y parámetros de configuración de policy. Esta ADR
fija que los errores de forma exterior de `collectionPolicies` preceden al
schema traversal, mientras los errores semánticos path/identity se ordenan tras
los diagnósticos schema independientes del primer array dependiente. No se
confunden con validator issues y cualquier error impide devolver una definición
parcial.

Una policy exterior estructuralmente inválida bloquea la normalización y toda
clasificación dependiente de identity, pero no suprime el traversal schema/UI
independiente de `items`. Una policy exterior válida pero semánticamente no
resoluble tiene el mismo branch stopping: permite recopilar los diagnósticos
independientes del array/item y bloquea solo la normalización final del
template. Diagnósticos que requieran saber cuál propiedad es identity se
suprimen cuando esa relación no puede resolverse de forma única.

### 11.5 Traversal descriptor-safe, sharing y ciclos

El recorrido sigue siendo iterativo y descriptor-safe:

1. inspecciona el nodo array y sus keywords propias;
2. inspecciona la forma exterior de `items`;
3. incorpora el object `items` a la cadena activa de identidades de schema;
4. inspecciona forma/keywords propias del item root; y
5. recorre `items.properties` en `Object.keys()` order, depth-first pre-order.

El mismo object de schema puede reutilizarse en arrays/ramas hermanas y se
compila por cada ubicación. Reencontrarlo en su cadena activa, incluido a través
de `items` y después `properties`, produce el `CYCLIC_SCHEMA_OBJECT` Accepted
con `firstDocumentPath`; no se añade un diagnóstico competidor. El array node y
el `items` object permanecen activos hasta terminar el template.

Una rama `type: "array"` prohibida dentro de un item se detiene antes de leer
`items`, incluso si ese miembro cerraría un ciclo. Un error exterior de `items`
detiene solo ese template; arrays y ramas object independientes continúan. No se
establece límite público de profundidad y la implementación no puede depender
de recursión JS no acotada.

### 11.6 Paths y orden de diagnósticos schema

`documentPath` conserva la ubicación exacta, por ejemplo:

```text
['properties', 'orders', 'items']
['properties', 'orders', 'items', 'properties', 'sku', 'minLength']
```

Un diagnóstico del nodo array usa su `dataPath` absoluto string-only. Un
diagnóstico dentro del item template no inventa un índice runtime: usa el
`dataPath` del array y añade `parameters.templatePath` como copia inmutable de
la ruta relativa string-only; para item root es `[]`. Los parámetros existentes
permanecen y `templatePath` aparece solo en contexto template.

El orden global propuesto es:

1. input, dialecto y policies exteriores estructuralmente inválidas;
2. schema depth-first pre-order según properties;
3. en un array: forma/keywords propias, `items` exterior, item root y después
   descendants en properties order;
4. en cada nodo: shape/type antes de compatibilidad y annotations;
5. errores de policy semántica en el primer array dependiente, después de sus
   diagnósticos schema independientes; y
6. UI Schema completo después de terminar los diagnósticos schema
   independientemente recopilables.

Dentro del template, identity property se inspecciona en su posición de schema
properties y no se adelanta. Un error que impide conocer la clase de una rama
suprime solo diagnósticos derivados; no suprime siblings inspeccionables ni una
forma exterior UI independiente.

### 11.7 UI Schema estructural mínimo

UI Schema añade únicamente una forma estructural de array:

```ts
export interface ArrayUiSchema {
  readonly label?: string;
  readonly description?: string;
  readonly hint?: string;
  readonly tooltip?: string;
  readonly item?: ItemUiSchema;
}

export interface ItemUiSchema {
  readonly order?: readonly string[];
  readonly fields?: Readonly<Record<string, UiNodeSchema>>;
}
```

`UiNodeSchema` añade `ArrayUiSchema`. `item` refleja el único object template;
no declara layout ni cardinalidad. Su `order`/`fields` aplican solo a children
editables directos y reutilizan las reglas descriptor-safe, paths, warnings y
precedencia M9. Omitir `item` equivale a metadata item vacía.

`item`, cuando está presente, debe ser una data property propia con object
ordinario no array; ausencia equivale a vacío, mientras accessor o valor
malformed produce `INVALID_UI_SCHEMA_VALUE` con
`expected: 'item UI object'`. Su identidad se incorpora a la cadena UI activa:
sharing en ramas independientes se inspecciona por path y un reencuentro activo
produce el `CYCLIC_UI_SCHEMA_OBJECT` Accepted, deteniendo solo ese item UI.

Un array UI node no admite `placeholder`, `enumLabels`, numeric options,
`order`, `fields`, actions ni textos de item. `item` en object/primitive nodes
es incompatible. Una entrada `item.fields` para la identity property emite
`INCOMPATIBLE_UI_OPTION` con
`{ field, fieldType: 'string', option: 'identity', reason: 'identity-property' }`
y no se recorre como `FieldUiSchema`.

Las fuentes `identity-error`, item label y acciones pertenecen al
`TextResolver` de ADR-015. UI Schema no puede redefinirlas. Valores/accessors
malformed producen `INVALID_UI_SCHEMA_VALUE` en el miembro exacto y no además
su warning de incompatibilidad. El UI traversal sigue al schema traversal y
recorre arrays/items en el mismo orden estructural.

Los paths UI son exactos. Por ejemplo, un error de `sku` usa
`documentPath: ['fields', 'orders', 'item', 'fields', 'sku', ...]`,
`dataPath: ['orders']` y `parameters.templatePath: ['sku']`; item root usa
`templatePath: []`. En un array UI node, el orden es shape/textos propios,
miembros incompatibles, `item` exterior, `item.order`, entries de
`item.fields` en orden de children normalizado y después descendants. Si
identity no puede resolverse por policy, solo se suprime su diagnóstico UI
derivado; shape/cycle/unknown/order independientes continúan.

### 11.8 Compatibilidad y validación externa

Aceptar `items` inline no significa implementar el vocabulario completo de
arrays Draft 2020-12. El compilador decide si puede crear el template neutral;
el `SchemaValidator` conserva autoridad sobre `type: array`, required, tipos de
items, constraints de descendientes y validez del dato externo.

El schema fuente se entrega sin modificación. Core no añade `minItems`,
unicidad JSON Schema, defaults, factories ni identidad como assertion. La
unicidad/no-blank identity pertenece al runtime de ADR-015 y no se presenta como
resultado del validator.

### 11.9 Criterios de aceptación de revision 2

Revision 2 podrá aceptarse solo cuando una revisión completa repetida confirme:

1. conservación exacta de dialecto, unknowns, annotations y M9 revision 1;
2. catálogo cerrado para array, item root, identity y descendants;
3. `items` homogéneo object obligatorio y exclusión de primitive/nested arrays,
   tuples y otras keywords array;
4. integración determinista y descriptor-safe de `CollectionPolicy`;
5. traversal iterativo, sharing, ciclos y branch stopping;
6. `documentPath`, template-relative parameters y orden deterministas;
7. UI Schema estructural mínimo sin identidad editable ni layout;
8. coherencia completa con ADR-015 y la futura SPEC-003; y
9. ausencia de autorización de implementación, publicación o Stable API.

Tras cada corrección deberá repetirse la revisión completa hasta obtener cero
hallazgos. La aceptación de revision 2 autorizará preparar SPEC-003 como tarea
separada; no autorizará PLAN-010, implementación ni publicación.

La revisión completa se repitió tras cada corrección. El ciclo 3 pasó las nueve
áreas sin hallazgos ni conflictos documentales y Ricard aceptó formalmente
revision 2 el 14 de julio de 2026. La aceptación autoriza preparar SPEC-003 como
tarea separada, no PLAN-010, implementación ni publicación.

## 12. Revisión 3 aceptada — referencias estáticas locales

> Esta sección es la ampliación normativa M11 autorizada por ADR-016 Accepted.
> No modifica la autoridad Accepted de las secciones 1–11 y no activa
> `$defs`/`$ref` en ninguna SPEC, plan o implementación. Su aceptación autoriza
> únicamente la redacción y revisión de SPEC-004.

### 12.1 Motivo, autoridad y frontera

La aceptación de ADR-016 activa el criterio de revisión de la sección 7 solo
para D-041. Revision 3 conserva Draft 2020-12, su URI canónica única, la
política de dialecto ausente, unknown keywords, anotaciones ignorables,
validación externa y todo el subconjunto M1–M10 que no se sustituye
expresamente aquí.

La única ampliación aceptada es un registry raíz `$defs` y objetos `$ref`
fragment-only que resuelven por JSON Pointer dentro del mismo documento. La
representación resuelta sigue siendo Internal; `compileFormDefinition()`,
`FormDefinition`, runtime, operaciones, Angular y `SchemaValidator` no cambian
de firma.

Siguen fuera `$id`, `$anchor`, `$dynamicAnchor`, `$dynamicRef`, plain-name
fragments, otros documentos/recursos, red, callbacks/registries públicos,
applicators, condicionales, unevaluated semantics, vocabularios, dialectos
adicionales y root `$ref`.

### 12.2 `$defs` raíz e indexación

La raíz object añade `$defs` a su catálogo soportado. Es opcional; cuando está
presente debe ser una data property propia enumerable cuyo valor sea un object
ordinario no array con prototype `Object.prototype` o null.

Un descriptor accessor, una data property no enumerable o un valor exterior
malformed produce `INVALID_SCHEMA_KEYWORD_VALUE` en `['$defs']` con
`{ keyword: '$defs', expected: 'own enumerable ordinary definition object',
actualType }`. `actualType` usa el vocabulario seguro existente; para una data
property no enumerable describe su valor sin ejecutarlo y `expected` conserva
la causa normativa. El error bloquea la compilación, pero no impide recopilar
diagnósticos independientes de la raíz. Produce exactamente ese diagnóstico
exterior: no inspecciona entries, el traversal raíz no vuelve a clasificar
`$defs` y los reference objects solo conservan sus diagnósticos independientes
de shape/siblings, sin intentar target resolution ni añadir unresolved
diagnostics derivados.

Después se recorren `Object.keys($defs)` en orden. Cada descriptor debe seguir
existiendo, ser data property y contener un schema object ordinario no array.
Un miembro ausente o accessor usa `INVALID_SCHEMA_KEYWORD_VALUE` en
`['$defs', definitionName]` con
`{ keyword: '$defs', definition: definitionName, expected: 'ordinary schema
object', actualType: 'missing' | 'accessor' }`; un valor incompatible usa el
mismo código/expected con su tipo seguro. Los miembros heredados y no
enumerables no forman parte del registry indexado.

La forma exterior completa de `$defs` se valida antes del schema raíz. El
contenido de cada schema definition permanece lazy: no se clasifican sus
keywords ni se recorren sus subschemas hasta que un `$ref` válido lo alcanza.
Una definition no referenciada nunca crea `FormNodeDefinition`, `DataPath`, UI
ni diagnósticos de contenido. Los diagnósticos de exterior/index `$defs` no
tienen `dataPath` ni `referenceChain` porque todavía no existe un use site.

### 12.3 Objetos de referencia y siblings

En cualquier posición no raíz donde el subconjunto M10 espere un schema de
campo, object, array o item, la presencia de un descriptor propio `$ref`
clasifica el schema object como reference object. El descriptor `$ref` se
inspecciona antes de cualquier sibling y debe ser data property con string.

El catálogo del reference object queda cerrado:

- `$ref` es la única keyword semántica soportada;
- las anotaciones ignorables Accepted conservan `IGNORED_SCHEMA_KEYWORD`;
- las keywords desconocidas conservan `UNKNOWN_SCHEMA_KEYWORD` y su valor
  opaco no se recorre; y
- cualquier otra keyword Draft 2020-12 conocida, incluidos `type`, textos,
  constraints, `properties`, `items` o `$defs`, produce
  `INCOMPATIBLE_SCHEMA_KEYWORD` con `{ keyword, fieldType: 'reference' }` y
  bloquea la rama.

Tras `$ref`, los siblings propios enumerables se clasifican en `Object.keys()`
order, omitiendo la propia key `$ref`. Un `$ref` malformed suprime solo
resolución/normalización dependiente; los diagnósticos independientes de
siblings continúan. Un sibling semántico incompatible impide resolver el
target, aunque la sintaxis `$ref` sea válida, para no implementar conjunción o
annotation merging implícitos.

### 12.4 Sintaxis fragment-only y JSON Pointer

Una referencia soportada es una URI-reference formada solo por `#` y su
fragment. Tras percent-decoding una sola vez, ese fragment debe tener la forma
`/<pointer tokens>` y producir un JSON Pointer cuyos tokens iniciales sean
`$defs` más al menos un nombre de definition. Por tanto, los separators pueden
aparecer raw o percent-encoded antes del único decoding. No se admite fragment
vacío, plain-name fragment, URI no local ni root `$ref`.

Antes de decodificar, la string completa debe cumplir RFC 3986. Tras el único
`#`, el fragment admite exactamente `pchar / "/" / "?"`; `pchar` admite
unreserved, pct-encoded, sub-delims, `:` y `@`. Un raw character fuera de esa
gramática produce `invalid-uri-reference`. Cada `%` debe tener dos hex digits y
la secuencia completa debe decodificar bytes UTF-8 válidos; cualquier fallo usa
`invalid-percent-encoding`. No se acepta un segundo raw `#`.

Después del percent-decoding, cada token aplica RFC 6901: `~1` se convierte en
`/`, `~0` en `~` y cualquier otro escape `~` es inválido. Si el recorrido cruza
un array, su token debe coincidir exactamente con `0|[1-9][0-9]*`; `-`, signo,
leading zero, whitespace y cualquier otra forma son inválidos. La comparación
del índice es textual y no exige convertir un entero arbitrariamente grande a
`number` antes de comprobar el descriptor propio.

`INVALID_SCHEMA_REFERENCE` tiene `severity: 'error'`, `source: 'schema'`,
fallback `Schema reference is invalid.` y reason cerrado:

- `accessor-reference`;
- `non-string-reference`;
- `root-reference-not-supported`;
- `non-fragment-reference`;
- `invalid-uri-reference`;
- `plain-name-fragment-not-supported`;
- `invalid-percent-encoding`;
- `invalid-pointer-escape`;
- `outside-definitions`; o
- `non-canonical-array-index`.

Sus parámetros son `{ reason, reference?, referenceChain }`. `reference`
aparece solo cuando se leyó una string segura; nunca se conserva un valor
accessor. `documentPath` apunta al `$ref` actual y `dataPath` al use site
gestionado; root `$ref` no tiene `dataPath`.

La precedencia cerrada es: ubicación root; descriptor accessor; tipo no string;
gramática URI/percent encoding; presencia de `#`; percent-decoding; fragment
plain-name; pointer escapes; scope `$defs`; y, durante traversal, índice array
canónico. Un fragment decoded vacío, un primer token distinto de `$defs` o
`$defs` sin definition-name token usa `outside-definitions`; un fragment
decoded no vacío que no empieza por `/` usa
`plain-name-fragment-not-supported`. Se emite un solo
`INVALID_SCHEMA_REFERENCE` por `$ref`; el primer reason aplicable detiene
únicamente su resolución dependiente.

### 12.5 Resolución descriptor-safe y target failures

El puntero se recorre mecánicamente desde la raíz mediante descriptors propios
enumerables de objects ordinarios y arrays. Miembros heredados, no enumerables,
ausentes, sparse o accessor no se evalúan. `__proto__` se trata como key
ordinaria solo cuando existe como data property propia enumerable. El target
final debe ser un schema object ordinario no array.

`UNRESOLVED_SCHEMA_REFERENCE` tiene `severity: 'error'`, `source: 'schema'`,
fallback `Schema reference target could not be resolved.` y reason cerrado:

- `missing-target` para miembro ausente, heredado o sparse;
- `non-enumerable-target`;
- `accessor-target`; o
- `non-schema-target` para un intermediate container/final target que no
  permite continuar como object/array o no termina en schema object ordinario.

Sus parámetros son
`{ reason, reference, targetDocumentPath, referenceChain }`; paths y chain son
copias profundamente inmutables. `targetDocumentPath` es exactamente el prefijo
decodificado que termina en el primer token cuyo descriptor/valor falla, no el
target completo no recorrido. Los tokens de object permanecen string; un token
de array pasa a number solo después de resolver un índice existente, mientras
el token array que falla conserva su string exacta. Si una entry `$defs`
malformed ya produjo su diagnóstico exterior, cada `$ref` que la use emite
además su propio unresolved diagnostic en el use site: ambos identifican
defectos independientes de declaración y uso.

La resolución y normalización son iterativas, no ejecutan accessors, no llaman
consumer code, no leen globals de browser/Node, no imponen un límite público de
profundidad y no retienen schema objects, containers, valores hostiles ni
thrown values en diagnósticos.

### 12.6 Sharing y dos dominios de ciclo

La identidad de target de referencia es su `documentPath` canónico. Reentrar el
mismo target path en la cadena activa produce `CYCLIC_SCHEMA_REFERENCE`; el
mismo object JavaScript bajo document paths distintos sigue siendo sharing
legal de documento. Un reference edge no convierte por sí solo esa identidad
compartida en `CYCLIC_SCHEMA_OBJECT`.

`CYCLIC_SCHEMA_REFERENCE` tiene `severity: 'error'`, `source: 'schema'`,
fallback `Schema reference cycle detected.`, parámetros
`{ firstDocumentPath, referenceChain }`, `documentPath` en el `$ref` que cierra
el ciclo y el `dataPath` del use site. Detiene solo su rama dependiente.

`CYCLIC_SCHEMA_OBJECT` conserva su identidad Accepted para reentrada del mismo
object mediante containment estructural `properties`/`items` durante la
normalización ordinaria. Referencias acíclicas repetidas al mismo target son
válidas; pueden compartir metadata Internal resuelta, pero se normalizan por
separado en cada use site.

### 12.7 Provenance, parámetros y ownership

`referenceChain` es un array outermost-to-innermost de `DocumentPath` copiados
y frozen. En un diagnóstico de resolución incluye el `$ref` actual como último
miembro. Un diagnóstico schema producido dentro de un target conserva el
`documentPath` exacto de su keyword fuente, recibe la chain que alcanzó ese
target y usa siempre el `dataPath` gestionado del use site.

Los diagnósticos de siblings del reference object reciben la chain que incluye
su `$ref` actual. Los diagnósticos semánticos
`MISSING_COLLECTION_POLICY`/`INVALID_COLLECTION_POLICY` que dependen de un
array alcanzado por referencia reciben su chain; los errores exteriores de
policy y `UNUSED_COLLECTION_POLICY`, que no pertenecen a un use site schema
único, no la reciben. Los diagnósticos UI conservan su `documentPath` de UI y
nunca reciben schema `referenceChain`.

Para un schema que no declara `$defs` ni `$ref`, todos los envelopes Accepted
permanecen exactos. `Diagnostic` no cambia de firma: el nuevo miembro vive solo
dentro del `Readonly<Record<string, unknown>>` existente. Todo path, chain,
parameters, diagnostic, result wrapper y array emitido se copia y congela según
la política Accepted.

El `SchemaValidator` recibe siempre el schema original exacto y el valor
controlado completo. Core no le entrega un bundle/dereference, no valida datos
en el resolver y no expone el resolved graph a Angular ni a otro adapter.

### 12.8 Orden global y branch stopping

El orden normativo aceptado es:

1. input y dialecto raíz;
2. forma exterior de `collectionPolicies`;
3. exterior/index de `$defs` en `Object.keys()` order;
4. schema raíz depth-first pre-order según las reglas Accepted;
5. en cada reference object: `$ref` shape/syntax, siblings en source order,
   pointer traversal, cycle check y target normalization;
6. policy semántica en su primer array dependiente y unused policies al final
   del schema traversal; y
7. UI Schema completo tras los diagnósticos schema independientemente
   recopilables.

Un fallo anterior detiene únicamente trabajo dependiente: dialecto incompatible
bloquea schema; `$defs` exterior malformed impide resolución pero no los
diagnósticos raíz independientes; `$ref` malformed/sibling incompatible impide
su target; target/ciclo inválido detiene esa rama. Ramas hermanas, definitions
alcanzadas independientemente y forma UI exterior independiente continúan en
su orden aceptado. Cualquier error mantiene `success: false` sin definición
parcial.

### 12.9 Public/Internal y fronteras inalteradas

La migración ADR-009 exacta es:

| Clasificación                       | Efecto                                                                                                                                                                 |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` acepta el slice D-041 y puede emitir los tres nuevos códigos/provenance.                                                                     |
| Changed Public diagnostic semantics | Se añaden los tres envelopes de referencia; un `$defs` entry inválido añade `definition` y diagnósticos schema mediados por referencia pueden añadir `referenceChain`. |
| New/changed Public signatures       | Ninguna.                                                                                                                                                               |
| Internal                            | Index de definitions, pointer decoder, resolved cursors, cache, cycle/provenance helpers.                                                                              |
| Unchanged                           | `FormDefinition`, runtime, operaciones, Angular, validator port, packages, exports, dependencies, versions, publication y Public + Experimental + Active.              |

D-007 conserva Deferred todo el resto de refs/recursos/composición/condicionales
y vocabularios. D-014 conserva Research el AST público/versionado, render plan
y pipeline multi-formato. D-013, D-040 y cada frontera no promovida mantienen su
estado.

### 12.10 Criterios de aceptación de revision 3

Revision 3 se aceptó solo después de que una revisión completa repetida
confirmara:

1. conservación exacta de dialecto, unknowns, annotations y M1–M10;
2. catálogo/shape/order cerrado de `$defs` y reference objects;
3. sintaxis fragment-only, percent-decoding y JSON Pointer exactos;
4. traversal descriptor-safe, sharing y ambos dominios de ciclo;
5. códigos, reasons, parámetros, paths, fallbacks y branch stopping cerrados;
6. provenance exacta para schema, UI y collection policy;
7. Public/Internal inventory y schema original para `SchemaValidator`;
8. coherencia con ADR-016 y todas las SPEC/ADR Accepted;
9. preservación de D-007/D-014, packages, publicación y estabilidad; y
10. gate objetivo: solo una revisión 3 aceptada autoriza redactar SPEC-004.

Tras cada corrección se repitió la revisión completa. El ciclo 2 pasó las diez
áreas con cero hallazgos y Ricard aceptó formalmente revision 3 el 14 de julio
de 2026. La aceptación autoriza preparar SPEC-004 como tarea separada; no
autoriza un plan, implementación, publicación ni Stable API.

## 13. Revisión 4 aceptada — type array nullable cerrado

> Esta sección amplía solo el diseño normativo M14 promovido por review 031 y
> coordinado con ADR-019. Las revisiones 0–3 conservan su autoridad Accepted.
> La aceptación no modifica ninguna SPEC ni autoriza plan, implementación,
> versión, publicación o promoción Stable.

### 13.1 Motivo, autoridad y frontera

D-009 activa el criterio de revisión de la sección 7 para un único subconjunto
Draft 2020-12: hojas primitive cuyo `type` contiene exactamente su tipo actual
y `null`. Se conservan dialecto/URI, warnings, catálogo de keywords,
descriptor-safety, recorrido iterativo, referencias, policies, orden global,
validación externa y todas las fronteras M1–M13 no sustituidas aquí.

La raíz continúa exigiendo `type: "object"`. Objetos, arrays, item roots e
identity properties continúan usando su declaración string exacta y no pueden
ser nullable. Solo las posiciones donde las revisiones Accepted ya permiten
una hoja `string`, `number`, `integer` o `boolean` admiten la forma array.

### 13.2 Forma exterior descriptor-safe

La data property propia `type` conserva su forma string Accepted. Cuando su
valor seguro es un array, el compilador lo inspecciona sin iteradores ni acceso
indexado ordinario:

1. `Array.isArray(value)` debe ser true y el descriptor propio de `length` debe
   ser una data property con valor exacto 2;
2. los índices `0` y `1` deben existir como data properties propias
   enumerables;
3. cada valor debe ser string y pertenecer a `null`, `string`, `number`,
   `integer` o `boolean`;
4. el array debe contener exactamente un `null` y exactamente un tipo
   primitive no-null; y
5. `Object.keys(value)` no puede contener una key distinta de `0` o `1`.

No se ejecutan accessors, `Symbol.iterator` ni coerciones. Como en el contrato
Accepted, un Proxy puede ejecutar traps por la propia reflexión y no es una
frontera soportada de aislamiento de input; esta revisión no promete inspección
trap-free ni añade una política nueva para excepciones de Proxy.

El compilador no retiene el array. Normaliza el miembro primitive a la clase de
hoja Accepted y fija `nullable: true`; una declaración string fija
`nullable: false`.

### 13.3 Diagnóstico y precedencia

Se reutiliza `UNSUPPORTED_FIELD_TYPE`; no se añade código. El fallback conserva
`Field "<name>" has an unsupported type.` y los parámetros existentes seguros
incluyen `field`.

La precedencia dentro de `type` es:

1. descriptor de `type` accessor o valor exterior no string/no array: ruta
   `[..., 'type']` y `actualType` existente;
2. descriptor `length` ausente/accessor/no numérico o longitud distinta de 2:
   ruta `[..., 'type']`, `expected: 'primitive type plus null'` y
   `actualType: 'missing' | 'accessor' | <tipo seguro>` para forma no numérica,
   o `actualLength` para un número distinto de 2;
3. índice `0` y después `1`: ruta `[..., 'type', index]`, con `actualType` igual
   a `missing`, `non-enumerable`, `accessor` o la descripción segura del valor;
4. primera key enumerable extra en `Object.keys()` order: ruta
   `[..., 'type', key]`, `reason: 'unexpected-type-array-member'`; y
5. combinación de dos miembros segura pero inválida: ruta `[..., 'type']`,
   `expected: 'one primitive type and null'`, `reason` igual a
   `missing-null`, `duplicate-null` o `duplicate-primitive`.

Un miembro string fuera del catálogo usa el paso 3 con
`reason: 'unsupported-type-member'`. Un miembro `object` o `array` no abre un
container nullable. En el paso 5, dos `null` usan `duplicate-null`; dos tipos
primitive iguales usan `duplicate-primitive`; dos tipos primitive distintos
usan `missing-null`. Para cada array se emite solo el primer diagnóstico de
esta precedencia y se detiene su rama antes de constraints/UI dependientes.
Siblings independientes conservan el orden Accepted.

Si el type array es válido, las keywords se clasifican usando el tipo primitive
normalizado. `enum` es una excepción: incluso sobre string produce
`INCOMPATIBLE_SCHEMA_KEYWORD` porque `enum + null` no está promovido. Las
constraints string/numéricas Accepted siguen siendo compatibles con su tipo;
boolean no añade constraints. `default` y anotaciones conservan exactamente su
tratamiento Accepted y no adquieren semántica nullable.

UI Schema usa el tipo primitive normalizado para `placeholder` y opciones
numéricas existentes. Si `enum` bloquea una hoja string nullable, un
`enumLabels` exterior malformed conserva su `INVALID_UI_SCHEMA_VALUE`; un
objeto exterior válido se ignora sin diagnósticos derivados, como cualquier
enum schema-blocked Accepted. La forma/textos UI inspeccionables de manera
independiente conservan su orden. Un type array malformed deja el tipo sin
clasificar y suprime solo compatibilidad/members UI derivados, nunca errores de
forma exterior independientes.

### 13.4 Ubicaciones, referencias y templates

La inspección ocurre en el schema fuente efectivo de cada hoja, incluido un
target alcanzado mediante `$ref`. `documentPath` y `referenceChain` continúan
señalando el target; `dataPath` corresponde al use site. Compartir un target
nullable normaliza una definición independiente por use site sin retener el
array fuente.

Dentro de un collection item template, `documentPath`, `dataPath` y
`parameters.templatePath` conservan las reglas Accepted. La identity directa
requiere todavía `type: "string"`; un type array exteriormente válido allí no
produce `UNSUPPORTED_FIELD_TYPE` ni un campo nullable. La policy emite el
diagnóstico semántico Accepted `INVALID_COLLECTION_POLICY`, sin
`documentPath`, con el `dataPath` del array y parámetros
`{ reason: 'identity-schema-incompatible', policyIndex, member:
'itemIdentityProperty', expected: 'required direct string identity property' }`.
La inspección independiente de annotations/keywords prohibidas de identity
conserva su orden Accepted antes de ese fallo semántico.

La UI Schema no añade ninguna opción. Su inspección ocurre solo si la rama
schema sigue siendo clasificable, en el orden global Accepted.

### 13.5 Validación externa y compatibilidad

Aceptar el type array significa que el compilador puede crear una definición,
no que core valide el valor como JSON Schema completo. `SchemaValidator`
recibe sin cambios el schema original con el array y el valor controlado. Core
no aplica `required`, defaults, coercion ni assertions de negocio.

La compatibilidad estructural de operaciones/runtime usa el boolean normalizado
de ADR-019: null es compatible solo con la hoja nullable; el tipo primitive
conserva sus reglas Accepted. Null externo no nullable se conserva como dato
presente incompatible y nunca se corrige silenciosamente.

### 13.6 Public/Internal y exclusiones

Revision 4 cambia comportamiento Public de `compileFormDefinition()` y sus
diagnósticos, y coordina la nueva firma Public + Experimental
`BaseFieldDefinition.nullable` de ADR-019. El inspector de arrays y su metadata
de traversal son Internal. No cambia exports, entry points, packages, dialecto,
versiones ni clasificación de estabilidad.

Siguen fuera type arrays generales, standalone null, containers/identity
nullable, `enum + null`, applicators, conditionals, defaults aplicados,
coerciones, AST público, recursos externos/dinámicos, UI dinámica, persistencia,
publicación y todas las decisiones no promovidas.

### 13.7 Gate de aceptación

Revision 4 se aceptó coordinadamente con ADR-019 después de que una revisión
completa repetida confirmara:

1. forma type-array cerrada, descriptor-safe y determinista;
2. códigos, parámetros, paths, precedence y branch stopping exactos;
3. catálogo de keywords por tipo y exclusión de `enum + null`;
4. propagación directa/nested/template/reference e identity inalterada;
5. schema original y autoridad intacta del validator externo;
6. inventario Public/Internal y migración Experimental exactos;
7. coherencia con todas las revisiones Accepted de ADR-005 y ADR-019; y
8. ausencia de autorización de SPEC, plan, código, versión o publicación.

Tras cada hallazgo se corrigió y repitió la revisión completa. Review 032 ciclo
2 cerró las diez áreas sin hallazgos y Ricard había aprobado las tres decisiones
antes de la redacción. La aceptación conjunta autoriza únicamente redactar
SPEC-006 como tarea separada.

## 14. Revisión 5 aceptada — formatos semánticos string

ADR-027 revision 0 sustituye únicamente la clasificación genérica de `format`
para hojas string. Los valores exactos `email`, `date` y `date-time` pasan de
anotación ignorada a anotación soportada y normalizada en la definición
neutral, en posiciones directas, nested, item-template y local-reference.

Otro nombre string conserva conducta no bloqueante mediante
`IGNORED_SCHEMA_FORMAT`; un accessor o valor no string es estructuralmente
inválido y produce `INVALID_SCHEMA_KEYWORD_VALUE`. En raíz, objects, arrays,
identidad y hojas no string, `format` conserva
`IGNORED_SCHEMA_KEYWORD`.

Esta revisión no convierte core en validador ni negocia vocabularios. La
assertion seleccionada pertenece exclusivamente al validador oficial
reemplazable bajo ADR-027/ADR-022 revision 2. Todos los demás formatos,
comparadores, vocabularios, dialectos y capacidades D-037 continúan Deferred.

## 15. Revisión 6 aceptada — `const` primitivo y presentación fija

ADR-028 revision 0 sustituye únicamente la clasificación de `const` en hojas
primitivas existentes. Un valor string, number finito, integer finito o boolean
compatible se normaliza como valor fijo; `null` requiere la capacidad nullable
ya aceptada. Accessors, valores incompatibles y containers son bloqueantes.

Root, object, array e identidad conservan `UNSUPPORTED_SCHEMA_KEYWORD` y
`const` nunca infiere tipo. Una `const` string debe pertenecer al `enum` string
soportado cuando ambos coexisten. Esta regla cerrada no autoriza evaluar
pattern, longitudes, restricciones numéricas o formatos en core.

El schema original permanece autoridad del validador reemplazable. Core no
inserta ni corrige el valor y runtime/operaciones no imponen la assertion. Todo
el resto de D-036 y las capacidades no promovidas permanecen Deferred.

## 16. Revisión 7 aceptada — composición estática de objetos con `allOf`

> Esta sección fija únicamente la política normativa M28 autorizada por
> ADR-031 revision 0 Accepted. Las secciones 1–15 conservan su autoridad
> Accepted. `allOf` continúa fuera del comportamiento activo hasta una SPEC
> Accepted y un plan aprobado e implementado.

### 16.1 Motivo, autoridad y frontera

ADR-031 activa el criterio de revisión de la sección 7 para un único slice de
D-007: un wrapper `allOf` del que el compilador puede derivar estáticamente un
object normalizado mediante contribuciones de propiedades disjuntas. Revision
7 conserva Draft 2020-12, la URI canónica, unknowns y annotations, traversal
descriptor-safe, `$defs`/`$ref` locales, collection policies, UI Schema,
validación externa y todas las reglas M1–M27 que no sustituye expresamente.

La aceptación de revision 7 autoriza únicamente preparar y revisar una SPEC de
extensión M28. No activa contrato Accepted, plan, código, dependencia, versión,
release, publicación o acción Git/externa.

### 16.2 Ubicaciones y catálogos cerrados

La presencia de un descriptor propio `allOf` selecciona la clasificación de
composición antes de inspeccionar su valor, pero después de clasificar de forma
segura el `type` propio cuando el use site puede representar distintos tipos.
Solo se admite donde el compilador Accepted espera un object:

1. raíz del documento;
2. propiedad object raíz o nested;
3. raíz object de `items`; y
4. target local alcanzado desde una de esas ubicaciones.

El catálogo exacto del wrapper es:

| Use site          | Miembros soportados propios                                                              |
| ----------------- | ---------------------------------------------------------------------------------------- |
| raíz documento    | `$schema`, `$defs`, `type`, `title`, `description`, `allOf`                              |
| propiedad object  | `type`, `title`, `description`, `default`, `allOf`                                       |
| raíz object items | `type`, `allOf`                                                                          |
| todos             | annotations ignorables Accepted y keywords desconocidas opacas bajo su política Accepted |

`type` es opcional en un wrapper; cuando existe debe ser una data property
propia con valor exacto `"object"`. Un accessor u otro valor produce
`INVALID_SCHEMA_KEYWORD_VALUE` en su ruta exacta con
`{ keyword: 'type', expected: '"object"', actualType }` y fallback
`Schema keyword "type" has an invalid value.`. Una data property inherited no
forma parte del wrapper.

La clasificación como wrapper sustituye los requisitos ordinarios de
`type`/`properties` del root, object field o item root: su ausencia no emite
`ROOT_TYPE_MUST_BE_OBJECT`, `MISSING_FIELD_TYPE` ni
`MISSING_SCHEMA_PROPERTIES`. `properties`/`required` propios se clasifican una
sola vez como siblings incompatibles sin inspeccionar su valor y no producen
además diagnósticos ordinarios de shape/required.

`properties`, `required`, `$ref`, cualquier otro applicator/conditional y toda
keyword semántica soportada pero no incluida en la tabla son siblings
incompatibles. Producen `INCOMPATIBLE_SCHEMA_KEYWORD` con
`{ keyword, fieldType: 'composition' }` y fallback
`Schema keyword "<keyword>" is incompatible with field type "composition".`.
Las keywords Draft 2020-12 conocidas pero no soportadas conservan
`UNSUPPORTED_SCHEMA_KEYWORD`; las annotations ignorables y unknowns conservan
sus warnings Accepted. Un member incompatible bloquea el resultado del wrapper
sin convertirlo en una contribución implícita.

En una propiedad ordinaria, `type` ausente o exacto `"object"` permite
clasificar el wrapper; un tipo primitive/array Accepted hace que `allOf` esté
fuera de ubicación. Un `type` accessor/malformed conserva su diagnóstico de
tipo anterior y no se usa para inferir un wrapper válido. En raíz e item root
el contexto ya exige object y el wrapper puede omitir `type` conforme a la
tabla.

Fuera de las ubicaciones object, un `allOf` propio se diagnostica como
`INCOMPATIBLE_SCHEMA_KEYWORD` con `{ keyword: 'allOf', fieldType }`, donde
`fieldType` es el tipo Accepted de la posición (`'string'`, `'number'`,
`'integer'`, `'boolean'` o `'array'`). Un object con `$ref` y `allOf` propios se
clasifica como wrapper compuesto y `$ref` es su sibling incompatible; no existe
un caso competidor `fieldType: 'reference'`. Un `allOf` fuera de ubicación no
se inspecciona como subschema ni activa primitive/array composition.

### 16.3 Exterior descriptor-safe de `allOf`

`allOf` debe ser una data property propia enumerable cuyo valor satisfaga
`Array.isArray(value) === true`; no se añade una condición de prototype distinta
de la frontera array Accepted. Su descriptor `length` propio debe ser data
property con entero seguro positivo. Cada índice `0..length - 1` debe ser data
property propia enumerable con schema object ordinario no array;
`Object.keys(allOf)` no puede contener ninguna key adicional.

Se emite como máximo un diagnóstico exterior por array, siguiendo esta
precedencia:

1. descriptor `allOf` accessor/no enumerable o valor no array, en la ruta de
   `allOf`;
2. `length` ausente/accessor/no entero seguro positivo, también en la ruta de
   `allOf`;
3. primer índice missing/no enumerable/accessor/no schema object, en la ruta
   `[..., 'allOf', index]`; y
4. primera key enumerable adicional en `Object.keys()` order, en
   `[..., 'allOf', key]`.

Todos usan `INVALID_SCHEMA_KEYWORD_VALUE`, severidad `error`, fuente `schema`
y fallback `Schema keyword "allOf" has an invalid value.`. Los parámetros
exactos son:

- exterior/valor: `{ keyword: 'allOf', expected: 'non-empty dense array of
object schemas', actualType }`, donde `actualType` es `accessor` o
  `non-enumerable` para esos fallos de descriptor y la descripción segura
  Accepted para un valor data incompatible;
- length: `{ keyword: 'allOf', expected: 'positive safe integer length',
reason: 'invalid-allof-length', actualType }` para missing/accessor o un number
  no finito/no entero/no seguro; solo un entero seguro no positivo añade
  `actualLength`, por lo que ningún parámetro retiene `NaN` o infinito;
- índice: `{ keyword: 'allOf', expected: 'ordinary schema object', actualType }`,
  usando `missing`, `non-enumerable` o `accessor` cuando corresponda; y
- key adicional: `{ keyword: 'allOf', expected: 'dense array indices only',
reason: 'unexpected-allof-member' }`.

No se ejecutan accessors, iteradores, coerciones ni callbacks. Las traps de
Proxy que pueda ejecutar la reflexión se contienen como fallo de input según
la frontera Accepted. Un exterior inválido detiene todas sus ramas
dependientes; wrappers y ramas hermanas independientes conservan su recorrido.

### 16.4 Formas de rama y reducción ordenada

Tras validar el exterior, cada branch se selecciona en índice ascendente:

1. un object con `$ref` propio y sin `allOf` es un reference object puro y usa
   toda la política Accepted de revision 3;
2. un object con `allOf` propio es otro wrapper compuesto; `$ref` u otro
   semantic sibling se diagnostica bajo la sección 16.2; y
3. cualquier otro object es candidato a contribución ordinaria y debe declarar
   data properties propias `type: "object"` y `properties` ordinary object.

Una contribución ordinaria usa el catálogo exacto del use site, salvo que
`$schema` y `$defs` nunca se admiten dentro de una branch raíz: permanecen
exclusivos del wrapper raíz del documento. En raíz admite `type`, `properties`,
`required`, `title` y `description`; en propiedad object añade `default`; en
item root admite solo `type`, `properties` y `required`. Solo después de que
`type`/`properties` satisfacen esa forma se aplica dentro de la contribución la
clasificación Accepted de `required`, textos, default, annotations, unknowns y
members incompatibles.

Un `$schema` o `$defs` propio en una contribución raíz produce
`INCOMPATIBLE_SCHEMA_KEYWORD` con `{ keyword, fieldType: 'object' }` y el
fallback Accepted de incompatibilidad object. No abre dialecto/registry local,
no se indexa y bloquea solo el resultado de esa composición. En otros use sites
conserva la clasificación Accepted que ya prohíbe esos members nested.

Un branch que no satisface ninguna de las tres formas emite exactamente:

```ts
{
  code: 'INCOMPATIBLE_SCHEMA_COMPOSITION',
  severity: 'error',
  source: 'schema',
  documentPath: [...branchDocumentPath],
  dataPath: managedUseSitePath,
  parameters: {
    reason: 'unsupported-branch-kind',
    branchIndex,
    expected: 'object contribution, local reference or nested object composition',
  },
  fallbackMessage: 'Schema composition is incompatible.',
}
```

La validación del candidato ordinario comprueba `type` y después `properties`;
missing, accessor o valor incompatible produce este único código/reason en el
path del branch, no un diagnóstico de campo/root competidor. Para una branch
inline, `branchDocumentPath` es su path `allOf` + índice. Si una branch `$ref`
resuelve a un target que no es contribución/wrapper object, el diagnóstico se
ancla al `documentPath` canónico de ese target y conserva `branchIndex` más la
`referenceChain` que lo alcanzó.

En item template añade el `templatePath` Accepted. Se detiene solo esa branch;
las posteriores continúan para diagnósticos independientes.

Las contribuciones válidas se aplanan iterativamente en depth-first `allOf`
order. Dentro de cada una, `Object.keys(properties)` fija el orden. No existe
límite público arbitrario ni se expone AST/cursor de composición.

### 16.5 Propiedades, `required` y conflictos

El primer origen de un nombre de propiedad fija su posición y schema source.
Una aparición posterior del mismo nombre siempre bloquea, aunque ambos schemas
sean el mismo object o parezcan equivalentes. El schema subtree duplicado se
detiene; las demás propiedades y branches independientes continúan.

Cada `required` conserva la forma Accepted. Sus nombres válidos se acumulan y
la requiredness efectiva es la unión de todas las contribuciones. Una branch
puede requerir una propiedad declarada por otra. Solo después de terminar todo
el catálogo efectivo se emite `UNMANAGED_REQUIRED_PROPERTY` por cada entrada
que no corresponde a ninguna propiedad efectiva, conservando el
`documentPath`, use-site `dataPath`, `templatePath` y `referenceChain` de la
entrada que la declaró.

Los `title`/`description` del wrapper y las contribuciones se inspeccionan en
orden wrapper y después contribuciones aplanadas. Ausencia total conserva el
fallback Accepted; una única string válida se selecciona; repeticiones
exactamente iguales se reducen a esa string; valores válidos distintos
bloquean en el origen posterior. UI Schema conserva primera precedencia.
`default` sigue siendo metadata opaca: no se combina, copia ni aplica.

Los tres conflictos usan `INCOMPATIBLE_SCHEMA_COMPOSITION`, `error`/`schema` y
fallback `Schema composition is incompatible.` con reason cerrado:

```ts
type SchemaCompositionConflictReason =
  'unsupported-branch-kind' | 'duplicate-property' | 'conflicting-annotation';
```

Un duplicate usa `{ reason: 'duplicate-property', property,
firstDocumentPath, firstReferenceChain? }`. Un conflicto de texto usa
`{ reason: 'conflicting-annotation', keyword: 'title' | 'description',
firstDocumentPath, firstReferenceChain? }`. `documentPath` siempre ancla el
origen posterior exacto —la key de propiedad o keyword de texto— y los paths
del primer origen se copian/freeze. `firstReferenceChain` aparece únicamente
cuando el primer origen se alcanzó mediante una o más referencias. El
diagnóstico posterior añade además su propio `referenceChain` cuando procede;
ningún parámetro retiene schema objects, cursors o valores de annotations.

Para duplicate, `firstDocumentPath` es exactamente la primera ruta
`[..., 'properties', property]`; para texto es exactamente la primera ruta
`[..., keyword]`. Ambos se expresan en el documento schema fuente, no como
`DataPath` ni como path de UI.

### 16.6 References, ciclos y provenance

Revision 7 añade los índices `allOf` como posiciones no root donde un reference
object puro puede resolverse, incluidas las branches de composición raíz. Una
declaración `$ref` directa en la raíz del documento continúa produciendo
`root-reference-not-supported`. La sintaxis fragment-only, `$defs` registry,
target traversal, sibling rules y `INVALID_SCHEMA_REFERENCE`/
`UNRESOLVED_SCHEMA_REFERENCE` permanecen exactos.

El `documentPath` de todo diagnóstico conserva `allOf` e índices inline. Dentro
de un target referenciado conserva el path fuente del target y usa el
`dataPath` del managed use site más la `referenceChain` outermost-to-innermost.
Un item template añade su `templatePath` relativo. UI Schema conserva paths UI
y nunca recibe provenance de schema/composición.

La reentrada activa del mismo schema object mediante `allOf`, `properties` o
`items` usa `CYCLIC_SCHEMA_OBJECT`, con el branch/object path que cierra el
ciclo y `firstDocumentPath` Accepted. La reentrada de un target canónico por
edges `$ref` usa `CYCLIC_SCHEMA_REFERENCE`. Sharing acíclico se inspecciona por
use site y no crea una tercera identidad de ciclo.

### 16.7 Orden global y branch stopping

Se conserva el orden global Accepted de input, dialecto, exterior de policies,
index `$defs`, schema, policies semánticas/unused y UI. Al alcanzar un wrapper
compuesto, el orden exacto es:

1. `type` propio;
2. members propios distintos de `allOf` en `Object.keys()` order, aplicando
   shape, compatibilidad y annotations; en raíz, `$schema` y `$defs` ya
   procesados por los gates globales se omiten sin emitirlos de nuevo;
3. exterior `allOf` según sección 16.3;
4. branches depth-first en índice ascendente, incluida resolución y nested
   composition;
5. conflictos de propiedad/texto cuando se alcanza su origen posterior;
6. `UNMANAGED_REQUIRED_PROPERTY` tras el catálogo efectivo completo; y
7. UI Schema del único use site después de todos los diagnósticos schema
   independientemente recopilables.

Un `type`/sibling inválido bloquea el resultado del wrapper, pero no suprime un
exterior/branches `allOf` independientemente inspeccionable. Un exterior
`allOf` inválido detiene todas sus branches. Un branch/propiedad conflictiva
detiene solo su resultado dependiente. Ramas, propiedades, policies y UI
exteriores independientes continúan en orden. Cualquier error produce
`success: false` y ninguna `FormDefinition` parcial.

### 16.8 UI Schema, collections y validator

Existe un único UI node en el managed use site. Se aplica al catálogo y orden
efectivos; no existen UI branches, selectors ni provenance de composición. La
policy de una colección aportada por cualquier branch sigue apuntando a su
`DataPath` absoluto. En un item root compuesto, identidad y requiredness se
resuelven sobre el catálogo efectivo antes de aplicar las reglas Accepted.

Si un fallo de composición impide obtener de forma única el array o item
catalog del que depende una policy, se suprimen solo sus diagnósticos semánticos
de path/identity. La forma exterior de `collectionPolicies`, una policy
independiente y `UNUSED_COLLECTION_POLICY` continúan bajo el orden Accepted.

`SchemaValidator` recibe el schema original exacto y el valor completo. Core no
aplana, clona, bundlea ni dereferencia el schema entregado al port. El adapter
Ajv existente evalúa la conjunción, pero no amplía el subset del compiler ni
requiere cambio de opción, cache, dependencia o issue mapping.

Runtime, operaciones, baseline confirmation, async validation, Angular y
Standard consumen la definición normalizada sin branches ni cursors nuevos.

### 16.9 Public/Internal y exclusiones

La migración ADR-009 exacta es:

| Clasificación                       | Efecto                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` podrá aceptar el subset object-`allOf` M28.                                                      |
| Changed Public diagnostic semantics | Añade `INCOMPATIBLE_SCHEMA_COMPOSITION` y provenance `firstDocumentPath`/`firstReferenceChain` dentro de parameters.       |
| New/changed Public signatures       | Ninguna; `Diagnostic`, compiler input/result y definiciones conservan su forma.                                            |
| Internal                            | Composition frames/cursors, ordered reduction, effective property/required catalogs y first-source tracking.               |
| Unchanged                           | Runtime, operaciones, adapters, packages, entry points, exports, dependencias, versiones, publicación y clasificación API. |

Permanecen Deferred repeated-property merging, primitive/array `allOf`, `$ref`
semantic siblings, boolean schemas, `anyOf`, `oneOf`, `not`, conditionals,
`dependentSchemas`, unevaluated semantics, external/dynamic resources,
vocabularies, AST/resolved graph Public, defaults aplicados, expressions,
dynamic definitions y todas las capacidades no listadas.

### 16.10 Gate de aceptación

Revision 7 solo podrá aceptarse después de que una revisión completa repetida
confirme:

1. ubicaciones y catálogos wrapper/contribution exactos;
2. exterior `allOf` descriptor-safe, precedencia, parámetros y stopping;
3. branch forms, nested/reference traversal y orden depth-first;
4. propiedades disjuntas, required union y unmanaged warnings retrasados;
5. reducción de annotations y provenance de conflictos exactos;
6. referencias, paths, templates, sharing y ambos ciclos inalterados;
7. orden global, recopilación independiente y ausencia de partial definition;
8. UI/collections/validator original y ownership de aplicación intactos;
9. inventario Public/Internal sin nueva firma o dependencia;
10. coherencia con ADR-031 y todas las SPEC/ADR Accepted; y
11. preservación de cada frontera Deferred y del gate separado de SPEC.

Cada corrección exigió repetir la revisión completa. Review 260 ciclo 5 pasó
las once áreas con cero hallazgos y ninguna petición de cambio pendiente;
revision 7 quedó Accepted bajo la autorización previa para aceptar documentos
revisados sin ampliación de alcance. Su aceptación autoriza únicamente preparar
y revisar la SPEC de extensión M28.

## 17. Revisión 8 aceptada — campo atómico array enum-string

> Esta sección fija únicamente la política normativa M31 autorizada por
> ADR-034 revision 0 Accepted. Las secciones 1–16 conservan su autoridad
> Accepted. Su aceptación autoriza solo preparar/revisar SPEC-017; no activa
> contrato, plan o implementación.

### 17.1 Motivo, autoridad y frontera

ADR-034 activa el criterio de revisión de la sección 7 para un único slice de
D-006: una propiedad ordinaria `type: "array"` tratada como un campo atómico
cuando sus items son strings de un enum cerrado y declara
`uniqueItems: true`.

Revision 8 conserva Draft 2020-12, la URI canónica, unknowns y annotations,
referencias locales, composición object-`allOf`, collection policies, traversal
descriptor-safe, schema original para el validator y todas las reglas M1–M30
que no sustituye expresamente.

Arrays M10 de objetos conservan identidad, templates, policies y operaciones.
Permanecen fuera arrays primitive libres/numéricos/nullable/mixed, tuples,
nested arrays, arrays dentro de item templates, composición array y toda
keyword array no enumerada como soportada aquí.

### 17.2 Ubicaciones y clasificación de array

El campo M31 puede aparecer solo donde el compilador Accepted espera una
propiedad ordinaria directa o nested fuera de un collection item template,
incluido un use site alcanzado mediante `$ref` local o aportado como propiedad
disjunta por composición object-`allOf`. Root `type: "array"` continúa
bloqueante.

Todo array candidato exige `items` como data property propia cuyo valor sea un
schema object ordinario no array. Para preservar exactamente SPEC-003, un
defecto exterior conserva `expected: 'inline object item schema'` salvo cuando
el outer ya declara una data property propia enumerable
`uniqueItems: true`; solo ese marcador seguro usa
`expected: 'string-enum item schema'`. Ambos usan
`INVALID_SCHEMA_KEYWORD_VALUE` en la ruta de `items` y el `actualType` seguro
Accepted. Un `uniqueItems` ausente, accessor, no enumerable o distinto de true
nunca se usa para reclasificar el diagnóstico M10 existente.

Después del exterior, el `items.type` propio clasifica sin inferencia:

- exacto `"object"` conserva íntegramente el array collection M10;
- exacto `"string"` selecciona el candidato atómico M31; y
- ausencia, accessor, valor no string u otro tipo conserva los diagnósticos de
  tipo Accepted en la ruta exacta y no activa ninguna rama primitive.

Un tipo `number`, `integer`, `boolean`, `null`, `array` u object nullable no se
convierte en candidato M31. No se inspeccionan sus constraints/items como si
fueran un schema soportado.

Un array descubierto dentro de cualquier item template continúa emitiendo
`UNSUPPORTED_FIELD_TYPE` con reason `nested-array-not-supported` y se detiene
antes de leer `items`, incluso si tendría forma M31. Ninguna
`CollectionPolicy` se exige ni se consume para un candidato string; una policy
que apunte a él conserva `UNUSED_COLLECTION_POLICY` porque no existe un array
collection soportado en ese path.

### 17.3 Catálogo cerrado M31

El catálogo semántico exacto es:

| Ubicación           | Miembros soportados                                               |
| ------------------- | ----------------------------------------------------------------- |
| propiedad array M31 | `type`, `items`, `uniqueItems`, `title`, `description`, `default` |
| item string M31     | `type`, `enum`                                                    |

Las annotations ignorables Accepted producen sus warnings en ambos objects y
las unknowns siguen opacas, excepto que `format` no se interpreta como
annotation del item porque este no es un data node. En el item string, `title`,
`description`, `default`, `format`, `const`, nullable type, constraints string,
`properties`, `required`, `items`, `$ref`, applicators y toda otra keyword
semántica producen `INCOMPATIBLE_SCHEMA_KEYWORD` con
`fieldType: 'string-enum-array-item'`; nunca se convierten en metadata del
campo exterior.

En el outer M31, `properties`, `required`, constraints primitive, `enum` y
`allOf` son incompatibles. Usan `INCOMPATIBLE_SCHEMA_KEYWORD` con
`fieldType: 'string-enum-array'`. `const`, `minItems`, `maxItems`, `contains`,
`minContains`, `maxContains`, `prefixItems`, `unevaluatedItems` y toda keyword
array conocida no listada conservan `UNSUPPORTED_SCHEMA_KEYWORD`. `format`
conserva su warning outer Accepted y no se normaliza desde el item.

En un array collection M10, `uniqueItems` continúa siendo conocida no soportada
y produce `UNSUPPORTED_SCHEMA_KEYWORD`. Revision 8 no afirma que la identidad
M10 equivalga a JSON Schema uniqueness.

### 17.4 `uniqueItems: true` requerido

Tras clasificar de forma segura `items.type: "string"`, el outer debe declarar
`uniqueItems` como data property propia enumerable con valor boolean exacto
`true`.

Ausencia/herencia, descriptor accessor, propiedad no enumerable y cualquier
valor distinto de true producen un único `INVALID_SCHEMA_KEYWORD_VALUE` en la
ruta de `uniqueItems`, con:

```ts
{
  keyword: 'uniqueItems';
  expected: 'true';
  actualType: string;
}
```

`actualType` es `missing`, `accessor` o `non-enumerable` para defectos de
descriptor; un data value seguro usa el vocabulario Accepted. Un false seguro
añade `actualValue: false`; ningún otro valor se retiene. El fallback permanece
`Schema keyword "uniqueItems" has an invalid value.`.

El error no impide inspeccionar la forma/enum de items independientemente
segura, pero bloquea toda definición parcial. Core no añade la keyword ni la
considera una policy runtime: el validator externo conserva la assertion.

### 17.5 Item string y enum

El item root exige data properties propias `type: "string"` y `enum`. Una
ausencia/herencia de `enum` produce `INVALID_SCHEMA_KEYWORD_VALUE` en su ruta
con `expected: 'non-empty array of unique strings'` y
`actualType: 'missing'`; un accessor usa
`expected: 'array of unique strings'` y `actualType: 'accessor'`, sin
ejecutarlo. Para un data value presente, `enum` reutiliza íntegramente
ADR-011:

- array propio no vacío, denso, de strings exactas y sin duplicados;
- inspección por descriptors/index ascendente sin iterator, coercion, trim,
  case folding ni normalización Unicode;
- `INVALID_SCHEMA_KEYWORD_VALUE` con expected exacto `array of unique
strings`, `non-empty array of unique strings`, `string` o `unique string`;
  y
- todos los errores independientemente detectables en índice ascendente antes
  de bloquear la definición.

Los `documentPath` quedan bajo `[..., 'items', 'enum', index?]`; `dataPath` es
el path string-only del único campo array. No existe `templatePath`, item index
runtime ni `referenceChain` adicional salvo el del use site schema ya
alcanzado mediante una referencia Accepted.

La lista se copia en orden para construir las choices de ADR-034, pero el
schema original exacto sigue siendo la única entrada del validator. El
compilador comprueba renderabilidad estructural, no pertenencia/duplicados del
valor controlado.

### 17.6 UI Schema y `enumLabels`

La clasificación normalizada M31 selecciona una rama `FieldUiSchema`, no
`ArrayUiSchema`. Admite `label`, `description`, `hint`, `tooltip` y
`enumLabels`. `enumLabels` reutiliza los values/labels, fallback blank,
descriptor safety, ordering y diagnósticos ADR-011, pero corresponde al
`items.enum` del mismo campo.

Un `enumLabels` exterior malformed conserva `INVALID_UI_SCHEMA_VALUE` aunque la
rama schema esté bloqueada. Un exterior válido se recorre solo cuando existe un
enum item válido; de otro modo se suprimen diagnósticos derivados. Keys
desconocidas producen `UNKNOWN_ENUM_LABEL` y nunca añaden/reordenan choices.

`placeholder`, numeric options, `item`, `order`, `fields`, actions,
`visibleWhen` y `enabledWhen` son incompatibles en M31. Los dos miembros de
condición conservan `INVALID_UI_FIELD_CONDITION` con reason
`unsupported-target-location` bajo ADR-033; no se degradan a un warning
genérico. Los demás diagnósticos usan el path UI exacto y
`fieldType: 'string-enum-array'` cuando el envelope Accepted lo incluye. No
existe UI Schema del item.

Un array M10 conserva `ArrayUiSchema` y `enumLabels` incompatible; un campo M31
no acepta `item`. Ninguna forma UI permite cambiar entre ambas familias.

### 17.7 Traversal, orden y branch stopping

La clasificación usa una lectura descriptor-safe de `items`/`items.type` para
elegir familia, sin normalizar ni emitir trabajo dependiente antes de conocerla.
El orden observable queda:

1. input, dialecto, exterior de policies e index `$defs` Accepted;
2. schema depth-first pre-order hasta la propiedad array;
3. outer `type` y members comunes independientemente clasificables;
4. exterior `items` y `items.type`;
5. members outer dependientes de familia, incluido `uniqueItems`;
6. para M10, item object/template y policy bajo todo su orden Accepted;
7. para M31, item string y `enum` en índice ascendente;
8. policies semánticas/unused tras el schema traversal; y
9. UI Schema completo después de todos los diagnósticos schema
   independientemente recopilables.

Un `items` exterior/type inválido detiene clasificación y descendants. No
produce además un diagnóstico derivado para `uniqueItems`, `enum` o
`enumLabels` members. Un `uniqueItems` inválido detiene solo definición
dependiente, no el enum item seguro ni formas UI exteriores independientes. Un
enum bloqueado suprime label compatibility/members, no la forma exterior de
`enumLabels`.

References, composition provenance, containment sharing y los dos dominios de
ciclo conservan sus reglas Accepted. El string item no abre un nuevo resource,
reference target, composition wrapper o containment data node.

### 17.8 Validator, runtime ownership y Public/Internal

El `SchemaValidator` recibe el schema original exacto y el valor completo. Core
no reescribe `items`, añade `uniqueItems`, deduplica valores ni evalúa
assertions. ADR-034 conserva application ownership, operaciones atómicas y
representación de datos inválidos.

La migración ADR-009 exacta es:

| Clasificación                       | Efecto                                                                                                                             |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` podrá aceptar el schema M31 después de una SPEC/plan implementados.                                      |
| Changed Public diagnostic semantics | El expected exterior de `items`, la forma requerida de `uniqueItems`, paths/field type UI y orden familiar quedan cerrados.        |
| New/changed Public signatures       | Ninguna en esta revisión de política.                                                                                              |
| Internal                            | Clasificador object-collection/string-enum, cursor del item string y candidatos detached de choices/UI labels.                     |
| Unchanged                           | Runtime, operaciones, adapters, packages, entry points, exports, dependencies, versions, publication and stability classification. |

Revision 8 no activa la definición/snapshots/texts/renderer de ADR-034; esos
contratos requieren SPEC-017 Accepted y un plan posterior aprobado. Tampoco
selecciona versión ni autoriza un release.

### 17.9 Exclusiones

Permanecen Deferred todos los arrays no exactos M10/M31, `uniqueItems` opcional
o false, enum nullable/mixed/no string, item `$ref`, array `allOf`, nested
arrays, arrays en templates, tuples y demás keywords array. También permanecen
inactivos defaults aplicados, conditions array, generated values, persistence,
otros targets/frameworks, nuevas dependencies/packages, version, release,
publication, Stable promotion, commit, push y external actions.

### 17.10 Gate de aceptación

Revision 8 solo podrá aceptarse después de que una revisión completa repetida
confirme:

1. autoridad exacta ADR-034/D-006/M31 y separación M10;
2. ubicaciones y clasificación family-safe;
3. catálogos outer/item cerrados y exclusions;
4. `uniqueItems: true` requerido, descriptor-safe y determinista;
5. item enum ADR-011, paths y provenance exactos;
6. UI Field/Array separation y labels/diagnostics;
7. traversal, diagnostic order and branch stopping completos;
8. validator original y application ownership intactos;
9. Public/Internal inventory sin firma/dependency/version; y
10. documentación, links, formato, diff y gate separado SPEC-017.

Cada corrección exigió repetir la revisión completa. Review 294 ciclo 2 pasó
las diez áreas con cero hallazgos después de cinco correcciones y revision 8
queda Accepted bajo la regla autorizada de aceptación sin ampliación de
alcance. Autoriza únicamente preparar y revisar SPEC-017; no un plan, código,
dependencia, versión, release, Git o acción externa.

## 18. Revisión 9 aceptada — alternativas discriminadas de objeto anidado

> Esta sección fija únicamente la política normativa M33 autorizada por
> ADR-036 revision 1 Accepted. Las secciones 1–17 conservan su autoridad
> Accepted. Su aceptación autoriza solo preparar/revisar SPEC-019;
> no activaría contrato, plan, implementación, dependencia, versión, release,
> publicación o Git.

### 18.1 Motivo, autoridad y frontera

ADR-036 activa el criterio de revisión de la sección 7 para un único slice de
D-007: una propiedad object ordinaria cuyo `oneOf` puede derivarse como un
catálogo finito de alternativas mediante un discriminador string-enum requerido
y controlado por la aplicación.

Revision 9 conserva Draft 2020-12, la URI canónica, unknowns y annotations,
referencias locales, composición object-`allOf`, arrays M10/M31, traversal
descriptor-safe, schema original para el validator y todas las reglas M1–M32
que no sustituye expresamente.

Documento raíz, collections/items/templates, arrays, `oneOf` recursivo,
`anyOf`, `not`, conditions schema, alternativas solapadas, discriminadores no
string/inferidos, composición dentro del wrapper y evaluación general continúan
Deferred.

### 18.2 Ubicaciones, clasificación y catálogo exterior

Un descriptor propio `oneOf` clasifica un schema object como candidato M33
antes de normalizarlo como object ordinario. Solo es elegible como propiedad
directa del root o descendiente de objects ordinarios fuera de todo collection
item. Un use site `$ref` local elegible puede resolver al wrapper.

El catálogo semántico exacto del wrapper es:

| Ubicación            | Miembros soportados propios                                                              |
| -------------------- | ---------------------------------------------------------------------------------------- |
| propiedad object M33 | `type`, `properties`, `required`, `oneOf`, `title`, `description`, `default`             |
| todos                | annotations ignorables Accepted y keywords desconocidas opacas bajo su política Accepted |

`type`, `properties`, `required` y `oneOf` son obligatorios. `type` debe ser
data property propia con valor exacto `"object"`; `properties`/`required`
conservan sus formas ordinarias descriptor-safe. `default` permanece metadata
opaca para compiler/runtime y no crea una rama.

`$ref`, `allOf`, `anyOf`, otro applicator/conditional, keywords array y toda
keyword semántica no listada son siblings incompatibles. Producen
`INCOMPATIBLE_SCHEMA_KEYWORD` con
`{ keyword, fieldType: 'discriminated-object' }` y fallback Accepted. No se
inspeccionan como una contribución o condición implícita.

En el document root, `oneOf` conserva `UNSUPPORTED_SCHEMA_KEYWORD`, sin
`dataPath`. En primitive/array ordinario usa `INCOMPATIBLE_SCHEMA_KEYWORD` con
el `fieldType` Accepted. En item root/template o cualquier descendant de item
conserva `UNSUPPORTED_SCHEMA_KEYWORD`, porque M33 no promueve esa location. Un
`oneOf` nested bajo un wrapper M33 usa `INCOMPATIBLE_SCHEMA_KEYWORD` con
`{ keyword: 'oneOf', fieldType: 'discriminated-object' }`. Ninguno de estos
casos inspecciona branches.

Cada propiedad outer debe resolver a una hoja primitive no array o a un object
ordinario sin arrays/alternativas en todo su subtree. `$ref` local puede
alcanzar solo esos targets efectivos. Un target M10/M31, `allOf` o `oneOf`
produce la familia de alternativa incompatible de la sección 18.6.

### 18.3 Exterior descriptor-safe de `oneOf`

`oneOf` debe ser una data property propia enumerable cuyo valor satisfaga
`Array.isArray(value) === true`. Su descriptor propio `length` debe ser un
entero seguro mayor o igual que dos. Cada índice `0..length - 1` debe ser una
data property propia enumerable con schema object ordinario no array;
`Object.keys(oneOf)` no puede contener otra key string.

Se emite como máximo un error exterior por array, en este orden:

1. descriptor/valor de `oneOf`;
2. descriptor/valor de `length`;
3. primer índice malformed en orden ascendente; y
4. primera key enumerable adicional en `Object.keys()` order.

Todos usan `INVALID_SCHEMA_KEYWORD_VALUE`, severidad `error`, fuente `schema`
y fallback `Schema keyword "oneOf" has an invalid value.`. Paths y parámetros
exactos son:

| Fallo                      | `documentPath`          | Parámetros                                                                                                                         |
| -------------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| descriptor/valor           | `[..., 'oneOf']`        | `{ keyword: 'oneOf', expected: 'array of at least two object schemas', actualType }`                                               |
| length                     | `[..., 'oneOf']`        | `{ keyword: 'oneOf', expected: 'safe integer length of at least two', reason: 'invalid-oneof-length', actualType, actualLength? }` |
| índice                     | `[..., 'oneOf', index]` | `{ keyword: 'oneOf', expected: 'ordinary schema object', actualType }`                                                             |
| key enumerable no indexada | `[..., 'oneOf', key]`   | `{ keyword: 'oneOf', expected: 'dense array indices only', reason: 'unexpected-oneof-member' }`                                    |

`actualType` usa `missing`, `accessor` o `non-enumerable` para defectos de
descriptor y la descripción segura Accepted para valores data incompatibles.
`actualLength` aparece solo para un entero seguro menor que dos; NaN, infinito,
fracciones y enteros no seguros no se retienen.

No se ejecutan accessors, iterators, coercions ni callbacks. Un exterior
inválido detiene todas sus ramas dependientes; siblings schema/UI independientes
conservan su orden Accepted.

### 18.4 Forma de rama y referencias

Cada branch se inspecciona por índice ascendente y debe ser:

1. un object de rama ordinario; o
2. un object `$ref` puro cuyo target local finito resuelva a un object de rama
   ordinario.

Revision 9 añade los índices `oneOf` como posiciones no root donde un `$ref`
puro es soportado. Sintaxis, `$defs`, pointer, siblings, chains, unresolved y
cycle behavior permanecen exactos. Un target reference-to-reference es válido
si termina en una rama ordinaria.

El catálogo semántico de una rama ordinaria es solo `type`, `properties` y
`required`, más annotations ignorables y unknowns opacas. Los tres miembros son
obligatorios; `type` es exacto `"object"`. `title`, `description`, `default`,
resources, applicators y conditionals son incompatibles con
`fieldType: 'object-alternative'`.

Cada rama conserva su `branchIndex` authored para diagnósticos. La definición
normalizada posterior se ordenará por el enum outer; revision 9 no expone index,
schema object, cursor o branch provenance en una firma Public.

### 18.5 Inferencia exacta del discriminador

Un seed candidate es una propiedad directa outer que:

1. aparece en `required` outer;
2. normaliza como string scalar no nullable con enum válido de al menos dos
   strings únicas;
3. no tiene `const` outer; y
4. aparece al menos en una rama safely inspectable con la forma assertion
   exacta y requerida de esta sección.

La forma branch-local debe declarar data properties propias
`type: "string"` y `const: <string>`, incluir el nombre en `required` de la
rama y no declarar `enum`. Solo admite además annotations ignorables y unknowns
opacas. Su `const` reutiliza inspección/diagnóstico string de revision 6, pero
nunca crea otro node ni `fixedValue`.

Debe existir exactamente un seed candidate. Cero o más de uno producen
`INCOMPATIBLE_SCHEMA_ALTERNATIVE` con reason
`invalid-discriminator-candidate-count`, anclado en `oneOf` y parámetros:

```ts
{
  reason: 'invalid-discriminator-candidate-count';
  candidateCount: number;
  expected: 'exactly one seeded required outer string-enum discriminator';
}
```

`candidateCount` es un entero seguro recopilado sin retener nombres/values de
candidatos ambiguos. Tras seleccionar el seed único, se comprueba su presencia,
forma required/type/const y mapping en cada branch; así
`missing-branch-discriminator` e `invalid-branch-discriminator` son alcanzables
y exactos. Otro enum common no repetido en branches no es seed. Un defecto
estructural previo conserva su diagnóstico propio y suprime únicamente el
conflicto derivado que dependa de ese member.

### 18.6 Bijección, propiedades y familia de conflictos

Las branches deben mapear biyectivamente el enum outer:

- cada `const` pertenece al enum;
- cada value aparece en exactamente una rama;
- cada enum choice tiene exactamente una rama; y
- el número de ramas coincide con el número de choices.

El discriminador se excluye del catálogo de hijos de rama. Cada otro nombre
branch debe ser disjoint respecto a properties outer y a todas las otras
branches. Su subtree efectivo queda limitado a primitive/object ordinario no
array, sin conditions/applicators/composition.

Revision 9 añade un código `INCOMPATIBLE_SCHEMA_ALTERNATIVE`, siempre
`error`/`schema`, fallback `Schema object alternative is incompatible.` y un
reason cerrado:

```ts
type SchemaAlternativeConflictReason =
  | 'unsupported-branch-kind'
  | 'invalid-discriminator-candidate-count'
  | 'missing-branch-discriminator'
  | 'invalid-branch-discriminator'
  | 'duplicate-discriminator-value'
  | 'unmapped-discriminator-value'
  | 'outer-property-redeclared'
  | 'duplicate-alternative-property'
  | 'invalid-alternative-required'
  | 'unsupported-alternative-descendant';
```

Formas exactas adicionales:

- branch kind: `{ reason, branchIndex, expected: 'ordinary object alternative or local reference' }`;
- branch discriminator missing/invalid: `{ reason, branchIndex, discriminator }`;
- duplicate const: `{ reason, branchIndex, firstBranchIndex, discriminator }`;
- enum choice sin rama: `{ reason, choiceIndex, discriminator }`;
- redeclaration/duplicate property:
  `{ reason, branchIndex, property, firstDocumentPath, firstReferenceChain? }`;
- branch required fuera de su catálogo:
  `{ reason: 'invalid-alternative-required', branchIndex, property }`;
- descendant incompatible:
  `{ reason, branchIndex, property, expected: 'non-array primitive or ordinary object subtree' }`.

No parámetro retiene un discriminator/enum/const business value. Nombres de
property y paths son metadata estructural copiada/frozen. `firstDocumentPath`
apunta a la primera key `properties`; `firstReferenceChain` aparece solo para
ese origen reference-mediated.

El diagnóstico actual se ancla al origen posterior exacto: branch index/target,
discriminator keyword, enum choice o property schema. Un target referenciado
conserva `documentPath` canónico, use-site `dataPath` y `referenceChain`. Una
branch defectuosa detiene su resultado dependiente; ramas posteriores siguen
para diagnósticos independientes. Cualquier error impide definición parcial.

### 18.7 Required, unión, orden y UI Schema

`required` outer debe incluir el discriminador. Cualquier otro nombre ausente
de outer `properties` conserva exactamente `UNMANAGED_REQUIRED_PROPERTY` como
warning no bloqueante; no invalida la alternativa. `required` branch solo puede
gobernar el discriminador y properties propias de esa branch, y debe incluir el
discriminador. Un nombre branch cruzado/no declarado usa
`INCOMPATIBLE_SCHEMA_ALTERNATIVE`, reason `invalid-alternative-required`, en el
índice exacto de `required` y nunca crea requiredness condicional implícito.

El catálogo union se construye con properties outer en su orden y luego
properties específicas por branch/index. Después, un único `ObjectUiSchema`
del use site ordena ese catálogo. `fields` puede nombrar cualquier key union;
`order` se filtra en runtime a common + active sin branch UI.

Conforme a revision 11, un `presentation` accessor, malformed o
estructuralmente inválido conserva la familia warning
`INVALID_UI_PRESENTATION` Accepted de SPEC-005/SPEC-009, activa su fallback
atómico y no añade incompatibility. Un `presentation` estructuralmente válido
en el owner discriminado es incompatible y se ignora con
`INCOMPATIBLE_UI_OPTION`,
`fieldType: 'discriminated-object'`, `option: 'presentation'` y reason
`dynamic-children`. Objects ordinarios hijos conservan su presentación estática
local.

`visibleWhen`/`enabledWhen` dentro del union conservan
`INVALID_UI_FIELD_CONDITION`, reason `unsupported-target-location`. Un
condition externo que intente usar un path union como source conserva
`source-not-ordinary-field`. No se compilan conditions de lifetime dinámico.

UI paths permanecen paths UI del use site sin provenance schema/reference. Los
labels de alternativa son los choice labels existentes del discriminador;
branches no aportan title/description.

### 18.8 Traversal, paths, ciclos y stopping

Tras los gates globales Accepted, el orden dentro del wrapper es:

1. shape/type/properties/required outer y clasificación de members;
2. exterior `oneOf`;
3. branches depth-first por índice, incluidos `$ref` y schema descendants
   independientemente seguros;
4. inferencia del discriminador y conflictos de bijection;
5. conflictos de property/required y normalización union;
6. linking semántico de UI conditions; y
7. UI Schema completo del único use site.

Un exterior inválido detiene branches. Un member/branch inválido detiene solo
su resultado dependiente. Cero candidato por defectos ya diagnosticados no
duplica conflicto derivado; ambigüedad segura sí lo produce. Independientes
schema, policies y UI exteriores continúan en orden. Todo error devuelve
`success: false` sin `FormDefinition` parcial.

Inline `documentPath` incluye `oneOf` e índices. Targets referenciados conservan
path fuente y chain outermost-to-innermost. Raw re-entry por `properties`/
`oneOf` usa `CYCLIC_SCHEMA_OBJECT`; target re-entry por `$ref` usa
`CYCLIC_SCHEMA_REFERENCE`. No se crea `alternativeChain` ni un tercer ciclo.

### 18.9 Validator, runtime y helper de defaults

`SchemaValidator` recibe el schema original exacto y el valor completo. Core no
reescribe ni preselecciona una branch para validar. Compiler selection solo
prueba renderabilidad estructural; no sustituye la assertion `oneOf`.

La política runtime/definition/snapshot de ADR-036 requiere una SPEC posterior;
revision 9 no activa sus cinco símbolos Public ni cambia firmas. Sí reserva la
familia runtime de target alternativo inactivo que la SPEC deberá cerrar sin
retener business values.

`deriveSchemaDefaultCandidate()` conserva M29 y trata el `oneOf` M33 como
boundary bloqueante. Emite `UNSUPPORTED_SCHEMA_KEYWORD` en el path exacto de
`oneOf`, con `dataPath` del owner y `{ keyword: 'oneOf' }`; no recorre branches
para defaults y devuelve la referencia original con `success: false`. Este
resultado contextual no reclasifica el soporte del compiler.

### 18.10 Public/Internal y exclusiones

La migración ADR-009 de política es:

| Clasificación                       | Efecto                                                                                                                                |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Changed Public behavior             | `compileFormDefinition()` podrá aceptar el subset M33 después de SPEC/plan implementados.                                             |
| Changed Public diagnostic semantics | Exterior, conflicto de alternativa, UI incompatibility, reference provenance y ordering quedan cerrados.                              |
| New/changed Public signatures       | Ninguna en revision 9; ADR-036 reserva cinco tipos y unions para una SPEC posterior.                                                  |
| Internal                            | Clasificador/cursors oneOf, inferencia, mapping enum/const, union ownership y provenance.                                             |
| Unchanged                           | Runtime activo, operaciones, validator/default-helper signatures, adapters, packages, entry points, dependencies, versions y release. |

Permanecen Deferred root/items/collections/arrays, M31 en wrapper, `oneOf`
recursive, overlapping names, non-string/inferred discriminators, `anyOf`,
`not`, if/then/else, dependent/unevaluated semantics, alternative `allOf`,
conditional fields/presentation, applied defaults/clearing/migration,
dynamic definitions, Public AST/graph, external/dynamic resources, wizard,
React/Vue, dependency/version/release/publication/Git y toda capacidad no
enumerada.

### 18.11 Gate de aceptación

Revision 9 solo podrá aceptarse después de que una revisión completa repetida
confirme:

1. autoridad exacta ADR-036/review 314 y frontera nested-only;
2. catálogo outer/branch y ubicaciones exactos;
3. exterior `oneOf` descriptor-safe, paths, parameters y stopping;
4. referencias, provenance, sharing y ambos ciclos;
5. inferencia de un discriminador y bijection enum/const sin business-value
   retention;
6. properties/required disjoint, unión y orden deterministas;
7. código/reasons/parameters de alternativa completos;
8. un UI Schema, presentation/conditions y paths UI exactos;
9. schema original para validator y default helper M29 bloqueado;
10. inventario Public/Internal sin firma/dependency/version; y
11. documentación, links, formato, diff, exclusiones y gate separado SPEC-019.

Cada corrección exigió repetir la revisión completa. Review 316 ciclo 2 pasó
las dieciséis áreas con cero hallazgos después de cinco correcciones y revision
9 queda Accepted bajo la regla autorizada. Autoriza únicamente preparar y
revisar SPEC-019, no plan, implementación, dependencia, versión, release,
publicación, Git o acción externa.

## 19. Revisión 10 aceptada — diagnóstico owner-relative de descendientes M33

### 19.1 Motivo y frontera

Durante PLAN-035 checkpoint 1 se detectó una incompatibilidad interna entre
las secciones 18.2 y 18.6. La primera asigna a la familia
`unsupported-alternative-descendant` tanto propiedades outer/common como
propiedades específicas de una branch. La segunda hacía `branchIndex`
obligatorio en todos los casos, aunque una propiedad outer/common no pertenece
a ninguna branch y no dispone de ese índice.

Ricard acepta la corrección mínima el 3 de agosto de 2026. Revision 10 no añade
ubicaciones, schemas, diagnósticos, reasons, behavior runtime ni alcance. Solo
reemplaza la forma del reason `unsupported-alternative-descendant` de la
sección 18.6 por las dos variantes owner-relative siguientes.

### 19.2 Formas exactas

Un descendiente incompatible declarado en `properties` outer/common usa:

```ts
{
  reason: 'unsupported-alternative-descendant';
  property: string;
  expected: 'non-array primitive or ordinary object subtree';
}
```

`branchIndex` está ausente. El `documentPath` se ancla en la propiedad outer o
en el target referenciado efectivo, `dataPath` es el owner discriminado y
`referenceChain` aparece únicamente cuando procede bajo las reglas Accepted.

Un descendiente incompatible declarado por una branch conserva:

```ts
{
  reason: 'unsupported-alternative-descendant';
  branchIndex: number;
  property: string;
  expected: 'non-array primitive or ordinary object subtree';
}
```

`branchIndex` es obligatorio y es el índice authored de esa branch. Ninguna
variante retiene enum/const/discriminator values, schema objects o cursors. Los
demás reasons, parámetros, paths, ordering, stopping y exclusiones de revision
9 permanecen exactos.

### 19.3 Gate y aceptación

Review 319 ciclo 1 repite completamente autoridad, ubicaciones, catálogos,
diagnósticos, referencias, seguridad de parámetros, contrato SPEC-019, mapping
PLAN-035 y documentación con cero hallazgos. ADR-005 revision 10 queda Accepted
junto con SPEC-019 v0.1.1 y PLAN-035 revision 1, sin cambio de dependencia,
versión de paquete, release, publicación o Git.

## 20. Revisión 11 aceptada — compatibilidad de presentación M33

### 20.1 Motivo y frontera

Durante PLAN-035 checkpoint 1, una prueba descriptor-safe expuso que la
sección 18.7 asignaba erróneamente `INVALID_UI_SCHEMA_VALUE` a un
`presentation` owner M33 malformed/accessor. SPEC-005 v0.1.1 y SPEC-009 v0.1.0
ya cierran todos los defectos de presentation con la familia warning
`INVALID_UI_PRESENTATION`, parámetros exactos y fallback atómico. La frase M33
contradecía esa autoridad Accepted y no definía una forma completa alternativa.

Ricard acepta el 4 de agosto de 2026 preservar la familia existente. Revision
11 no añade UI, diagnósticos, members, severidades ni runtime behavior; corrige
solo la interacción M33 con presentation.

### 20.2 Conducta exacta

Un `presentation` owner M33 malformed, accessor o estructuralmente incompleto:

1. conserva los códigos, reasons, parámetros, paths, warning severity,
   descriptor safety, orden y recopilación independiente de SPEC-005/SPEC-009;
2. invalida atómicamente únicamente ese forest de presentación y usa el
   fallback estático Accepted;
3. no produce `INCOMPATIBLE_UI_OPTION` por `dynamic-children`; y
4. no convierte por sí solo `compileFormDefinition()` en failure.

Solo cuando el forest owner es estructuralmente válido se descarta para M33 y
se emite el warning `INCOMPATIBLE_UI_OPTION` exacto de la sección 18.7 con
`fieldType: 'discriminated-object'`, `option: 'presentation'` y
`reason: 'dynamic-children'`. No se normaliza presentación dinámica ni se
introduce UI por branch.

Todas las demás reglas de revision 10, SPEC-019 y PLAN-035 permanecen exactas.

### 20.3 Gate y aceptación

Review 320 ciclo 2 repite autoridad, presentación Accepted, diagnostics,
owner-relative descendants, referencias, contrato, 17-row mapping,
exclusiones y documentación con cero hallazgos después de corregir el conflicto
en ciclo 1. ADR-005 revision 11 queda Accepted junto con SPEC-019 v0.1.2 y
PLAN-035 revision 2, sin cambio de código requerido, dependencia, versión de
paquete, release, publicación o Git.
