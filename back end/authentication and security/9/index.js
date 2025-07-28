import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds = 10;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432
})
db.connect();

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
  const email = req.body["username"];
  const passwordInput = req.body["password"];

  try {
    const accountResult = await db.query("SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (accountResult.rows.length > 0) {
      res.send(`
        <h1>Email already exists</h1>
        <a href="/">Go Home</a>`);
    } else {
      const hashPasswordInput = await bcrypt.hash(passwordInput, saltRounds);

      const insertAccountResult = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hashPasswordInput]
      );
      console.log(insertAccountResult);
      res.render("secrets.ejs");
    }
  } catch (error) {
    console.log(error);
    res.send(`
      <h1>an error happened</h1>
      <a href="/">go home</a>`);
  }
});

app.post("/login", async (req, res) => {
  const email = req.body["username"];
  const passwordInput = req.body["password"];

  try {
    const userResult = await db.query("SELECT * FROM users WHERE email = $1",
      [email]
    );

    const user = userResult.rows[0];
    const password = user.password;
    const passwordComparison = await bcrypt.compare(passwordInput, password);

    if (userResult.rows.length > 0) {
      if (passwordComparison) {
        console.log(password);
        res.render("secrets.ejs");
      } else {
        res.send(`
          <h1>incorrect password</h1>
          <a href="/">Go home</a>`);
      }
    } else {
      res.send(`
        <h1>user not found</h1>
        <a href="/">Go home</a>`);
    }
  } catch (error) {
    console.log(error);
    res.send(`
      <h1>an error happened</h1>
      <a href="/">go home</a>`);
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
