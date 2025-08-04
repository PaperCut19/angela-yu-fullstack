import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "gyccof-rajwy0-pyccAx",
    port: 5432
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
    { id: 1, name: "Angela", color: "teal" },
    { id: 2, name: "Jack", color: "powderblue" }
];

//CRIS/ we use this function to get back the country codes of every country that a user visited
async function checkVisited() {
    const result = await db.query("SELECT country_code FROM visited_countries JOIN users ON user_id = users.id WHERE user_id = $1",
        [currentUserId]
    );

    // CRIS/ for every row, take the country_code value and add it to the countries array
    let countries = [];
    result.rows.forEach((country) => {
        countries.push(country.country_code)
    });

    return countries;
}

//CRIS/ this function gives the users array the current list of all users in the database and it also returns who the single current user is
async function getCurrentUser() {
    const result = await db.query("SELECT * FROM users");
    users = result.rows;

    return users.find((user) => user.id == currentUserId);
}

//CRIS/ GET home page
app.get("/", async (req, res) => {
    const countries = await checkVisited();
    const currentUser = await getCurrentUser();

    res.render("index1.ejs", {
        countries: countries,
        total: countries.length,
        users: users,
        color: currentUser.color
    });
});

//CRIS/ POST /user
app.post("/user", (req, res) => {

    if (req.body.add == "new") {
        res.render("new1.ejs");
    } else {
        currentUserId = parseInt(req.body.user);
        res.redirect("/");
    }
});

//CRIS/ POST /add
app.post("/add", async (req, res) => {
    const input = req.body.country; //CRIS/ get user input

    try {
        //CRIS/ use the user input to get the country code that matches it close enough
        const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%' ",
            [input.toLowerCase()]
        );
        if (!result.rows[0]) throw new Error("No matching country");
        const countryCode = result.rows[0].country_code;

        try {
            //CRIS/ add the country code and user id to the visited_countries table
            await db.query("INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
                [countryCode, currentUserId]
            );
            res.redirect("/");
        } catch (error) {
            console.log(error);
            const countries = await checkVisited();
            const currentUser = await getCurrentUser();
            res.render("index1.ejs", {
                countries: countries,
                total: countries.length,
                users: users,
                color: currentUser.color,
                error: "Try again"
            });
        }
    } catch (error) {
        console.log(error);
        const countries = await checkVisited();
        const currentUser = await getCurrentUser();
        res.render("index1.ejs", {
            countries: countries,
            total: countries.length,
            users: users,
            color: currentUser.color,
            error: "Try again"
        });
    }
});

//CRIS/ POST /new
app.post("/new", async (req, res) => {
    const name = req.body.name;
    const color = req.body.color;

    const result = await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *",
        [name, color]
    );

    const id = result.rows[0].id;
    currentUserId = id;

    res.redirect("/");
})

//CRIS/ POST /delete
app.post("/delete", async (req, res) => {
    const input = req.body.country;

    try {
        const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
            [input.toLowerCase()]
        );

        if (!result.rows.length) throw new Error("No matching country found");
        const countryCode = result.rows[0].country_code;

        try {
            await db.query("DELETE FROM visited_countries WHERE user_id = $1 AND country_code = $2",
                [currentUserId, countryCode]
            );

            res.redirect("/");
        } catch (error) {
            console.log(error);
            const countries = await checkVisited();
            const currentUser = await getCurrentUser();
            res.render("index1.ejs", {
                countries: countries,
                total: countries.length,
                users: users,
                color: currentUser.color,
                error: "Try again"
            });
        }
    } catch (error) {
        console.log(error);
        const countries = await checkVisited();
        const currentUser = await getCurrentUser();
        res.render("index1.ejs", {
            countries: countries,
            total: countries.length,
            users: users,
            color: currentUser.color,
            error: "Try again"
        });
    }
});

//CRIS/ POST /deleteAll
app.post("/deleteAll", async (req, res) => {
    await db.query("DELETE FROM visited_countries WHERE user_id = $1",
        [currentUserId]
    );

    res.redirect("/");
});

//CRIS/ POST /deleteMember
app.post("/deleteMember", async (req, res) => {
    const input = req.body.name;

    try {
        await db.query("DELETE FROM users WHERE LOWER(name) = $1",
            [input.toLowerCase()]
        );
        currentUserId = 1;
        res.redirect("/");
    } catch (error) {
        console.log(error);
        res.render("new1.ejs");
    };

});

//CRIS/ POST /cancel
app.post("/cancel", (req, res) => {
    res.redirect("/");
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});