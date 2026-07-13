# ADR 001: Proveedores Funcionales y Registro Reactivo Zoneless

**1. Título:** Configuración funcional y reactividad interna con Signals para el puente de Angular.
**2. Fecha:** 12 de Julio de 2026.
**3. Contexto:** La librería `@rabassoft/schema-engine-angular` actúa como puente entre el Core agnóstico en Vanilla TS y el ecosistema Angular. Para garantizar el máximo rendimiento y la adopción en aplicaciones corporativas modernas, este puente debe integrarse favoreciendo arquitecturas *Zoneless* y un *tree-shaking* agresivo.

**4. Decisión:** * La configuración del puente en la aplicación consumidora se expondrá exclusivamente mediante funciones (ej. `provideSchemaEngine(withMaterialAdapters())`).
* La traducción del estado de la "Capa 0" a la vista de Angular se realizará mapeando los valores a **Signals**, prescindiendo de RxJS para el flujo de datos síncrono y eliminando la necesidad de que `Zone.js` intercepte la renderización de la UI.

**5. Alternativas Consideradas:**
* Uso de `NgModules` estáticos (`SchemaEngineModule.forRoot()`) y RxJS (`BehaviorSubjects`) para el estado local. Descartado por ser un enfoque obsoleto en el framework que arrastra Zone.js y penaliza el rendimiento en formularios extensos.

**6. Consecuencias:**
* *Positivas:* Rendimiento sobresaliente de renderizado en árboles complejos. *Bundle* mínimo para el consumidor.
* *Negativas:* Requiere que los consumidores utilicen versiones recientes del framework Angular (16+) que soporten la API de Signals.