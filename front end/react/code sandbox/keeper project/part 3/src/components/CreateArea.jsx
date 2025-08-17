import React, { useState } from "react";

function CreateArea(props) {
  const [inputTextObject, setInputTextObject] = useState({
    title: "",
    content: "",
  });

  function handleChange(event) {
    const { value, name } = event.target;

    setInputTextObject((previousValue) => {
      return {
        ...previousValue,
        [name]: value,
      };
    });
  }

  function handleSubmit(event) {
    props.addNote(inputTextObject);
    setInputTextObject({
      title: "",
      content: "",
    });

    event.preventDefault();
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={inputTextObject.title}
          onChange={handleChange}
        />
        <textarea
          name="content"
          placeholder="Take a note..."
          rows="3"
          value={inputTextObject.content}
          onChange={handleChange}
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}

export default CreateArea;
