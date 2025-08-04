import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

//CRIS/ copying a postgres object, modifying it with the configuration information that it needs
//CRIS/ this postgres object is what we'll use to communicate with the database
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "gyccof-rajwy0-pyccAx",
  port: 5432,
});

db.connect(); //CRIS/ connecting to database

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//CRIS/ function that looks at visited_countries table and returns that data when called
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries"); //CRIS/ accessing the country_code column from the visited_countries table
  let countries = [];
  result.rows.forEach((country) => { //CRIS/ for each item in the array, take the country_code property value of the object and put it in the countries array we created
    countries.push(country.country_code);
  });

  console.log(result.rows);

  return countries;
}

//CRIS/ GET Home page
app.get("/", async (req, res) => {
  //Write your code here.
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length }); //CRIS/ display the index.ejs file and send it two values, the countries array and the length of the countries array
});

//CRIS/ INSERT new country
app.post("/add", async (req, res) => {
  const input = req.body["country"]; //CRIS/ user answer

  try {
    const result = await db.query( //CRIS/ find the row where the user's answer matches and return the country code that's inside that row
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [input.toLowerCase()]);

    const data = result.rows[0]; //CRIS/ result.rows[0] is where we can get access to the object that will have the country code
    const countryCode = data.country_code;

    try { //CRIS/ if there was a match, then do the code below
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [ //CRIS/ insert the country code into the visited_countries table
        countryCode,
      ]);
      res.redirect("/");
    } catch (error) { //CRIS/ if the country code was already added, send back the index.ejs file with an error
      console.log(error);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Country has already been added, try again.",
      });
    }
  } catch (error) { //CRIS/ if no country name was found in the database, then send back index.ejs with an error
    console.log(error);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

//CRIS/ DELETE country
app.post("/delete", async (req, res) => {

  const input = req.body["country"]; //CRIS/ user answer

  try {
    //CRIS/ using SELECT FROM WHERE LIKE to see if the user entered anything that is close enough to a country name in the database
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
      [input.toLowerCase()]
    );

    //CRIS/ these two lines of code will be to get access to the country code using the object that was returned to the result variable
    const data = result.rows[0];
    const country_code = data.country_code;

    try {
      await db.query("DELETE FROM visited_countries WHERE country_code = $1", //CRIS/ in the visited_countries database, delete the row that matches the country code
        [country_code]
      );
      res.redirect("/");
    } catch (error) {
      console.log(error);
      const countries = await checkVisisted();
      res.render("index.ejs", {
        countries: countries,
        total: countries.length,
        error: "Try again.",
      });
    }
  } catch (error) {
    console.log(error);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Try again.",
    });
  }

})

//CRIS/ DELETE ALL
app.post("/deleteAll", async (req, res) => {

  try {
    await db.query("DELETE FROM visited_countries");
    res.redirect("/");
  } catch (error) {
    console.log(error);
    const countries = checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Try again"
    });
  }

});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
