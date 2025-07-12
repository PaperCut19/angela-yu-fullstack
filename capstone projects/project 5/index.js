import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "capstone 5",
    password: "gyccof-rajwy0-pyccAx",
    port: 5432
});
db.connect();

app.use('/bootstrap', express.static(
    decodeURIComponent(new URL('./node_modules/bootstrap/dist', import.meta.url).pathname)
));
app.use(express.urlencoded({ extended: true }));

let books = [
    { title: 'Pride and Prejudice', summary: 'Good book', book_cover: 'https://covers.openlibrary.org/b/olid/OL50998784M-L.jpg' },
    { title: 'Pride and Prejudice', summary: 'Good book', book_cover: 'https://covers.openlibrary.org/b/olid/OL50998784M-L.jpg' }
];

let currentUserId = 1;

async function getUserBook() {
    const result = await db.query("SELECT books.title, books.summary, books.book_cover FROM user_book_notes JOIN books ON book_id = books.id WHERE user_id = $1",
        [currentUserId]
    );

    books = result.rows;
}

app.get("/", (req, res) => {
    res.render("index.ejs", { message: "Hello World" });
});

app.post("/user", async (req, res) => {
    const user = req.body["user"];
    await getUserBook();

    res.render("userLibrary.ejs", { name: user, books: books });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});