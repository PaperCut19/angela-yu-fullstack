import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use('/bootstrap', express.static(
    decodeURIComponent(new URL('./node_modules/bootstrap/dist', import.meta.url).pathname)
));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.render("index.ejs", { message: "Hello World" });
});

app.post("/user", (req, res) => {
    const user = req.body["user"];

    res.render("userLibrary.ejs", { name: user });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});