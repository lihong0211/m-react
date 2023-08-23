import { updateQueue, flushUpdateQueue } from './component';

export function addEvent(dom, eventName, cb) {
  dom.attach = dom.attach || {};
  dom.attach[eventName] = cb;
  if (document[eventName]) return;
  document[eventName] = dispatchEvent;
}

function dispatchEvent(nativeEvent) {
  updateQueue.isBatch = true;
  const syntheticEvent = createSyntheTicEvent(nativeEvent);
  let target = nativeEvent.target;
  while (target) {
    syntheticEvent.currentTarget = target;
    const eventName = `on${nativeEvent.type}`;
    const bindFunction = target.attach && target.attach[eventName];
    bindFunction && bindFunction(syntheticEvent);
    if (syntheticEvent.isPropagationStoped) {
      break;
    }
    target = target.parentNode;
  }
  flushUpdateQueue();
}

function createSyntheTicEvent(nativeEvent) {
  const nativeEventKeyValues = {};
  for (const k in nativeEvent) {
    nativeEventKeyValues[k] =
      typeof nativeEvent[k] === 'function'
        ? nativeEvent[k].bind(nativeEvent)
        : nativeEvent[k];
  }
  // 抹平浏览器差异
  const syntheticEvent = Object.assign(nativeEventKeyValues, {
    nativeEvent,
    isDefaultPrevented: false,
    isPropagationStoped: false,
    preventDefault: function () {
      this.isDefaultPrevented = true;
      if (nativeEvent.preventDefault) {
        nativeEvent.preventDefault();
      } else {
        nativeEvent.returnValue = false;
      }
    },
    stopPropagation: function () {
      this.isPropagationStoped = true;
      if (nativeEvent.stopPropagation) {
        nativeEvent.stopPropagation();
      } else {
        nativeEvent.cancelBubble = true;
      }
    },
  });
  return syntheticEvent;
}
