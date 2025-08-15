//Create a react app from scratch.
//It should display 2 paragraph HTML elements.
//The paragraphs should say:
//Created by YOURNAME.
//Copyright CURRENTYEAR.
//E.g.
//Created by Angela Yu.
//Copyright 2019.

import React from "react";
import ReactDOM from "react-dom";

const date = new Date();
const year = date.getFullYear();
const dayName = date.toLocaleString("en-US", { weekday: "long" });
const time = date.toLocaleTimeString("en-US", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

ReactDOM.render(
  <div>
    <h1>
      It is {dayName} {time}
    </h1>
    <p>Created By Cristian</p>
    <p>Copyright {year}</p>
  </div>,
  document.getElementById("root")
);
