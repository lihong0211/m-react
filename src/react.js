import { REACT_ELEMENT, REACT_FORWARD_REF, REACT_MEMO } from './constants';
import { toVNode, shallowEqual } from './utils';
import { Component } from './component';

function createElement(type, properties, children) {
  // TODO: <></> Fragement
  const { key = null, ref = null } = properties;
  ['ref', 'key', '__self', '__source'].forEach((item) => {
    // key ref 是框架需要，props是dom属性相关， 所以分开处理
    delete properties[item];
  });
  const props = { ...properties };
  // children 为多个的时候处理下
  if (arguments.length > 3) {
    // 可能会是[VNode, [VNode, VNode, VNode, VNode]]，所以需要flat
    props.children = Array.prototype.slice
      .call(arguments, 2)
      .flat(Infinity)
      .map(toVNode)
      .filter((child) => !!child);
  } else {
    props.children = toVNode(children);
  }
  return {
    $$typeof: REACT_ELEMENT,
    key,
    props,
    ref,
    type,
    _owner: null,
    _store: {
      validated: false,
    },
  };
}

class pureComponent extends Component {
  shouldComponentUpdate(nextProp, nextState) {
    return !(
      shallowEqual(nextProp, this.props) && shallowEqual(nextState, this.state)
    );
  }
}

function createRef() {
  return { current: null };
}

function forWardRef(render) {
  return {
    $$typeof: REACT_FORWARD_REF,
    render,
  };
}

function memo(type, compare) {
  return {
    $$typeof: REACT_MEMO,
    type,
    compare,
  };
}

const React = {
  createElement,
  Component,
  pureComponent,
  memo,
  createRef,
  forWardRef,
};

export default React;
