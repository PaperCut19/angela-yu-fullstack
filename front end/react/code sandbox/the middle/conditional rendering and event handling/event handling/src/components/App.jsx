import React, { useState } from "react";

function App() {
  const [headingText, setHeadingText] = useState("Yo");
  const [isMousedOver, setMouseOver] = useState(false);

  function submitClick() {
    setHeadingText("You Submitted Dawg");
  }

  function handleMouseOver() {
    setMouseOver(true);
  }

  function handleMouseOut() {
    setMouseOver(false);
  }

  return (
    <div className="container">
      <h1>{headingText}</h1>
      <input type="text" placeholder="What's your name?" />
      <button
        onClick={submitClick}
        style={{ backgroundColor: isMousedOver ? "black" : "white" }}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
      >
        Submit
      </button>
    </div>
  );
}

export default App;
