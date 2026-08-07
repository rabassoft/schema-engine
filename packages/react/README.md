# @rabassoft/schema-engine-react

Private implementation workspace for the Public + Experimental + Active
client-rendered React adapter contract defined by ADR-038 and SPEC-021. It
supports the aligned client-only React/React DOM range `>=19.2.0 <20.0.0`; SSR, hydration,
React Server Components and React Native are not supported.

PLAN-037 checkpoints 2–7 implement the controlled `useSchemaForm` bridge, its
opaque handle/action contracts, the exact renderer registry, committed
`SchemaForm` boundary, six Internal native primitive renderers, normalized
compound projection, stable collection ownership, discriminated branches,
conditions, fixed presentation hosts, neutral validation/scope/baseline
actions and the controlled wizard. The independent React reference shell now
exercises that surface across the complete neutral scenario catalog. Package,
packed/source reconstruction and isolated lower/current consumers pass under
PLAN-037 checkpoint 8.
The package remains `private: true` at `0.0.0`; it is not available from npm
and must not be published. Its packed local `workspace:*` rewrite is test
evidence only: no compatible public core range or React package version has
been selected.

Use only the package root. Deep imports are unsupported.

## Controlled client example

The application owns the immutable value and confirms every emitted operation:

```tsx
import {
  applyFormOperation,
  compileFormDefinition,
} from '@rabassoft/schema-engine';
import {
  SchemaForm,
  createReactNativeRendererRegistry,
  useSchemaForm,
} from '@rabassoft/schema-engine-react';
import { useState } from 'react';

const compiled = compileFormDefinition({ schema });
if (!compiled.success) throw new Error('Invalid definition');
const registry = createReactNativeRendererRegistry();
if (!registry.success) throw new Error('Invalid registry');

export function ProfileEditor() {
  const [value, setValue] = useState(initialValue);
  const form = useSchemaForm({
    formId: 'profile',
    definition: compiled.definition,
    schema,
    value,
    baselineValue: initialValue,
    locale: 'en',
    validator,
    onOperation: (operation) => {
      const applied = applyFormOperation(compiled.definition, value, operation);
      if (applied.success) setValue(applied.value);
    },
    onWizardIntention: decideWizardIntention,
  });

  return <SchemaForm form={form} rendererRegistry={registry.registry} />;
}
```

Run the independent maintained shell with `pnpm reference:react:dev`. Package,
packed/source and exact lower/current consumer checks are repository-only until
a separate release decision selects compatible public package versions.
