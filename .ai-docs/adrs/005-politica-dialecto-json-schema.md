# ADR 005: Política de dialecto y compatibilidad de JSON Schema

- **Estado:** Accepted revision 4
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Revisión aceptada:** 4 — type array nullable cerrado
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
- **Autoridad vigente:** las secciones 1–12 conservan la conducta Accepted de
  M1–M11; la sección 13 queda Accepted para diseño normativo M14 y no activa
  comportamiento ni implementación sin SPEC-006 aceptada y PLAN-014 aprobado
- **Revisión completa:** ciclo 3 pasó las nueve áreas sin hallazgos y Ricard
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
