import React from "react";
import ReactDOM from "react-dom";

const name = "Alyssa";
const luckyNumber = 19;

ReactDOM.render(
  <div>
    <h1>Hello {name}</h1>
    <p>Your lucky number is {luckyNumber}</p>
  </div>,
  document.getElementById("root")
);
