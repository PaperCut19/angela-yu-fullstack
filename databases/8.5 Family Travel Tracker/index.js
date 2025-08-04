import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({ //CRIS/ database object we use for configuration
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1; //CRIS/ the tracker variable we'll use to keep track of which user is currently selected

let users = [ //CRIS/ an array we'll use to pass the starting data, it includes a name, id, and color
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

//CRIS/ we use this function to get back the country codes of every country that a user visited
async function checkVisisted() {

  //CRIS/ every time there's a row in visited_countries that matches the user id, a new row is created with the country code and the user id
  const result = await db.query(
    "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1; ",
    [currentUserId]
  );
  //CRIS/ for every single row, we select only the country code and then add it to the countries array
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

//CRIS/ this function gives the users array the current list of all users in the database and it also returns who the single current user is
async function getCurrentUser() {
  const result = await db.query("SELECT * FROM users");
  users = result.rows;
  return users.find((user) => user.id == currentUserId); //CRIS/ for every user, check if the id matches the variable currentUserId
}

//CRIS/ GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisisted(); //CRIS/ get the list of the country codes that the current user visited
  const currentUser = await getCurrentUser(); //CRIS/ gives the users array the current list of all users and their country codes
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});

//CRIS/ POST /add
app.post("/add", async (req, res) => {
  const input = req.body["country"]; //CRIS/ we'll get the text input from the user
  const currentUser = await getCurrentUser(); //CRIS/ gives the users array the current list of all users and their country codes

  try {
    const result = await db.query(
      //CRIS/ return the row that contains the country code that can match close enough the input from the user
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    //CRIS/ these two lines will search the row from the result variable to find the country code
    const data = result.rows[0];
    const countryCode = data.country_code;

    try {
      await db.query(
        //CRIS/ to the visited_countries table, add the data of the user id and the country code of the country that the user chose
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

//CRIS/ POST /user
app.post("/user", async (req, res) => {

  //CRIS/ if the user clicked the Add Family Member button, then send the new.ejs file
  if (req.body.add === "new") {
    res.render("new.ejs");
  } else {
    //CRIS/ if the user did not click on the Add Family Member button, then we'll make the currentUser variable equal to the name of the button that was clicked like "Angela"
    currentUserId = req.body.user;
    res.redirect("/");
  }
});

//CRIS/ POST /new
app.post("/new", async (req, res) => {
  const name = req.body.name; //CRIS/ we'll get the name that the user typed
  const color = req.body.color; //CRIS/ we'll get the color that the user picked

  const result = await db.query(
    //CRIS/ to the users table, add the name and color that the user chose
    "INSERT INTO users (name, color) VALUES($1, $2) RETURNING *;", //CRIS/ we use the keyword RETURNING to also return the current row that we just created and added to the table
    [name, color]
  );

  const id = result.rows[0].id; //CRIS/ from the result variable, we'll look for the user id
  currentUserId = id; //CRIS/ we'll make the currentUserId variable equal to the current user id

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
