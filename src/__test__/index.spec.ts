import { init } from '../index';
import { getElementCustomProp } from '../core/utils/elementCustomProp';

// @ts-ignore
window.callback = jest.fn();

describe('.index', () => {
  it('should create component scope and attach __l prop', async () => {
    const root = document.createElement('div');
    const el = document.createElement('div');

    el.setAttribute('l-state', `{ foo: 'bar' }`);
    root.appendChild(el);

    expect(getElementCustomProp(el, '__l')).toBeUndefined();

    init(root);

    expect(getElementCustomProp(el, '__l')).toBeDefined();
  });

  it('should create component with empty state', async () => {
    const root = document.createElement('div');
    const el = document.createElement('div');

    el.setAttribute('l-state', '');
    root.appendChild(el);

    init(root);

    const $render = () => {};

    expect(JSON.stringify(getElementCustomProp(el, '__l').state)).toEqual(
      JSON.stringify({
        $render: $render.bind([]),
      })
    );
  });

  it('should throw error on init', () => {
    // @ts-ignore
    window.originalConsole = console;
    window.console = { warn: jest.fn() } as any;

    const root = document.createElement('div');
    const el = document.createElement('div');

    el.setAttribute('l-state', '{ shouldThrowAnError }');
    root.appendChild(el);
    init(root);

    expect(console.warn).toBeCalled();

    // @ts-ignore
    window.console = window.originalConsole;
  });

  it('should run l-init directive when component is mounted', () => {
    const root = document.createElement('div');
    const el = document.createElement('div');

    el.setAttribute('l-state', `{ foo: 'bar' }`);
    el.setAttribute('l-init', 'window.callback()');
    root.appendChild(el);
    init(root);

    // @ts-ignore
    expect(callback).toBeCalled();
  });
});
