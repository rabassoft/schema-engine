# @rabassoft/schema-engine-validator-ajv

Private experimental workspace package providing a synchronous JSON Schema
Draft 2020-12 implementation of Schema Engine's replaceable `SchemaValidator`
port. It is not currently published.

```ts
import { createAjvSchemaValidator } from '@rabassoft/schema-engine-validator-ajv';

const validator = createAjvSchemaValidator();
```

The integration collects all errors, does not mutate validated data, ignores
format assertions, performs no remote loading and normalizes Ajv errors to the
framework-neutral Schema Engine issue contract.
