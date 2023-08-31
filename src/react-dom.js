import {
  REACT_ELEMENT,
  REACT_FORWARD_REF,
  REACT_TEXT,
  CREATE,
  MOVE,
} from './constants';
import { addEvent } from './event';

function render(VNode, containerDOM) {
  mount(VNode, containerDOM);
}

function mount(VNode, containerDOM) {
  // 虚拟DOM--> 真实DOM
  // 真实DOM挂载到containerDOM
  const newDOM = createDOM(VNode);
  newDOM && containerDOM.appendChild(newDOM);
}

function createDOM(VNode) {
  // 1.创建元素。 2.处理子元素。3.处理元素属性 4.处理ref
  if (!VNode) return document.createComment(VNode);
  const { type, props, ref } = VNode;
  let dom;
  // 类组件
  if (
    typeof type === 'function' &&
    VNode.$$typeof === REACT_ELEMENT &&
    type.IS_CLASS_COMPONENT
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
  if (VNode.type === REACT_TEXT) {
    dom = document.createTextNode(props.text);
  }
  // 子元素
  if (props) {
    if (Array.isArray(props.children)) {
      mountArray(props.children, dom);
    } else if (typeof props.children === 'object') {
      mount(props.children, dom);
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
    children[i].index = i; // diff有用
    mount(children[i], parent);
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
      dom[k] = VNodeProps[k];
    }
  }
}

// 函数组件转为真实dom
function genDomByFunctionComp(VNode) {
  const { type, props } = VNode;
  const renderVNode = type(props);
  VNode.oldRenderVNode = renderVNode;
  return createDOM(renderVNode);
}

// 类组件转为真实dom
function genDomByClassComp(VNode) {
  const { type, props, ref } = VNode;
  const instance = new type(props);
  VNode.classInstance = instance;
  const renderVNode = instance.render();
  // 类组件ref
  ref && (ref.current = instance);

  instance.oldVNode = renderVNode;
  if (!renderVNode) return null;
  // 这里只是dom合renderVNode的关系
  const dom = createDOM(renderVNode);
  if (instance.componentDidMount) {
    instance.componentDidMount();
  }
  // {showComponent && <ComponentA>}  这里需要设置原始VNode和dom的关系
  VNode.dom = dom;
  return dom;
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

export function updateDomToTree(oldVNode, newVNode, oldDOM) {
  const parentNode = oldDOM.parentNode;
  // 简单暴力
  // parentNode.removeChild(oldDOM);
  // parentNode.appendChild(createDOM(newVNode));

  const updateTypeMap = {
    NOOP: !oldVNode && !newVNode,
    ADD: !oldVNode && newVNode,
    DEL: oldVNode && !newVNode,
    REPLACE: oldVNode && newVNode && oldVNode.type !== newVNode.type,
  };
  const UPDATE_TYPE = Object.keys(updateTypeMap).filter(
    (key) => updateTypeMap[key]
  )[0];
  switch (UPDATE_TYPE) {
    case 'NOOP':
      break;
    case 'ADD':
      parentNode.appendChild(createDOM(newVNode));
      break;
    case 'DEL':
      removeVNode(oldVNode);
      break;
    case 'REPLACE':
      removeVNode(oldVNode);
      parentNode.appendChild(createDOM(newVNode));
      break;
    default:
      deepDOMDiff(oldVNode, newVNode);
      break;
  }
}

function removeVNode(VNode) {
  const dom = getDomByVNode(VNode);
  dom && dom.remove();
}

function deepDOMDiff(oldVNode, newVNode) {
  const diffTypeMap = {
    ORIGIN: typeof oldVNode.type === 'string',
    CLASS_COMPONENT:
      typeof oldVNode.type === 'function' && oldVNode.type.IS_CLASS_COMPONENT,
    FUNCTION_COMPONENT: typeof oldVNode.type === 'function',
    TEXT: oldVNode.type === REACT_TEXT,
  };
  const DIFF_TYPE = Object.keys(diffTypeMap).filter(
    (key) => diffTypeMap[key]
  )[0];
  switch (DIFF_TYPE) {
    case 'ORIGIN':
      const dom = (newVNode.dom = getDomByVNode(oldVNode));
      setProps(dom, newVNode.props);
      updateChildren(dom, oldVNode.props.children, newVNode.props.children);
      break;
    case 'CLASS_COMPONENT':
      updateClassComponent(oldVNode, newVNode);
      break;
    case 'FUNCTION_COMPONENT':
      updateFunctionComponent(oldVNode, newVNode);
      break;
    case 'TEXT':
      newVNode.dom = getDomByVNode(oldVNode);
      newVNode.dom.textContent = newVNode.props.text;
      break;
    default:
      break;
  }
}

function updateChildren(parentDOM, oldVNodeChildren, newVNodeChildren) {
  oldVNodeChildren = Array.isArray(oldVNodeChildren)
    ? oldVNodeChildren
    : [oldVNodeChildren];
  newVNodeChildren = Array.isArray(newVNodeChildren)
    ? newVNodeChildren
    : [newVNodeChildren];

  let lastNotChangedIndex = -1;
  const oldKeyChildMap = {};

  oldVNodeChildren.forEach((oldVNode, index) => {
    const oldKey = oldVNode?.key || index;
    oldKeyChildMap[oldKey] = oldVNode;
  });

  const actions = [];
  newVNodeChildren.forEach((newVNode, index) => {
    !!newVNode && (newVNode.index = index);
    const newKey = newVNode?.key || index;
    const oldVNode = oldKeyChildMap[newKey];
    if (oldVNode) {
      deepDOMDiff(oldVNode, newVNode);
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: MOVE,
          oldVNode,
          newVNode,
          index,
        });
      }
      // 需要移动的子节点在map中删掉，map中最后剩下的是在newVNodechildren中不存在的，需要删除
      delete oldKeyChildMap[newKey];
      lastNotChangedIndex = Math.max(lastNotChangedIndex, oldVNode.index);
    } else {
      actions.push({ type: CREATE, newVNode, index });
    }
  });

  const VNodesToMove = actions
    .filter((action) => action.type === MOVE)
    .map((action) => action.oldVNode);
  const VNodesToDelete = Object.values(oldKeyChildMap);
  // 在parentNode中将需要移动和删除的子节点都删掉
  VNodesToMove.concat(VNodesToDelete).forEach((oldVNode) => {
    const oldDOM = getDomByVNode(oldVNode);
    oldDOM && oldDOM.remove();
    // 如果是组件卸载
    if (!!oldVNode?.classInstance) {
      oldVNode.classInstance?.componentWillUnmount();
    }
  });

  actions.forEach((actions) => {
    const { type, oldVNode, newVNode, index } = actions;
    // 删除后剩下的子节点
    const childNodes = parentDOM.childNodes;
    // ?
    const childNode = childNodes[index];
    const insertDom =
      type === CREATE ? createDOM(newVNode) : getDomByVNode(oldVNode);
    if (childNode) {
      parentDOM.insertBefore(insertDom, childNode);
    } else {
      parentDOM.insertBefore(insertDom, null);
    }
  });
}

function updateClassComponent(oldVNode, newVNode) {
  const classInstance = (newVNode.classInstance = oldVNode.classInstance);
  // 更新的时候需要用最新的props
  classInstance.props = newVNode.props;
  newVNode.dom = oldVNode.dom;

  classInstance.updater.launchUpdate(newVNode.props);
}

function updateFunctionComponent(oldVNode, newVNode) {
  const oldDOM = getDomByVNode(oldVNode);
  const { type, props } = newVNode;
  const newRenderVNode = type(props);
  updateDomToTree(oldVNode.oldRenderVNode, newRenderVNode, oldDOM);
  newVNode.oldRenderVNode = newRenderVNode;
}

const ReactDom = {
  render,
};

export default ReactDom;
