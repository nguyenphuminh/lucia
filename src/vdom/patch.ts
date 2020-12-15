import { LUCIA_COMPILE_REQUEST, UnknownKV } from '../models/generics';
import { Directives, State } from '../models/structs';
import { VNode, VNodeTypes } from '../models/vnode';

import { renderDirective } from './directive';
import { keyPattern } from './utils/patterns';

// Using patch requires a wrapper parent VNode

const patch = (
  rootVNode: VNode,
  state: State = {},
  directiveKV: Directives = {},
  keys?: string[]
): void => {
  let compileRequest = false;

  if (!rootVNode) return;
  if (!keys) keys = Object.keys(state);
  // Compile request is for sweeping initialization
  if (keys[0] === LUCIA_COMPILE_REQUEST) compileRequest = true;

  for (let node of rootVNode.children) {
    if (typeof node === 'string') continue;

    // Check if it is not a static VNode by type
    if (node.props.type > VNodeTypes.STATIC) {
      const { attributes, directives, ref, type } = node.props;
      let affectedDirectives: string[] = [];

      if (!compileRequest) {
        for (const name in directives as UnknownKV) {
          const value = directives[name];

          const needsInit = type === 1;
          // Iterate through affected keys and check if directive value has key
          const hasKey = keys.some((key) => keyPattern(key).test(value.toString()));
          // Iterate through state keys
          const hasKeyInFunction = Object.keys(state).some((key: string) => {
            // Check if function and function content, iterate through affected
            // keys and check if function content contains affected key
            const iterKeysInFunction = (keys as string[]).some((k) =>
              keyPattern(k).test((state[key] as Function).toString())
            );
            return typeof state[key] === 'function' && iterKeysInFunction;
          });

          // If affected, then push to render queue
          if (needsInit || hasKey || hasKeyInFunction) {
            affectedDirectives.push(name);
          }
        }
      }

      // Switch one time patch nodes to static (l-use and l-init unaffected)
      node.props.type = type === VNodeTypes.NEEDS_PATCH ? VNodeTypes.STATIC : type;

      // If compileRequest, then use keys of norm directives
      const directivesToRender: string[] = compileRequest
        ? Object.keys(directives)
        : affectedDirectives;

      directivesToRender.map((name) => {
        const value = directives[name];
        const el = (attributes.id ? document.getElementById(attributes.id) : ref) as HTMLElement;

        renderDirective({ el, name, value, state }, { ...directiveKV });
      });
    }

    if (node.children.length > 0) patch(node, state, directiveKV, keys);
  }
};

export default patch;
