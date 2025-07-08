import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    res.render("index.ejs", { message: "Hello World" });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});