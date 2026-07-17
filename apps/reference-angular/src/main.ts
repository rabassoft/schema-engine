import {
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideSchemaEngineAngularNative } from '@rabassoft/schema-engine-angular';
import { AppComponent } from './app/app.component.js';

const config: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideSchemaEngineAngularNative(),
  ],
};

void bootstrapApplication(AppComponent, config);
