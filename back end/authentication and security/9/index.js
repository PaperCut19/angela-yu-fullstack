import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

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

//CRIS/ creating the session storage configuration
app.use(session({
  secret: "TOPSECRETWORD",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60
  }
}));

//CRIS/ starting up passport node package and connecting it to storage configuration
app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.get("/secrets", (req, res) => {
  console.log(req.user);
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});

app.post("/register", async (req, res) => {
  const email = req.body["username"];
  const passwordInput = req.body["password"];

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in");
    } else {
      bcrypt.hash(passwordInput, saltRounds, async (error, hash) => {
        if (error) {
          console.error("error hashing password:", error);
        } else {
          console.log("hashed password:", hash);
          const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (error) => {
            console.log(error);
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (error) {

  }
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

//CRIS/ set up what authentication strategy passport middleware will use
//CRIS/ we are creating a new Strategy object and passing in a function which will get stored as a property
passport.use(new Strategy(async function verify(username, password, callback) {

  try {
    //CRIS/ get access to all the database rows that match the username input
    const userResult = await db.query("SELECT * FROM users WHERE email = $1",
      [username]
    );

    //CRIS/ if there was a database row that matches username input, do code below
    if (userResult.rows.length > 0) {
      //CRIS/ get access to the database hash password for that user
      const user = userResult.rows[0];
      const passwordDatabase = user.password;

      //CRIS/ turn password input to hash and compare it to database hash
      bcrypt.compare(password, passwordDatabase, (error, result) => {
        //CRIS/ if there's a deep error in the comparison, send the error to passport package
        if (error) {
          return callback(error);
        } else {
          //CRIS/ if the passwords match, send null which means no deep error and send the user's info to passport package
          if (result) {
            return callback(null, user)

            //CRIS/ if the passwords don't match, send null which means no deep error and send false which means the user is not authenticated
          } else {
            return callback(null, false)
          }
        }
      });

      //CRIS/ if no user was found in database, send a specific error message to passport package
    } else {
      return callback("User not found");
    }

    //CRIS/ if there's a deep error, send it to passport package
  } catch (error) {
    return callback(error)
  }

}));

//CRIS/ this is how we store the user data in session storage when they log in
passport.serializeUser((user, callback) => {
  callback(null, user);
});

//CRIS/ this is how our server will take out the user data from the session storage to check it
passport.deserializeUser((user, callback) => {
  callback(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
