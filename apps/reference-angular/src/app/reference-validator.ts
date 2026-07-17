import { InjectionToken } from '@angular/core';
import type { SchemaValidator } from '@rabassoft/schema-engine';

export const REFERENCE_SCHEMA_VALIDATOR = new InjectionToken<SchemaValidator>(
  'REFERENCE_SCHEMA_VALIDATOR',
);
