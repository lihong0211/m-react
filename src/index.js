import ReactDom from './react-dom';
import React from './react';
import {
  TestFunctionComp,
  TestClassComp,
  TestDomDiffComp,
  TestMemo,
} from './test-case';

ReactDom.render(<TestMemo />, document.getElementById('root'));
// console.log(<TestClassComp />);
