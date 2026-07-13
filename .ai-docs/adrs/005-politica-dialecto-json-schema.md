# ADR 005: Política de dialecto y compatibilidad de JSON Schema

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Fecha de aceptación:** 13 de julio de 2026
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md)

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

| Código | Severidad | Comportamiento | `documentPath` |
|---|---|---|---|
| `MISSING_SCHEMA_DIALECT` | `warning` | Asume Draft 2020-12 y continúa | `['$schema']` |
| `INVALID_SCHEMA_DIALECT` | `error` | Bloquea la compilación | `['$schema']` |
| `UNSUPPORTED_SCHEMA_DIALECT` | `error` | Bloquea la compilación | `['$schema']` |
| `UNSUPPORTED_SCHEMA_KEYWORD` | `error` | Bloquea la compilación | Ruta de la keyword |
| `IGNORED_SCHEMA_KEYWORD` | `warning` | Ignora la anotación conocida | Ruta de la keyword |
| `UNKNOWN_SCHEMA_KEYWORD` | `warning` | Ignora la keyword desconocida | Ruta de la keyword |

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
