import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const username = req.body["username"];
  const password = req.body["password"];

  console.log(username);
  console.log(password);
});

app.post("/login", async (req, res) => {
  const username = req.body["username"];
  const password = req.body["password"];

  console.log(username);
  console.log(password);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
