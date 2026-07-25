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
2. [ADR 002: Estrategia de Versionado (Lockstep) y Compatibilidad](./002-versionado-lockstep.md) — **Superseded por ADR-010.**
3. [ADR 003: Arquitectura Headless y Desacoplamiento de Interfaz (UI)](./003-arquitectura-headless-ui.md) — Pre-SPEC; estado formal pendiente de normalización.
4. [ADR 004: Estrategia de Renderizado Dinámico (Patrón Registry Agnóstico)](./004-renderizado-dinamico-registry.md) — **Superseded por ADR-007.**
5. [ADR 005: Política de dialecto y compatibilidad de JSON Schema](./005-politica-dialecto-json-schema.md) — **Accepted revision 4; conserva D-041/M11 e incorpora solo el diseño D-009/M14 coordinado con ADR-019 tras review 032 ciclo 2 sin hallazgos.**
6. [ADR 006: Límite y nombre público del paquete inicial](./006-limite-paquete-inicial.md) — **Accepted.**
7. [ADR 007: Resolución de renderers mediante testers puntuados](./007-resolucion-renderers-testers.md) — **Accepted.**
8. [ADR 008: Instanciación inline de renderers Angular con ViewContainerRef](./008-instanciacion-renderers-angular.md) — **Accepted.**
9. [ADR 009: Límite de API pública y política de estabilidad](./009-politica-api-publica-estabilidad.md) — **Accepted.**
10. [ADR 010: Versionado independiente, SemVer Stable y compatibilidad explícita](./010-versionado-semver-compatibilidad.md) — **Accepted.**
11. [ADR 011: Enum de strings normalizado y renderer select nativo](./011-enum-string-normalizado-select-nativo.md) — **Accepted; revision 1 superó las ocho áreas de revisión y promueve D-008.**
12. [ADR 012: Limpieza explícita de campos nativos](./012-limpieza-explicita-campos.md) — **Accepted, revision 1; promueve D-010/M7.**
13. [ADR 013: Preparación verificable de artefactos experimentales 0.1](./013-preparacion-artefactos-experimentales-0-1.md) — **Accepted revision 1; prepara candidatos locales M8 sin autorizar publicación.**
14. [ADR 014: Normalized nested-object model and deep controlled paths](./014-modelo-objetos-anidados-paths-profundos.md) — **Accepted revision 2; implemented by completed PLAN-009 after final zero-finding review.**
15. [ADR 015: Collection templates, stable item identity and controlled structural operations](./015-modelo-colecciones-identidad-operaciones.md) — **Accepted revision 4; implemented by completed PLAN-010 after final repeated review with zero findings.**
16. [ADR 016: Same-document static JSON Schema reference resolution](./016-resolucion-referencias-locales.md) — **Accepted; ADR-005 revision 3 and SPEC-004 v0.1.1 completed its normative follow-up gates after zero-finding reviews.**
17. [ADR 017: Static neutral presentation groups](./017-grupos-presentacion-estaticos.md) — **Accepted revision 0 after review 023 cycle 3 passed all eight areas with zero findings; SPEC preparation only is authorized.**
18. [ADR 018: Dual AGPL/commercial licensing and public experimental publication](./018-licencia-dual-publicacion-experimental.md) — **Accepted revision 6 coordinated with ADR-026; M21 remains exact and completed PLAN-024 closes the M22 repository slice after review 177 cycle 3.**
19. [ADR 019: Nullable primitive leaves and explicit null intention](./019-hojas-primitivas-nullable.md) — **Accepted revision 1 after review 033 cycle 2 preserved SPEC-003 collection diagnostics with zero findings; SPEC-006 v0.1.1 is now Accepted.**
20. [ADR 020: Private multi-framework reference platform](./020-plataforma-referencia-multiframework.md) — **Accepted revision 0 after review 054 cycle 3; separately approved PLAN-016 revision 0 completed the private catalog and first Angular 22 shell after final review 063 cycle 2 passed with zero findings.**
21. [ADR 021: Private Standard/DOM direct-core reference shell](./021-shell-standard-dom-core-directo.md) — **Accepted revision 1 after review 090 cycle 3 passed twelve areas with zero findings; it requires a reviewed PLAN-018 revision before checkpoint 5 resumes.**
22. [ADR 022: Reusable synchronous Ajv validator package](./022-validador-ajv-sincrono-reutilizable.md) — **Accepted revision 1 after review 083 cycle 2 passed ten areas with zero findings; completed PLAN-019 implements it privately.**
23. [ADR 023: Static neutral tabs, accordion and logical-grid containers](./023-contenedores-layout-neutral-estatico.md) — **Accepted revision 1 after review 099 cycle 3 passed ten areas with zero findings; review 100 and accepted ADR-024 completed its separate Angular-kit architecture gate.**
24. [ADR 024: Angular presentation-container SPI and Angular Aria pilot](./024-spi-contenedores-angular-y-piloto-angular-aria.md) — **Accepted revision 1 after review 101 cycle 4 passed eleven areas with zero findings; SPEC-008 remains authoritative and completed PLAN-020/review 113 delivered M18.**
25. [ADR 025: Recursive local presentation forests for nested objects and collection items](./025-bosques-presentacion-locales-objetos-items.md) — **Accepted revision 0 after review 134 cycle 4; accepted SPEC-009 v0.1.0 and completed PLAN-022 now implement the narrow M20 decision after final review 144 cycle 3.**
26. [ADR 026: Sanitized public history and secure release automation](./026-public-repository-and-secure-releases.md) — **Accepted revision 0; completed PLAN-024 passes its corrected final closure after review 177 cycle 3. Future package metadata/OIDC activation remains separately gated.**

## 4. ADRs específicos de Angular

1. [Angular ADR 001: Proveedores Funcionales y Registro Reactivo Zoneless](./angular/001-angular-proveedores-funcionales-signals.md) — **Requiere revisión**; contiene afirmaciones pre-SPEC sobre Signals, RxJS, Zone.js y zoneless.
2. `Angular ADR 002: Instanciación mediante ViewContainerRef` — **Placeholder histórico vacío**; sustituido por ADR-008.
