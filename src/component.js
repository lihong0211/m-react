import { getDomByVNode, updateDomToTree } from './react-dom';

// TODO: wtf
export const updateQueue = {
  isBatch: false,
  updaters: new Set(),
};

export function flushUpdateQueue() {
  updateQueue.isBatch = false;
  updateQueue.updaters.forEach((updater) => {
    updater.launchUpdate();
  });
  updateQueue.updaters.clear();
}

// Component
class Updater {
  constructor(target) {
    this.target = target;
    this.pendingStates = [];
  }
  addState(partialState) {
    this.pendingStates.push(partialState);
    this.preHandleUpdate();
  }
  preHandleUpdate() {
    if (updateQueue.isBatch) {
      // TODO:
      updateQueue.updaters.add(this);
    } else {
      this.launchUpdate();
    }
  }

  launchUpdate() {
    while (this.pendingStates.length) {
      this.target.state = {
        ...this.target.state,
        ...this.pendingStates.shift(),
      };
    }
    this.target.update();
  }
}

export class Component {
  static IS_CLASS_COMPONENT = true;

  constructor(props) {
    this.props = props;
    this.state = {};
    this.updater = new Updater(this);
  }

  setState(partialState) {
    // 合并属性
    this.updater.addState(partialState);
    this.update();
  }
  update() {
    const oldVNode = this.oldVNode;
    const newVNode = this.render();
    const DOM = getDomByVNode(oldVNode);
    updateDomToTree(oldVNode, newVNode, DOM);
    this.oldVNode = newVNode;
  }
}
