# Visión General del Proyecto: Rabassoft Schema Engine

## 1. Propósito y Objetivos

Rabassoft Schema Engine es un ecosistema modular para la generación dinámica de interfaces de usuario impulsadas por metadatos (JSON Schema + UI Schema).

El sistema aísla por completo la lógica de validación y estado de la capa de presentación, permitiendo que un mismo motor lógico sirva tanto para paneles densos de configuración técnica (`@rabassoft/property-inspector-ui`) como para formularios comerciales de usuario final (`@rabassoft/dynamic-forms-ui`).

## 2. Principios de Diseño Fundamentales

- **Agnosticismo de Framework (Capa 0):** La lógica pura (validación, recursividad, máquinas de estado) sobrevive a migraciones de tecnología.
- **Desacoplamiento Visual (Headless UI):** El motor lógico no está atado a ninguna librería de componentes. La interfaz visual se "conecta" al motor.
- **Principio Abierto/Cerrado (Open/Closed):** Permite la inyección de editores/componentes personalizados desde el exterior.
- **Adopción de Estándares Modernos:** Aprovechamiento de arquitecturas Zoneless, reactividad granular y funciones Standalone.

## 3. Índice de Decisiones Arquitectónicas (ADRs Globales)

Las decisiones a continuación aplican a **todo** el ecosistema. Las decisiones específicas de implementación para un framework residen en `.ai-docs/adrs/<framework>/`.

Estos ADRs son anteriores a `SPEC-001`. Conservan contexto histórico, pero los marcados para revisión no son autoritativos cuando entren en conflicto con la especificación.

1. [ADR 001: Desacoplamiento del framework reactivo (Core en Vanilla TS)](./001-agnosticismo-framework-core.md) — Pre-SPEC; dirección alineada, estado formal pendiente de normalización; el nombre provisional del paquete queda sustituido por ADR-006.
2. [ADR 002: Estrategia de Versionado (Lockstep) y Compatibilidad](./002-versionado-lockstep.md) — **Requiere revisión**; relacionado con D-028.
3. [ADR 003: Arquitectura Headless y Desacoplamiento de Interfaz (UI)](./003-arquitectura-headless-ui.md) — Pre-SPEC; estado formal pendiente de normalización.
4. [ADR 004: Estrategia de Renderizado Dinámico (Patrón Registry Agnóstico)](./004-renderizado-dinamico-registry.md) — **Requiere revisión**; relacionado con D-023.
5. [ADR 005: Política de dialecto y compatibilidad de JSON Schema](./005-politica-dialecto-json-schema.md) — **Accepted.**
6. [ADR 006: Límite y nombre público del paquete inicial](./006-limite-paquete-inicial.md) — **Accepted.**

## 4. ADRs específicos de Angular

1. [Angular ADR 001: Proveedores Funcionales y Registro Reactivo Zoneless](./angular/001-angular-proveedores-funcionales-signals.md) — **Requiere revisión**; contiene afirmaciones pre-SPEC sobre Signals, RxJS, Zone.js y zoneless.
2. `Angular ADR 002: Instanciación mediante ViewContainerRef` — **Placeholder vacío**; no registra una decisión aceptada.
