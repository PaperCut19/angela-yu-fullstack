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

//CRIS/ using the user id, get all the books of the user
async function getUserBook() {
    const result = await db.query("SELECT * FROM user_book_notes JOIN books ON book_id = books.id WHERE user_id = $1",
        [currentUserId]
    );

    books = result.rows;
}
//CRIS/ using the name of the user, update the currentUserId variable
async function getCurrentUser(name) {
    const result = await db.query("SELECT id FROM users WHERE users.name = $1",
        [name]
    );

    currentUserId = result.rows[0].id;
}

//CRIS/ GET home page
app.get("/", (req, res) => {
    res.render("index.ejs", { message: "Hello World" });
});

//CRIS/ POST /user
app.post("/user", async (req, res) => {
    const user = req.body["user"];
    await getCurrentUser(user);
    await getUserBook();

    res.render("userLibrary.ejs", { name: user, books: books });
});

//CRIS/ POST /view
app.post("/view", async (req, res) => {
    const bookId = req.body["bookId"];

    const book = await db.query("SELECT * FROM books WHERE id = $1",
        [bookId]
    );

    const bookNotes = await db.query("SELECT * FROM user_book_notes WHERE book_id = $1",
        [bookId]
    );

    const user = await db.query("SELECT * FROM users WHERE id = $1",
        [currentUserId]
    );

    res.render("userBook.ejs", {
        book: book.rows[0],
        bookNotes: bookNotes.rows[0],
        user: user.rows[0]
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});