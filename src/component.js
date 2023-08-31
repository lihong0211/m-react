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

  launchUpdate(nextProp) {
    const { pendingStates, target } = this;
    if (!this.pendingStates && !nextProp) return;

    while (pendingStates.length) {
      target.state = {
        ...target.state,
        ...pendingStates.shift(),
      };
    }
    let shouldUpdate = true;
    if (nextProp) {
      this.target.props = nextProp;
    }
    if (
      target.shouldComponentUpdate &&
      !target.shouldComponentUpdate(nextProp, target.state)
    ) {
      shouldUpdate = false;
    }
    shouldUpdate && target.update();
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
    // this.update();
  }
  update() {
    const oldVNode = this.oldVNode;

    if (!!this.constructor.getDerivedStateFromProps) {
      this.state = {
        ...this.state,
        ...this.constructor.getDerivedStateFromProps(this.props),
      };
    }

    const newVNode = this.render();

    newVNode.dom = oldVNode.dom;
    const oldDOM = getDomByVNode(oldVNode);
    if (this.getSnapShotBeforeUpdate) {
    }

    updateDomToTree(oldVNode, newVNode, oldDOM);
    if (this.componentDidUpdate) {
      this.componentDidUpdate();
    }
    this.oldVNode = newVNode;
    // this.updater = new Updater(this);
  }
}
