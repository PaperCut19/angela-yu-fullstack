import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "permalist",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

//CRIS/ GET home page
app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM items"); //CRIS/ get all rows from items table
  items = result.rows;

  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

//CRIS/ POST /add
app.post("/add", async (req, res) => {
  const input = req.body["newItem"]; //CRIS/ get the text input
  // items.push({ title: item });

  await db.query("INSERT INTO items (title) VALUES ($1)", //CRIS/ add the user input to the database
    [input]
  );

  res.redirect("/");
});

app.post("/edit", (req, res) => { });

//CRIS/ POST /delete
app.post("/delete", async (req, res) => {
  const input = req.body["deleteItemId"]; //CRIS/ get the id of the item that the user clicked the checkbox on

  await db.query("DELETE FROM items WHERE id = $1", //CRIS/ delete the item in the items database where the id matches the user input
    [parseInt(input)]
  );

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
