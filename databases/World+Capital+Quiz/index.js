import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({ //CRIS/ this is basically the configuration that our app will need when communicating with the server
  user: "postgres",
  host: "localhost", //CRIS/ where the database is running, in this case, it means our own computer
  database: "world",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432
});

db.connect(); //CRIS/ creates the connection to the database server

// let quiz = [
//   { country: "France", capital: "Paris" },
//   { country: "United Kingdom", capital: "London" },
//   { country: "United States of America", capital: "New York" },
// ];

let quiz = [];

db.query("SELECT * FROM capitals", (err, res) => { //CRIS/ we'll use SQL (structured data language) inside of the query method to get data from the database
  if (err) {
    console.log("Error executing query", err.stack);
  } else {
    quiz = res.rows;
  }

  db.end(); //CRIS/ after we're done getting the data, we'll disconnect from the database
});

let totalCorrect = 0;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentQuestion = {};

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0;
  await nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion }); //CRIS/ when the home page is requested, we'll send the index.js file with the current question
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim(); //CRIS/ user data, we use trim to remove the spaces before and after
  let isCorrect = false;
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) { //CRIS/ comparing the data to the answer
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion(); //CRIS/ creating the new question
  res.render("index.ejs", { //CRIS/ sending index.js file with the new question and updated score/counter
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });

  console.log(currentQuestion); //CRIS/ we'll console log the answer
});

async function nextQuestion() { //CRIS/ creating a function that can pick a random country
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];

  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
