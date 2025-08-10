import React from "react";
import ReactDOM from "react-dom";

function Card(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <img src={props.img} alt="avatar_img" />
      <p>{props.tel}</p>
      <p>{props.email}</p>
    </div>
  );
}

ReactDOM.render(
  <div>
    <h1>My Contacts</h1>

    <Card
      name="Batman"
      img="https://variety.com/wp-content/uploads/2024/09/batman.png"
      tel="+123 456 789"
      email="supermanSucks@coolestDetective.com"
    />

    <Card
      name="Catwoman"
      img="https://cdnb.artstation.com/p/assets/images/images/046/694/279/large/jeeben-art-zoe-kravitz-as-catwoman-the-batman-2022-master-by-jeeben-art.jpg?1645723743"
      tel="+987 654 321"
      email="cats4Life@purrfectCrime.com"
    />

    <Card
      name="Alfred"
      img="https://images.comicbooktreasury.com/wp-content/uploads/2024/03/Alfred-Pennyworth-and-Bruce-Wayne-by-Gleb-Melnikov.jpg"
      tel="+918 372 574"
      email="butlerOfTheYear@wayneEnterprise.com"
    />
  </div>,
  document.getElementById("root")
);
