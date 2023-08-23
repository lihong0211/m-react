import ReactDom from './react-dom';
import React from './react';
import { TestFunctionComp, TestClassComp } from './test-case';

ReactDom.render(<TestFunctionComp />, document.getElementById('root'));
