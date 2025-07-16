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
app.use(bodyParser.urlencoded({ extended: true }));

let currentUserId;
let currentUserName;
let currentBooksArray = [];

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
            title: bookData.title,
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
    res.render("index.ejs");
});

//CRIS GET /userLibrary
app.get("/userLibrary", async (req, res) => {
    //CRIS/ using the name of the user, get a string array with all the titles of the books they read
    const bookTitles = await getUserBooks(currentUserName);
    //CRIS/ for every book title string, create a book object that has a summary, book cover, id, and title, and then store all of this in an array
    const newBooksArray = await createNewBooksArray(bookTitles);
    currentBooksArray = newBooksArray;


    res.render("userLibrary.ejs", { name: currentUserName, books: currentBooksArray });
});

//CRIS/ POST /user
app.post("/user", async (req, res) => {
    const user = req.body["user"];
    currentUserName = user;

    res.redirect("/userLibrary");
});

//CRIS/ POST /view
app.post("/view", async (req, res) => {
    const bookId = req.body["viewButtonBookId"];

    //CRIS/ using the book id, find the book title
    let bookTitle = await db.query("SELECT * FROM books WHERE id = $1",
        [bookId]
    );
    bookTitle = bookTitle.rows[0].title;

    //CRIS/ the function we need to use only accepts arrays, so we'll store our one book title in an array
    const bookTitlesArray = [bookTitle];

    //CRIS/ using the book title, create a new book object
    let newBookObject = await createNewBooksArray(bookTitlesArray);
    newBookObject = newBookObject[0];

    //CRIS/ using the book id, find all the notes
    let bookNotes = await db.query("SELECT * FROM user_book_notes WHERE book_id = $1 AND user_id = $2",
        [bookId, currentUserId]
    );
    bookNotes = bookNotes.rows;

    res.render("userBook.ejs", {
        book: newBookObject,
        bookNotes: bookNotes,
        user: currentUserName,
    });
});

// CRIS/ POST /addNewBook
app.post("/addNewBook", async (req, res) => {
    const title = req.body["bookTitle"];

    try {
        let bookId = await db.query("INSERT INTO books (title) VALUES ($1) RETURNING id",
            [title]
        );

        bookId = bookId.rows[0].id;


    } catch (error) {
        console.log(error);
    }

    try {
        let bookId = await db.query("SELECT * FROM books WHERE title = $1",
            [title]
        );
        bookId = bookId.rows[0].id;

        await db.query("INSERT INTO user_books (user_id, book_id) VALUES ($1, $2)",
            [currentUserId, bookId]
        );
        res.redirect("/userLibrary");
    } catch (error) {
        console.log(error);
    }

    // try {
    //     const booksArray = [title];
    //     const newBooksArray = await createNewBooksArray(booksArray);
    //     const newBookObject = newBooksArray[0];
    //     currentBooksArray.push(newBookObject);
    //     res.render("userLibrary.ejs", {
    //         name: currentUserName,
    //         books: currentBooksArray
    //     });
    // } catch (error) {
    //     console.log(error);
    // }
});

//CRIS POST /deleteBook
app.post("/deleteBook", async (req, res) => {
    const bookId = req.body["deleteButtonBookId"];

    await db.query("DELETE FROM user_books WHERE book_id = $1",
        [bookId]
    );

    const bookTitles = await getUserBooks(currentUserName);
    const newBooksArray = await createNewBooksArray(bookTitles);
    currentBooksArray = newBooksArray;


    res.render("userLibrary.ejs", { name: currentUserName, books: newBooksArray });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});