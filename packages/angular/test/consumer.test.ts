import {
  Component,
  ViewChild,
  computed,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  applyFormOperation,
  compileFormDefinition,
  type FormOperation,
  type SchemaValidator,
} from '@rabassoft/schema-engine';
import {
  SchemaFieldOutletDirective,
  SchemaFormDirective,
  provideSchemaEngineAngularNative,
  type AngularControlledFormConfig,
} from '@rabassoft/schema-engine-angular';
import { beforeEach, describe, expect, it } from 'vitest';

interface ConsumerValue {
  readonly name?: string;
  readonly amount?: number;
  readonly age?: number;
  readonly active?: boolean;
}

const schema = Object.freeze({
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  type: 'object',
  properties: Object.freeze({
    name: Object.freeze({ type: 'string', title: 'Name' }),
    amount: Object.freeze({ type: 'number', title: 'Amount' }),
    age: Object.freeze({ type: 'integer', title: 'Age' }),
    active: Object.freeze({ type: 'boolean', title: 'Active' }),
  }),
  required: Object.freeze(['name']),
});
const compilation = compileFormDefinition({ schema });
if (!compilation.success)
  throw new Error('The consumer schema must compile successfully.');
const definition = compilation.definition;
const initialValue: Readonly<ConsumerValue> = Object.freeze({
  name: 'Ada',
  amount: 12.5,
  age: 36,
  active: false,
});
const validator: SchemaValidator = Object.freeze({
  validate: () => ({ valid: true, issues: [] }),
});

@Component({
  standalone: true,
  imports: [SchemaFormDirective, SchemaFieldOutletDirective],
  template: `
    <form [schemaForm]="config()" (schemaOperation)="apply($event)">
      @for (field of definition.fields; track field.key) {
        <ng-container [schemaFieldOutlet]="field" />
      }
    </form>
  `,
})
class ConsumerHost {
  readonly definition = definition;
  readonly value = signal<Readonly<ConsumerValue>>(initialValue);
  readonly operations: FormOperation[] = [];
  readonly config = computed<AngularControlledFormConfig<ConsumerValue>>(
    () => ({
      formId: 'g0-consumer',
      definition,
      schema,
      value: this.value(),
      baselineValue: initialValue,
      locale: 'en',
      validator,
    }),
  );
  @ViewChild(SchemaFormDirective)
  form?: SchemaFormDirective<ConsumerValue>;

  apply(operation: FormOperation): void {
    this.operations.push(operation);
    const result = applyFormOperation(definition, this.value(), operation);
    if (!result.success)
      throw new Error('The consumer must apply emitted operations.');
    this.value.set(result.value);
  }
}

describe('minimal built-package Angular consumer', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders every root primitive kind and confirms a controlled operation', () => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideSchemaEngineAngularNative(),
      ],
    });
    const fixture = TestBed.createComponent(ConsumerHost);
    fixture.detectChanges();
    TestBed.tick();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelectorAll('input[type="text"]')).toHaveLength(3);
    expect(root.querySelectorAll('input[type="checkbox"]')).toHaveLength(1);
    expect(fixture.componentInstance.form?.snapshot()?.value).toEqual(
      initialValue,
    );

    const nameInput = root.querySelector(
      '#se-g0-consumer-name',
    ) as HTMLInputElement;
    nameInput.value = 'Grace';
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));

    expect(fixture.componentInstance.operations).toMatchObject([
      { type: 'set-value', path: ['name'], value: 'Grace' },
    ]);
    expect(fixture.componentInstance.value()).toEqual({
      ...initialValue,
      name: 'Grace',
    });

    fixture.detectChanges();
    TestBed.tick();
    expect(fixture.componentInstance.form?.snapshot()?.value).toEqual({
      ...initialValue,
      name: 'Grace',
    });
    expect(nameInput.value).toBe('Grace');
  });
});
