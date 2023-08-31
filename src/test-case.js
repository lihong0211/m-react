import React from './react';

const TestForwardRefComp = React.forWardRef((props, ref) => {
  return (
    <div>
      <input ref={ref}></input>
    </div>
  );
});

export const TestFunctionComp = function () {
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

export class TestClassComp extends React.Component {
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
class Children extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.props.data,
    };
  }
  componentWillUnmount() {
    console.log('children unMount');
  }
  render() {
    return (
      <div>
        {this.props.data.map((item) => {
          return <div key={item}>{item}</div>;
        })}
      </div>
    );
  }
}

class TestGetDerivedStateFromProps extends React.Component {
  constructor(props) {
    super(props);
    this.state = { like: '动物' };
  }
  static getDerivedStateFromProps(props, state) {
    return { like: props.like };
  }
  render() {
    return <h1>我更喜欢的是 {this.state.like}</h1>;
  }
}

class TestGetSnapshotBeforeUpdate extends React.Component {
  constructor(props) {
    super(props);
    this.state = { sex: '男人' };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({ sex: '女人' });
    }, 1000);
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    document.getElementById('div1').innerHTML =
      '变性前的性别：' + prevState.sex;
  }
  componentDidUpdate() {
    document.getElementById('div2').innerHTML =
      '变性后的性别：' + this.state.sex;
  }
  render() {
    return (
      <div>
        <h1>我的性别是： {this.state.sex}</h1>
        <div id="div1" className="test"></div>
        <div id="div2"></div>
      </div>
    );
  }
}

export class TestDomDiffComp extends React.Component {
  reset = true;
  oldArr = ['A', 'B', 'C', 'D', 'E'];
  newArr = ['C', 'B', 'E', 'F', 'A'];
  constructor(props) {
    super(props);
    this.state = {
      arr: this.oldArr,
      showChildren: true,
      like: '女人',
    };
  }

  componentDidMount() {
    console.log('mounted', this);
  }

  componentDidUpdate() {
    console.log('updated');
  }

  shouldComponentUpdate(nextProp, nextState) {
    console.log(nextProp, nextState);
    return true;
  }

  trigger() {
    this.reset = !this.reset;
    this.setState({
      arr: this.reset ? this.oldArr : this.newArr,
    });
  }

  triggerShowChildren() {
    this.setState({
      showChildren: !this.state.showChildren,
    });
  }

  handleChangeLike() {
    this.setState({ like: this.state.like === '女人' ? '男人' : '女人' });
  }

  render() {
    const { arr } = this.state;
    return (
      <div>
        <button onClick={this.trigger.bind(this)} className="test">
          change arr
        </button>
        <button onClick={this.triggerShowChildren.bind(this)}>
          triggerShowChildren
        </button>
        {this.state.showChildren && <Children data={arr}></Children>}
        <button onClick={this.handleChangeLike.bind(this)}>change props</button>
        <TestGetDerivedStateFromProps like={this.state.like} />
        <TestGetSnapshotBeforeUpdate />
      </div>
    );
  }
}
