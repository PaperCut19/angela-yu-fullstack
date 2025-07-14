import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import axios from "axios";

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

let currentUserId;

//CRIS/ return an array of strings containing book titles of the user
async function getUserBooks(user) {

    //CRIS/ get the id of the user by using the name
    let userId = await db.query("SELECT id FROM users WHERE name = $1",
        [user]
    );

    userId = userId.rows[0].id;

    currentUserId = userId;

    //CRIS/ get all the books that the user has read 
    const books = await db.query("SELECT * FROM user_books JOIN books ON user_books.book_id = books.id WHERE user_id = $1",
        [userId]
    );

    let bookTitles = [];

    books.rows.forEach((row) => {
        bookTitles.push(row.title);
    });

    //CRIS/ return an array with all the titles of the books
    return bookTitles;
}

//CRIS/ return the data of a book from the API provider using the book title
async function searchBookByTitle(title) {
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
        return response.data.docs[0];
    } catch (error) {
        console.error(error);
    }
}

//CRIS/ return the summary of a book using the book's data
async function getSummary(bookData) {
    const bookKey = bookData.key;

    try {
        let bookSummary = await axios.get(`https://openlibrary.org/${bookKey}.json`);
        bookSummary = bookSummary.data.description;
        return bookSummary;
    } catch (error) {
        console.log(error);
    }

}

async function getBookId(bookTitle) {
    let bookId = await db.query("SELECT * FROM books WHERE title = $1",
        [bookTitle]
    );

    bookId = bookId.rows[0].id;

    return bookId;
}

//CRIS/ for each book title, create a detailed object and add it to an array
async function createNewBooksArray(bookTitles) {
    let newBooksArray = [];

    // Use for...of to handle async operations properly
    for (const bookTitle of bookTitles) {
        const bookData = await searchBookByTitle(bookTitle);
        const summary = await getSummary(bookData);
        const bookId = await getBookId(bookTitle);

        // Create a book object containing the title, book cover, and summary
        const bookObject = {
            title: bookTitle,
            bookCover: `https://covers.openlibrary.org/b/id/${bookData.cover_i}-L.jpg`,
            summary: summary,
            id: bookId
        };

        newBooksArray.push(bookObject);
    }

    return newBooksArray;
}

//CRIS/ GET home page
app.get("/", (req, res) => {
    res.render("index.ejs", { message: "Hello World" });
});

//CRIS/ POST /user
app.post("/user", async (req, res) => {
    const user = req.body["user"];
    const bookTitles = await getUserBooks(user);
    const newBooksArray = await createNewBooksArray(bookTitles);


    res.render("userLibrary.ejs", { name: user, books: newBooksArray });
});

//CRIS/ POST /view
app.post("/view", async (req, res) => {
    const bookId = req.body["bookId"];

    let bookTitle = await db.query("SELECT * FROM books WHERE id = $1",
        [bookId]
    );

    bookTitle = bookTitle.rows[0].title;

    const bookTitlesArray = [bookTitle];

    let newBookObject = await createNewBooksArray(bookTitlesArray);

    newBookObject = newBookObject[0];

    const bookNotes = await db.query("SELECT * FROM user_book_notes WHERE book_id = $1",
        [bookId]
    );

    const user = await db.query("SELECT * FROM users WHERE id = $1",
        [currentUserId]
    );

    res.render("userBook.ejs", {
        book: newBookObject,
        bookNotes: bookNotes.rows,
        user: user.rows[0],
    });
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});