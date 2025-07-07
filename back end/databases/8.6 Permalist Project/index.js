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

app.post("/add", (req, res) => {
  const item = req.body.newItem;
  items.push({ title: item });
  res.redirect("/");
});

app.post("/edit", (req, res) => { });

app.post("/delete", (req, res) => { });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
