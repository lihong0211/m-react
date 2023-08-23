import { REACT_ELEMENT, REACT_FORWARD_REF } from './utils';
import { addEvent } from './event';

function render(VNode, containerDOM) {
  // 虚拟DOM--> 真实DOM
  // 真实DOM挂载到containerDOM
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  // VNode 是一个数字
  if (typeof VNode === 'number') return document.createTextNode(VNode);

  // 1.创建元素。 2.处理子元素。3.处理元素属性 4.处理ref
  const { type, props, ref } = VNode;
  let dom;
  // 类组件
  if (
    typeof type === 'function' &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.is_class_component
  ) {
    return genDomByClassComp(VNode);
  }
  // 函数组件  React.createElement(TestFunctionComp, null)  type值就是函数本身
  if (typeof type === 'function' && VNode.$$typeof === REACT_ELEMENT) {
    return genDomByFunctionComp(VNode);
  }
  //
  if (type && type.$$typeof === REACT_FORWARD_REF) {
    return genDomByForwardFunction(VNode);
  }
  if (VNode.$$typeof === REACT_ELEMENT) {
    dom = document.createElement(type);
  }
  // 子元素
  if (props) {
    if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === 'object') {
      mount(props.children, dom);
    } else if (
      typeof props.children === 'string' ||
      typeof props.children === 'number'
    ) {
      dom.appendChild(document.createTextNode(props.children));
    }
  }
  // 处理ref
  ref && (ref.current = dom);

  setProps(dom, props);
  // 缓存dom到VNode上面 组件更新的时候用到
  VNode.dom = dom;

  return dom;
}

function mountArray(children, parent) {
  for (let i = 0; i < children.length; i++) {
    if (typeof children[i] === 'string') {
      parent.appendChild(document.createTextNode(children[i]));
    } else {
      mount(children[i], parent);
    }
  }
}

function setProps(dom, VNodeProps = {}) {
  // 事件,样式,其他
  for (const k in VNodeProps) {
    if (/^on[A-Z].*/.test(k)) {
      // TODO: 事件
      addEvent(dom, k.toLowerCase(), VNodeProps[k]);
    } else if (k === 'style') {
      Object.keys(VNodeProps[k]).forEach((styleItem) => {
        dom.style[styleItem] = VNodeProps[k][styleItem];
      });
    } else {
      // TODO: 设置报错
      // dom[k] = VNodeProps[k];
    }
  }
}

// 函数组件转为真实dom
function genDomByFunctionComp(VNode) {
  const { type, props } = VNode;
  const renderVNode = type(props);
  return createDOM(renderVNode);
}

// 类组件转为真实dom
function genDomByClassComp(VNode) {
  const { type, props, ref } = VNode;
  const instance = new type(props);
  const renderVNode = instance.render();
  // 类组件ref
  ref && (ref.current = instance);

  instance.oldVNode = renderVNode;
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

function genDomByForwardFunction(VNode) {
  const { type, props, ref } = VNode;
  const renderVNode = type.render(props, ref);
  if (!renderVNode) return null;
  return createDOM(renderVNode);
}

// 获取VNode上缓存的dom
export function getDomByVNode(VNode) {
  if (!VNode) return;
  if (VNode.dom) return VNode.dom;
}

export function updateDomToTree(oldDOM, newVNode) {
  const parentNode = oldDOM.parentNode;
  parentNode.removeChild(oldDOM);
  parentNode.appendChild(createDOM(newVNode));
}

const ReactDom = {
  render,
};

export default ReactDom;
