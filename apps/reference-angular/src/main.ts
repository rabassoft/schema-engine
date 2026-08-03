import {
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideSchemaEngineAngularNative,
  provideSchemaTextResolver,
} from '@rabassoft/schema-engine-angular';
import { AppComponent } from './app/app.component.js';
import { REFERENCE_SCHEMA_VALIDATOR } from './app/reference-validator.js';

const { createAjvSchemaValidator } =
  await import('@rabassoft/schema-engine-validator-ajv');

const config: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideSchemaEngineAngularNative(),
    provideSchemaTextResolver({
      resolve(text, context) {
        if (context.locale !== 'es') return text;
        return (
          (
            {
              'Missing value': 'Valor ausente',
              'Unavailable value': 'Valor no disponible',
              'Incompatible value': 'Valor incompatible',
              'Null value': 'Valor nulo',
              Clear: 'Limpiar',
              'No value provided.': 'No se ha proporcionado ningún valor.',
              'No values selected.': 'No hay valores seleccionados.',
            } as Readonly<Record<string, string>>
          )[text] ?? text
        );
      },
    }),
    {
      provide: REFERENCE_SCHEMA_VALIDATOR,
      useValue: createAjvSchemaValidator(),
    },
  ],
};

void bootstrapApplication(AppComponent, config);
