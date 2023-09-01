const old = [
  { key: 'A', index: 0 },
  { key: 'B', index: 1 },
  { key: 'C', index: 2 },
  { key: 'D', index: 3 },
  { key: 'E', index: 4 },
];
const newChildren = [
  { key: 'C' },
  { key: 'B' },
  { key: 'F' },
  { key: 'E' },
  { key: 'A' },
];

const Container = ['A', 'B', 'C', 'D', 'E'];

function updateChildren(oldChildren, newChildren, Container) {
  let lastNotChangedIndex = -1;
  const hashMap = {};

  oldChildren.forEach((item) => {
    hashMap[item.key] = item;
  });

  const actions = [];

  newChildren.forEach((newVNode, index) => {
    newVNode.index = index;
    if (newVNode.key in hashMap) {
      const oldVNode = hashMap[newVNode.key];
      if (oldVNode.index < lastNotChangedIndex) {
        actions.push({
          type: 'move',
          oldVNode,
          newVNode,
          index,
        });
      }
      delete hashMap[newVNode.key];
      lastNotChangedIndex = Math.max(oldVNode.index, index);
    } else {
      actions.push({ type: 'add', newVNode, index });
    }
  });

  const VNodesToMove = actions
    .filter((action) => action.type === 'move')
    .map((action) => action.oldVNode);
  const VNodesToDelete = Object.values(hashMap);

  VNodesToMove.concat(VNodesToDelete).forEach((oldVNode) => {
    Container = Container.filter((item) => item !== oldVNode.key);
  });
  const fackVNodeDomMap = [...Container];
  console.log(hashMap);
  console.log(Container);
  console.log(actions);
  // ['C', 'E']
  // ['B', 'F', 'A']
  // --> ['C', 'B', 'E'] --> ['C', 'B', 'E', 'F'] --> ['C', 'B', 'E', 'F', 'A']
  actions.forEach((action) => {
    const { index, newVNode } = action;
    const item = Container[index];
    if (item) {
      Container.splice(index, 0, newVNode.key);
    } else {
      Container.push(newVNode.key);
    }
    console.log(Container);
  });
  return Container;
}

updateChildren(old, newChildren, Container);
