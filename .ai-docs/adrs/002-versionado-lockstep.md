# ADR 002: Estrategia de Versionado Sincronizado (Lockstep) y Compatibilidad

**1. Título:** Adopción de Lockstep Versioning para paquetes dependientes de framework.
**2. Fecha:** 12 de Julio de 2026.
**3. Contexto:** Los consumidores necesitan garantías estrictas de compatibilidad al instalar adaptadores específicos del framework (`@rabassoft/schema-engine-angular`) para evitar errores `ERESOLVE` en NPM y fallos de *build*.

**4. Decisión:** * **Núcleo Agnóstico (`@rabassoft/schema-engine-core`):** Usará Versionado Semántico (SemVer) independiente.
* **Paquetes Puente/UI (`@rabassoft/schema-engine-angular`, `@rabassoft/dynamic-forms-ui`):** Alinearán su versión Mayor con la del framework objetivo (ej. v18.x.x para Angular 18).
* Se utilizarán `peerDependencies` estrictas. Las actualizaciones sin cambios de código se automatizarán en el CI/CD.

**5. Alternativas Consideradas:**
* Mantener un único SemVer global y rangos laxos de dependencias. Descartada porque impide adoptar características modernas del framework sin romper clientes legacy.

**6. Consecuencias:**
* *Positivas:* Experiencia de instalación impecable. Permite a la librería estar siempre a la vanguardia tecnológica.
* *Negativas:* Mayor complejidad en la automatización del CI/CD para las publicaciones.