import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createLocalId,
  getOrCreateSessionId,
  getSavedLanguage,
} from '../src/lib/session';

test('restricted storage keeps one visitor session and browser language still works', () => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'window');
  Object.defineProperty(globalThis, 'window', {
    configurable: true,
    value: {
      get localStorage() {
        throw new Error('Private browsing');
      },
      navigator: { language: 'ru-RU' },
    },
  });
  try {
    assert.equal(getOrCreateSessionId(), getOrCreateSessionId());
    assert.equal(getSavedLanguage(), 'ru');
    assert.equal(getSavedLanguage('ja'), 'ja');
    assert.ok(createLocalId('discovery').startsWith('discovery-'));
    assert.notEqual(createLocalId('discovery'), createLocalId('discovery'));
  } finally {
    if (previous) Object.defineProperty(globalThis, 'window', previous);
    else delete (globalThis as { window?: unknown }).window;
  }
});
