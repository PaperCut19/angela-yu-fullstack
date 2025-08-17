import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Note from "./Note";
import CreateArea from "./CreateArea";

function App() {
  const [listOfNotes, setListOfNotes] = useState([]);

  function addNote(noteObject) {
    setListOfNotes((previousValue) => {
      return [...previousValue, noteObject];
    });
  }

  function deleteNote(noteId) {
    setListOfNotes((previousValue) => {
      return previousValue.filter((note, index) => {
        return index != noteId;
      });
    });
  }

  return (
    <div>
      <Header />
      <CreateArea addNote={addNote} />
      {listOfNotes.map((note, index) => {
        return (
          <Note
            key={index}
            id={index}
            title={note.title}
            content={note.content}
            deleteNote={deleteNote}
          />
        );
      })}
      <Footer />
    </div>
  );
}

export default App;
