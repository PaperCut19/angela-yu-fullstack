import React, { useState } from "react";

function App() {
  const [textInput, setTextInput] = useState("");
  const [list, setList] = useState([]);

  function inputHandler(event) {
    const inputValue = event.target.value;

    setTextInput(inputValue);
  }

  function buttonHandler() {
    setList((previousValue) => {
      return [...previousValue, textInput];
    });

    setTextInput("");
  }

  return (
    <div className="container">
      <div className="heading">
        <h1>To-Do List</h1>
      </div>
      <div className="form">
        <input value={textInput} onChange={inputHandler} type="text" />
        <button onClick={buttonHandler}>
          <span>Add</span>
        </button>
      </div>
      <div>
        <ul>
          {list.map((listItem) => {
            return <li>{listItem}</li>;
          })}
        </ul>
      </div>
    </div>
  );
}

export default App;
