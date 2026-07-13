# ADR 001: Desacoplamiento del framework reactivo utilizando un Core en TypeScript puro

**1. Título:** Desacoplamiento del framework reactivo (Capa 0).
**2. Fecha:** 12 de Julio de 2026.
**3. Contexto:** El motor debe poder ser consumido por distintos ecosistemas (Angular, React, etc.). Si el núcleo (`recursividad`, `validación de JSON Schema`) usa primitivas de un framework concreto (ej. Signals), quedará bloqueado en ese ecosistema.

**4. Decisión:** Se construirá una "Capa 0" (`@rabassoft/schema-engine-core`) en TypeScript Vanilla puro, agnóstica a la UI. La gestión del estado y validación se orquestarán de forma independiente.

**5. Alternativas Consideradas:**

- Reimplementar la lógica para cada framework. Descartada por el alto coste de mantenimiento y riesgo de desincronización de validaciones.

**6. Consecuencias:**

- _Positivas:_ Lógica de negocio a prueba de migraciones. Testing unitario ultra rápido.
- _Negativas:_ Requiere mantener paquetes "puente" (`@rabassoft/schema-engine-angular`) para traducir el estado agnóstico a las primitivas reactivas del framework destino.
