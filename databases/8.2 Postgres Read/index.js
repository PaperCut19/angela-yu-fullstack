import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

let quiz = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost", //CRIS/ where the database is running, in this case, it means our own computer
  database: "world",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432
});

db.connect();

db.query("SELECT * FROM flags", (err, res) => { //CRIS/ we'll use SQL (structured data language) inside of the query method to get data from the database
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
app.get("/", (req, res) => {
  totalCorrect = 0;
  nextQuestion();
  console.log(currentQuestion);
  res.render("index.ejs", { question: currentQuestion });
});

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim();
  let isCorrect = false;
  if (currentQuestion.name.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++;
    console.log(totalCorrect);
    isCorrect = true;
  }

  nextQuestion();
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  });

  console.log(currentQuestion); //CRIS/ we'll console log the answer
});

function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)];
  currentQuestion = randomCountry;
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
