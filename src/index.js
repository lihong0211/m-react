import ReactDom from './react-dom';
import React from './react';
import { TestFunctionComp, TestClassComp, TestDomDiffComp } from './test-case';

ReactDom.render(<TestDomDiffComp />, document.getElementById('root'));
// console.log(<TestClassComp />);
