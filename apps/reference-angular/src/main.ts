import {
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import { AppComponent } from './app/app.component.js';
import { REFERENCE_SCHEMA_VALIDATOR } from './app/reference-validator.js';

const { createAjvSchemaValidator } =
  await import('@rabassoft/schema-engine-validator-ajv');

const config: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideSchemaEngineAngularNative(),
    {
      provide: REFERENCE_SCHEMA_VALIDATOR,
      useValue: createAjvSchemaValidator(),
    },
  ],
};

void bootstrapApplication(AppComponent, config);
