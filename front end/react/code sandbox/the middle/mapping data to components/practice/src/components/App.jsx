import React from "react";
import Entry from "./Entry";
import emojipedia from "../emojipedia";

function createTerm(emojiItem) {
  return (
    <Entry
      key={emojiItem.id}
      emoji={emojiItem.emoji}
      name={emojiItem.name}
      meaning={emojiItem.meaning}
    />
  );
}

function App() {
  return (
    <div>
      <h1>
        <span>emojipedia</span>
      </h1>

      <dl className="dictionary">{emojipedia.map(createTerm)}</dl>
    </div>
  );
}

export default App;
