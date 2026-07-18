import { beforeEach, describe, expect, it } from 'vitest';

import { StandardTabs } from '../src/tabs.js';

describe('StandardTabs', () => {
  beforeEach(() => document.body.replaceChildren());

  it('links tabs and panels with one focusable visible selection', () => {
    const list = document.createElement('div');
    const first = document.createElement('section');
    const second = document.createElement('section');
    const tabs = new StandardTabs(
      'sample',
      [
        { id: 'first', label: 'First', panel: first },
        { id: 'second', label: 'Second', panel: second },
      ],
      'first',
    );
    tabs.appendTo(list);
    document.body.append(list, first, second);

    const buttons = list.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(buttons[0]?.getAttribute('aria-selected')).toBe('true');
    expect(buttons[0]?.tabIndex).toBe(0);
    expect(first.hidden).toBe(false);
    expect(second.hidden).toBe(true);
    expect(buttons[1]?.getAttribute('aria-controls')).toBe(second.id);
    expect(second.getAttribute('aria-labelledby')).toBe(buttons[1]?.id);

    tabs.destroy();
  });

  it('supports wraparound arrows plus Home and End', () => {
    const list = document.createElement('div');
    const panels = [0, 1, 2].map(() => document.createElement('section'));
    const tabs = new StandardTabs(
      'keys',
      panels.map((panel, index) => ({
        id: String(index),
        label: String(index),
        panel,
      })),
    );
    tabs.appendTo(list);
    document.body.append(list, ...panels);
    const buttons = list.querySelectorAll<HTMLButtonElement>('[role="tab"]');

    buttons[0]?.dispatchEvent(keydown('ArrowLeft'));
    expect(tabs.getSelectedId()).toBe('2');
    expect(document.activeElement).toBe(buttons[2]);
    buttons[2]?.dispatchEvent(keydown('Home'));
    expect(tabs.getSelectedId()).toBe('0');
    buttons[0]?.dispatchEvent(keydown('End'));
    expect(tabs.getSelectedId()).toBe('2');
    buttons[2]?.dispatchEvent(keydown('ArrowRight'));
    expect(tabs.getSelectedId()).toBe('0');

    tabs.destroy();
  });

  it('stops changing selection after teardown', () => {
    const list = document.createElement('div');
    const tabs = new StandardTabs('cleanup', [
      { id: 'one', label: 'One', panel: document.createElement('div') },
      { id: 'two', label: 'Two', panel: document.createElement('div') },
    ]);
    tabs.appendTo(list);
    const second = list.querySelectorAll<HTMLButtonElement>('button')[1];
    tabs.destroy();
    second?.click();
    expect(tabs.getSelectedId()).toBe('one');
  });
});

function keydown(key: string): KeyboardEvent {
  return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
}
