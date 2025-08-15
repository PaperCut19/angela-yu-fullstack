//Create a React app from scratch.
//Show a single h1 that says "Good morning" if between midnight and 12PM.
//or "Good Afternoon" if between 12PM and 6PM.
//or "Good evening" if between 6PM and midnight.
//Apply the "heading" style in the styles.css
//Dynamically change the color of the h1 using inline css styles.
//Morning = red, Afternoon = green, Night = blue.

import React from "react";
import ReactDOM from "react-dom";

let message = "test";

const date = new Date();
const hour = date.getHours();
console.log(hour);

let customStyle = {
  color: "black",
};

if (hour < 12) {
  message = "Good morning";
  customStyle.color = "red";
} else if (hour < 18) {
  message = "Good afternoon";
  customStyle.color = "green";
} else {
  message = "Good evening";
  customStyle.color = "blue";
}

ReactDOM.render(
  <div>
    <h1 className="heading" style={customStyle}>
      {message}
    </h1>
  </div>,
  document.getElementById("root")
);

console.log("YOOOO");
