import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 3000;
const saltRounds = 10;

//CRIS database setup
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//CRIS/ creating the session storage configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 60 * 60
  }
}));

//CRIS/ starting up passport node package and connecting it to storage configuration
app.use(passport.initialize());
app.use(passport.session());

//CRIS/ GET home page
app.get("/", (req, res) => {
  res.render("home.ejs");
});

//CRIS/ GET /login
app.get("/login", (req, res) => {
  res.render("login.ejs");
});

//CRIS/ GET /register
app.get("/register", (req, res) => {
  res.render("register.ejs");
});

//CRIS/ GET /logout
app.get("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

//CRIS/ GET /secrets
app.get("/secrets", async (req, res) => {

  //CRIS/ if the user is logged in, do the code below
  if (req.isAuthenticated()) {
    console.log(req.user);

    try {
      //CRIS/ get the database row that matches the user's email
      const result = await db.query("SELECT secret FROM users WHERE email = $1", [req.user.email]);
      const secret = result.rows[0].secret;

      //CRIS/ if the user has a secret, then send it to ejs file, if not, then send a specific message
      if (secret) {
        res.render("secrets.ejs", { secret: secret });
      } else {
        res.render("secrets.ejs", { secret: "No secret submitted yet" });
      }
    } catch (error) {
      console.log(error);
    }

    //CRIS/ if the user is not authenticated, send them to login page
  } else {
    res.redirect("/login");
  }
});

//CRIS/ GET /auth/google
//CRIS/ when user gets sent here, we'll activate the google authentication strategy
app.get("/auth/google", passport.authenticate("google", {
  //CRIS/ we want to tell the user that what we want from them is their google profile and email
  scope: ["profile", "email"],
  prompt: "select_account"
}));

//CRIS/ GET /auth/google/secrets
app.get("/auth/google/secrets", passport.authenticate("google", {
  //CRIS/ if the user successfully authenticated with google, send them to /secrets, if not, send them to /login
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

//CRIS/ GET /submit
app.get("/submit", (req, res) => {
  //CRIS/ if the user is logged in, send them submit ejs file, if not, send them to /login
  if (req.isAuthenticated()) {
    res.render("submit.ejs");
  } else {
    res.redirect("/login");
  }
});

//CRIS/ POST /submit
app.post("/submit", async (req, res) => {
  //CRIS/ store the user's text input in variable called secret
  const secret = req.body.secret;
  console.log(req.user);

  try {
    //CRIS/ in the database, update the user's secret with what they just submitted
    await db.query("UPDATE users SET secret = $1 WHERE email = $2",
      [secret, req.user.email]
    );

    //CRIS/ send the user to /secrets
    res.redirect("/secrets");
  } catch (error) {
    console.log(error);
  }
});

//CRIS/ POST /register
app.post("/register", async (req, res) => {
  //CRIS/ record the user's email input and password input
  const email = req.body["username"];
  const passwordInput = req.body["password"];

  try {
    //CRIS/ check to see if the user exists
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1",
      [email]
    );

    //CRIS/ if they do exist, tell them the email already exists
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in");

      //CRIS/ if the user is new, then do the code below
    } else {
      //CRIS/ hash their password input
      bcrypt.hash(passwordInput, saltRounds, async (error, hash) => {
        if (error) {
          console.error("error hashing password:", error);
        } else {
          console.log("hashed password:", hash);
          //CRIS/ send the new user's email and hashed password to the database
          const result = await db.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );

          //CRIS/ send the user object to the session storage so that they're logged in
          const user = result.rows[0];
          req.login(user, (error) => {
            console.log(error);
            //CRIS/ send the user to /secrets
            res.redirect("/secrets");
          });
        }
      });
    }
  } catch (error) {

  }
});

//CRIS/ POST /login
//CRIS/ use google authentication strategy for user to login
app.post("/login", passport.authenticate("local", {
  //CRIS/ if they successfully logged in with google, send them to /secrets, if not, send them to /login
  successRedirect: "/secrets",
  failureRedirect: "/login"
}));

//CRIS/ set up a local authentication strategy with passport middleware
//CRIS/ we are creating a new Strategy object and passing in a function which will create the configuration and will get stored as a property
passport.use("local", new Strategy(async function verify(username, password, callback) {

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

//CRIS/ creates the google authentication strategy
passport.use("google", new GoogleStrategy({
  //CRIS/ this object is the configuration
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
}, async (accessToken, refreshToken, profile, callback) => {
  //CRIS/ this group of code is the callback for what happens after the user successfully logs in with google
  console.log(profile);

  try {
    //CRIS/ get the database row that matches the user's email
    const result = await db.query("SELECT * FROM users WHERE email = $1",
      [profile.email]
    );

    //CRIS/ if there was no row that matches, then the user is new, so we add the new user to the database
    if (result.rows.length === 0) {
      const newUser = await db.query("INSERT INTO users (email, password) VALUES ($1, $2)",
        [profile.email, "google"]
      );

      //CRIS/ after we add the user, we send them to the passport package which will send the user object to the session storage so that they can be logged in
      callback(null, newUser.rows[0]);
    } else {
      //CRIS/ if the user exists in the database, send them to passport package which sends the user object to session storage which is what logs them in
      callback(null, result.rows[0]);
    }
  } catch (error) {
    callback(error);
  }
}
));

//CRIS/ this is how we store the user data in session storage when they log in
passport.serializeUser((user, callback) => {
  callback(null, user);
});

//CRIS/ this is how our server will take out the user data from the session storage to check it and to hand off the user object to req.user
passport.deserializeUser((user, callback) => {
  callback(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
