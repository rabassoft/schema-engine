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
        if ('wizard' in context) {
          if (context.member === 'position')
            return `Paso ${context.position} de ${context.count}`;
          return (
            (
              {
                'Team onboarding': 'Incorporación del equipo',
                Identity: 'Identidad',
                Team: 'Equipo',
                Review: 'Revisión',
                Previous: 'Anterior',
                Next: 'Siguiente',
                Complete: 'Completar',
                'Not visited': 'No visitado',
                Visited: 'Visitado',
                'Contains errors': 'Contiene errores',
                Completed: 'Completado',
                'Additional validation not yet available':
                  'Validación adicional aún no disponible',
                'Additional validation in progress':
                  'Validación adicional en curso',
                'Additional validation failed': 'Falló la validación adicional',
              } as Readonly<Record<string, string>>
            )[text] ?? text
          );
        }
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
