# ADR 008: Instanciación inline de renderers Angular con ViewContainerRef

- **Estado:** Accepted
- **Fecha:** 13 de julio de 2026
- **Relacionado con:** [`ADR-007`](./007-resolucion-renderers-testers.md), [`D-027`](../roadmap/deferred-decisions.md), [`SPEC-001`](../specs/001-controlled-form-runtime.md)

## 1. Contexto

ADR-007 determina cómo seleccionar un renderer, pero no cómo insertar el
componente Angular elegido. Cada campo del walking skeleton se renderiza inline
dentro de la jerarquía visual del formulario y necesita bindings reactivos,
outputs de intenciones, injector correcto y destrucción determinista.

Angular ofrece tres alternativas relevantes: `NgComponentOutlet`,
`ViewContainerRef.createComponent()` y `createComponent()` standalone.

## 2. Decisión

### 2.1 API de instanciación

Cada field host Angular poseerá un anchor inline y su `ViewContainerRef`.
Después de resolver la registration de ADR-007, instanciará exactamente un
renderer mediante:

```ts
viewContainerRef.createComponent(rendererType, {
  environmentInjector,
  bindings: [
    inputBinding(/* estado derivado */),
    outputBinding(/* intención hacia el runtime */),
  ],
});
```

Esta API inserta automáticamente el host view en la jerarquía lógica y visual
del container. No se manipulará el DOM ni se usará `ApplicationRef.attachView()`
para fields inline.

### 2.2 Contrato del renderer

PLAN-004 fijará los nombres TypeScript exactos, pero todos los renderers nativos
y personalizados implementarán el mismo contrato Angular mínimo:

- Inputs reactivos para `FieldDefinition`, `FieldRuntimeSnapshot`, `formId` y
  `locale`.
- Outputs de intención para set value, remove value, focus y blur.
- Ningún renderer recibe JSON Schema crudo ni aplica operaciones por sí mismo.
- El host conecta outputs con los métodos públicos del runtime y conserva la
  propiedad controlada: una intención emitida no altera el snapshot hasta la
  confirmación externa.

Se usarán bindings de creación (`inputBinding`, `outputBinding`) en lugar de
asignar propiedades y suscribirse manualmente después de crear el componente.

### 2.3 Injector y lifecycle

- El `EnvironmentInjector` procederá del host del formulario y se pasará
  explícitamente a `createComponent()`.
- No se creará un injector hijo por field salvo que una futura necesidad real
  lo justifique.
- El `ComponentRef` pertenece al field host. Se destruye al destruir el host o
  antes de reemplazar el renderer.
- La selección de ADR-007 es estable para una `FormDefinition`; M4 no cambia de
  tipo de renderer por valor, validación, foco o locale.
- La recreación por cambio dinámico de definición permanece fuera de alcance
  conforme a D-013.

### 2.4 Errores

Un fallo de resolución impide instanciar el field y conserva los diagnósticos de
ADR-007. Una excepción durante creación o binding se aísla como
`RENDERER_INSTANTIATION_FAILED`, destruye cualquier `ComponentRef` parcial y no
impide que otros fields independientes se intenten crear.

Los errores esperables no se escribirán directamente en consola.

## 3. Alternativas consideradas

### NgComponentOutlet

Rechazado como mecanismo principal. Es apropiado para selección declarativa y
soporta inputs e injector, pero el field host necesita un `ComponentRef`
explícito, bindings de outputs en creación, control de errores por field y
lifecycle programático uniforme para custom renderers.

### createComponent() standalone

Rechazado para fields inline. No adjunta la vista a una ubicación existente y
obliga a gestionar host DOM, `ApplicationRef.attachView()`/`detachView()` y
destrucción manual. Se reserva para casos externos a la jerarquía, como overlays,
que no forman parte del walking skeleton.

### Switch estático en template

Rechazado porque acopla el host a todos los renderers conocidos y anula la
extensibilidad decidida en ADR-007.

## 4. Consecuencias

Positivas:

- El renderer participa normalmente en DI, change detection y lifecycle Angular.
- Inputs y outputs quedan conectados declarativamente en el momento de creación.
- No se añade gestión DOM manual ni se acopla el core a Angular.
- El host puede aislar errores y destruir refs de forma determinista.

Negativas:

- El adaptador depende de las APIs programáticas de bindings de Angular.
- Los custom renderers deben respetar un contrato común de inputs/outputs.
- La instanciación requiere una capa host programática, no solo template markup.

## 5. Fuera de alcance y revisión

Quedan fuera lazy loading, overlays, portals, content projection, host directives
configurables, SSR/hydration específicos y capabilities de framework. Revisar
cuando D-013 o D-026 se promuevan, aparezcan renderers lazy o un segundo
adaptador revele una abstracción compartida.

## 6. Referencias

- [Angular: Programmatically rendering components](https://angular.dev/guide/components/programmatic-rendering)
- [Angular API: ViewContainerRef](https://angular.dev/api/core/ViewContainerRef)
- [Angular API: NgComponentOutlet](https://angular.dev/api/common/NgComponentOutlet)
- [Angular API: createComponent](https://angular.dev/api/core/createComponent)
