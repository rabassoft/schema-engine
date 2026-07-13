# ADR 007: Resolución de renderers mediante testers puntuados

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Relacionado con:** [`SPEC-001`](../specs/001-controlled-form-runtime.md), [`D-023`](../roadmap/deferred-decisions.md)
- **Supersede:** [`ADR-004`](./004-renderizado-dinamico-registry.md)

## 1. Contexto

El primer adaptador Angular debe seleccionar un renderer HTML para cada
`FieldDefinition` sin hacer que el core conozca componentes, Angular o JSON
Schema sin normalizar. El diccionario pre-SPEC `type -> component` de ADR-004
no permite expresar especialización, prioridades, overrides controlados ni
diagnósticos deterministas cuando varios renderers son compatibles.

## 2. Decisión

### 2.1 Límite de responsabilidad

- El core compila metadatos a `FieldDefinition` y no registra ni resuelve
  renderers.
- Cada adaptador de framework posee sus registrations y componentes.
- Los testers reciben exclusivamente una `FieldDefinition` normalizada. No
  reciben JSON Schema crudo, DOM, estado global ni servicios del framework.
- La selección es estable durante la vida de una definición; no depende del
  valor actual, touched, foco, validación o locale.

### 2.2 Registration y tester

La semántica neutral será:

```ts
export interface RendererRegistration<TRenderer> {
  readonly id: string;
  readonly renderer: TRenderer;
  readonly tester: RendererTester;
  readonly priority?: number;
}

export type RendererTester = (field: FieldDefinition) => number | null;
```

- `null` significa incompatible.
- Un match devuelve un entero finito no negativo llamado `rank`.
- `priority` es un entero finito, por defecto `0`, usado para overrides
  explícitos sin alterar la lógica del tester.
- `id` es una string no vacía y única dentro del registry.
- `renderer` es un token opaco para la semántica neutral; el adaptador Angular
  fijará su tipo concreto en su plan.

### 2.3 Selección determinista

Para un campo:

1. Ejecutar todos los testers sobre la misma `FieldDefinition`, en orden de
   registration.
2. Ignorar candidatos con resultado `null`.
3. Elegir el mayor `rank`.
4. En empate, elegir la mayor `priority`.
5. Si continúa el empate, elegir la registration más temprana.

Los testers no pueden mutar el campo. Una excepción se aísla, descarta ese
candidato y produce `RENDERER_TESTER_EXCEPTION`. Un resultado inválido produce
`INVALID_RENDERER_TEST_RESULT`. Si no queda ningún candidato se produce el
error bloqueante `NO_RENDERER_MATCH`.

IDs duplicados, registrations malformadas o prioridades inválidas bloquean la
creación del resolver. El registry se valida y se convierte en una lista
inmutable por instancia del adaptador; no existe un singleton global mutable.

### 2.4 Built-ins y extensiones

- Los renderers HTML nativos para string, number, integer y boolean se expresan
  mediante las mismas registrations que los renderers personalizados.
- Un consumidor puede añadir registrations al configurar el adaptador. Un
  override explícito usa mayor `rank` o `priority`; no reemplaza entradas por
  mutación posterior.
- El mecanismo concreto de DI/proveedores y el tipo del token Angular se fijan
  en PLAN-004.
- Capabilities de framework, carga lazy, SSR/hydration y selección dinámica por
  estado permanecen fuera de esta decisión y siguen aplazadas.

## 3. Consecuencias

Positivas:

- El core sigue completamente independiente de frameworks y UI.
- La selección admite especialización y extensiones sin interpretar schema
  crudo en cada renderer.
- Los empates, errores y ausencia de renderer son deterministas y comprobables.
- Built-ins y custom renderers comparten un único mecanismo.

Negativas:

- Cada adaptador debe integrar la semántica de selección con sus propios tokens
  de componentes.
- Todos los testers se evalúan para cada campo en el walking skeleton.
- Rank y priority requieren convenciones documentadas para evitar overrides
  accidentales.

## 4. Alternativas consideradas

### Diccionario estático `type -> component`

Rechazado por no soportar especialización, prioridades ni múltiples candidatos.
ADR-004 queda superseded.

### Resolver componentes dentro del core

Rechazado porque introduciría conceptos de framework y presentación en el
paquete neutral.

### El primer match gana sin puntuación

Rechazado porque el orden de composición se convertiría en la única forma de
override y haría difícil expresar compatibilidad más específica.

### Sistema genérico de plugins

Rechazado para esta fase porque D-016 continúa aplazada y no existe evidencia
para un lifecycle genérico.

## 5. Criterios de revisión

Revisar cuando exista un segundo adaptador de framework, se introduzcan
renderers lazy/asíncronos, aparezcan capabilities reales compartidas o la
evaluación lineal de testers sea un problema medido.
