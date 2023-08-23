import ReactDom from './react-dom';
import React from './react';

const TestForwardRefComp = React.forWardRef((props, ref) => {
  return (
    <div>
      <input ref={ref}></input>
    </div>
  );
});

const TestFunctionComp = function () {
  const inputRef = React.createRef();
  const handleRefEvent = () => {
    inputRef.current.focus();
  };
  return (
    <div>
      hello <span style={{ color: 'blue' }}>my</span>
      <span
        style={{
          fontWeight: 600,
          display: 'inline-block',
          marginLeft: '10px',
          color: 'red',
        }}
      >
        react--function-component
      </span>
      <button
        style={{
          width: '160px',
          height: '30px',
          display: 'block',
          margin: '10px 0',
        }}
        onClick={handleRefEvent}
      >
        聚焦输入框
      </button>
      <TestForwardRefComp ref={inputRef} />
    </div>
  );
};

class TestClassComp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      xxx: 999,
    };
    this.inputRef = React.createRef();
  }

  focusInput() {
    console.log(this);
    this.inputRef.current.focus();
  }

  render() {
    return (
      <div>
        hello <span style={{ color: 'blue' }}>my</span>
        <span
          style={{
            fontWeight: 600,
            display: 'inline-block',
            marginLeft: '10px',
            color: 'red',
          }}
        >
          react--class-component
        </span>
        {/* {this.props.props1}
        {this.props.props2}
        {this.state.xxx} */}
        <button
          style={{
            width: '160px',
            height: '30px',
            display: 'block',
            margin: '10px 0',
          }}
          onClick={() => this.setState({ xxx: this.state.xxx + 1 })}
        >
          点击触发事件--{this.state.xxx}
        </button>
        <button
          style={{
            width: '160px',
            height: '30px',
            display: 'block',
            margin: '10px 0',
          }}
          onClick={this.focusInput.bind(this)}
        >
          聚焦输入框
        </button>
        <input ref={this.inputRef}></input>
      </div>
    );
  }
}
ReactDom.render(
  <TestFunctionComp props1="props1" props2="props2" />,
  document.getElementById('root')
);

console.log(<TestFunctionComp props1="props1" />);
