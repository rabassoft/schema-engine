# ADR 004: Estrategia de Renderizado Dinámico (Patrón Registry Agnóstico)

**1. Título:** Adopción conceptual del Patrón Registry para la resolución dinámica de interfaces.
**2. Fecha:** 12 de Julio de 2026.
**3. Contexto:** El motor debe interpretar el JSON Schema y los metadatos visuales (UI Schema) para determinar en tiempo de ejecución qué tipo de control de interfaz se debe mostrar. Al ser un núcleo agnóstico (Capa 0), el motor desconoce cómo se renderizan los componentes en los frameworks destino, pero debe proporcionar una vía para que estos sepan qué componente instanciar.

**4. Decisión:** Se implementará el concepto del **Patrón Registry** a nivel lógico. La Capa 0 mantendrá un diccionario estandarizado (registro) que mapeará los tipos de datos del esquema (ej. `string`, `boolean`, `enum`) a identificadores únicos. Las capas puente de cada framework consumirán este diccionario para resolver y pintar sus respectivos componentes acoplados a la UI.

**5. Alternativas Consideradas:**

- Delegar toda la lógica de resolución a los paquetes puente. Descartado porque obligaría a reescribir las reglas de inferencia del JSON Schema (ej. saber que un `string` con formato `date-time` es un calendario) en cada framework.

**6. Consecuencias:**

- _Positivas:_ La lógica para deducir qué control visual corresponde a qué propiedad del JSON Schema se centraliza en Vanilla TypeScript y es reutilizable.
- _Negativas:_ Obliga a establecer contratos estrictos mediante interfaces/tipos entre la Capa 0 y los puentes de framework.
