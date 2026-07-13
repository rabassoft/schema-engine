# ADR 003: Arquitectura "Core Headless" y Soluciones Múltiples de Interfaz

**1. Título:** Desacoplamiento de Interfaz (UI) y Arquitectura Headless.
**2. Fecha:** 12 de Julio de 2026.
**3. Contexto:** Un mismo motor lógico debe poder renderizar paneles de configuración densos o formularios comerciales a pantalla completa, permitiendo además el uso de distintos sistemas de diseño (Tailwind, Material).

**4. Decisión:** El ecosistema se estructurará en paquetes especializados:
* Un puente lógico Headless (`@rabassoft/schema-engine-angular`) que exporte directivas y estado puro.
* Paquetes de interfaz especializados que consuman dicho puente: `@rabassoft/property-inspector-ui` (para paneles densos) y `@rabassoft/dynamic-forms-ui` (para formularios).

**5. Alternativas Consideradas:**
* Crear una única librería monolítica de UI con múltiples configuraciones. Descartada por engordar el *bundle size* innecesariamente.

**6. Consecuencias:**
* *Positivas:* Separación de responsabilidades perfecta. Permite que otras empresas utilicen nuestro Core para inyectar sus propias librerías internas de componentes.