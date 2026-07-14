# ADR 005: Política de dialecto y compatibilidad de JSON Schema

- **Estado:** Accepted revision 1
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Revisión aceptada:** 1 — 14 de julio de 2026
- **Fecha de aceptación de revisión 1:** 14 de julio de 2026
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md)
- **Revisado parcialmente por:**
  [`ADR-011`](./011-enum-string-normalizado-select-nativo.md)
- **Revisión 1 coordinada con:**
  [`ADR-014`](./014-modelo-objetos-anidados-paths-profundos.md) y
  [`SPEC-002`](../specs/002-nested-object-runtime.md)

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
