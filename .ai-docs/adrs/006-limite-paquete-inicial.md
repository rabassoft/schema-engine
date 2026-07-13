# ADR 006: Límite y nombre público del paquete inicial

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Relacionado con:** [`PLAN-001`](../plans/001-compiler-only-implementation.md)

## 1. Contexto

El repositorio debe iniciar el primer incremento de implementación sin cerrar
la puerta a futuros adaptadores de framework. El ADR-001 pre-SPEC utilizó el
nombre provisional `@rabassoft/schema-engine-core`, mientras que `SPEC-001`
define el prototipo bajo `@rabassoft/schema-engine`.

Antes de crear el workspace es necesario fijar una única ubicación y un único
nombre público sin decidir todavía el versionado o la publicación de los
futuros paquetes.

## 2. Decisión

- Se creará un workspace nativo de `pnpm`, sin Nx ni Turborepo.
- El core neutral residirá en `packages/core`.
- Su nombre público será `@rabassoft/schema-engine`.
- El paquete será ESM, no tendrá dependencias de runtime y expondrá inicialmente
  un único entry point raíz.
- Los futuros adaptadores y paquetes visuales residirán en paquetes separados;
  sus nombres y límites no quedan definidos por este ADR.

El nombre provisional `@rabassoft/schema-engine-core` queda sustituido. La
decisión de ADR-001 de mantener el core independiente de frameworks permanece
vigente.

## 3. Consecuencias

- El primer paquete coincide con el nombre utilizado por `SPEC-001`.
- El workspace puede añadir adaptadores sin mover el core.
- Se evita introducir un orquestador antes de que exista una necesidad real.
- La carpeta interna `core` y el nombre público no son idénticos, por lo que la
  documentación debe distinguir ubicación de paquete y nombre de publicación.

## 4. Fuera de alcance

- Estrategia de versionado y compatibilidad con frameworks, registrada en D-028.
- Automatización de releases y publicación en un registry.
- Nombres definitivos de adaptadores, validadores y kits visuales.
- Política completa de estabilidad y deprecación de API, registrada en D-029.

## 5. Criterios de revisión

Revisar esta decisión si el primer adaptador demuestra que el workspace nativo
es insuficiente, si el core necesita dividirse por responsabilidades reales o
antes de publicar un segundo paquete estable.

## 6. Alternativas consideradas

- `@rabassoft/schema-engine-core`: descartado para el primer paquete porque no
  coincide con el ámbito público de `SPEC-001` y añade un sufijo sin necesidad.
- Paquete único en la raíz: descartado porque dificultaría añadir adaptadores
  separados en el mismo repositorio.
- Nx o Turborepo desde el inicio: descartado porque un único paquete no justifica
  todavía esa capa de orquestación.
