import { DirectiveProps, DirectiveData, State } from '../../models/structs';

import { getElementCustomProp, setElementCustomProp } from '../utils/elementCustomProp';

export const inputCallback = (
  el: HTMLInputElement,
  hydratedValue: unknown,
  data: DirectiveData,
  state: State
) => {
  if (el.type === 'checkbox') {
    el.value = String(el.checked);
  }

  const isNumber = typeof hydratedValue === 'number' && !isNaN(el.value as any);
  const isBoolean =
    typeof hydratedValue === 'boolean' && (el.value === 'true' || el.value === 'false');
  const isNullish =
    (hydratedValue === null || hydratedValue === undefined) &&
    (el.value === 'null' || el.value === 'undefined');

  // Perform type coercion
  let payload;
  if (isNumber) {
    payload = parseFloat(el.value);
  } else if (isBoolean) {
    payload = el.value === 'true';
  } else if (isNullish) {
    if (el.value === 'null') payload = null;
    else payload = undefined;
  } else {
    payload = String(el.value);
  }

  state[data.value] = payload;

  return payload;
};

export const modelDirective = ({ el: awaitingTypecastEl, name, data, state }: DirectiveProps) => {
  const el = awaitingTypecastEl as HTMLInputElement;
  const hydratedValue = state[data.value];
  const accessor = el.type === 'checkbox' ? 'checked' : 'value';
  if (el[accessor] !== String(hydratedValue)) {
    el[accessor] = hydratedValue as never;
  }

  if (!getElementCustomProp(el, '__l_model_registered')) {
    const prop = name.split('.')[1];
    const callback = () => inputCallback(el, hydratedValue, data, state);

    el.addEventListener(prop === 'debounce' ? 'change' : 'input', callback);

    setElementCustomProp(el, '__l_model_registered', true);
  }
};
