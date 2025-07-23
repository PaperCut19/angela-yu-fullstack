import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

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
      res.send("user already exists");
    } else {
      const insertAccountResult = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, passwordInput]
      );
      console.log(insertAccountResult);
      res.render("secrets.ejs");
    }
  } catch (error) {
    console.log(error);
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

    if (userResult.rows.length > 0) {
      if (passwordInput == password) {
        res.render("secrets.ejs");
      } else {
        res.send("incorrect password");
      }
    } else {
      res.send("user not found");
    }
  } catch (error) {
    console.log(error);
  }

});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
