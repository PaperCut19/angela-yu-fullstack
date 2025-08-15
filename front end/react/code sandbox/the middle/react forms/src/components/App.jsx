import React, { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [headingText, setHeadingText] = useState("");

  function inputHandler() {
    setName(event.target.value);
  }

  function submitHandler(event) {
    setHeadingText(name);
    setName("");

    event.preventDefault();
  }

  return (
    <div className="container">
      <h1>Hello {headingText}</h1>

      <form onSubmit={submitHandler}>
        <input
          type="text"
          placeholder="What's your name?"
          onChange={inputHandler}
          value={name}
        />
        <button>Submit</button>
      </form>
    </div>
  );
}

export default App;
