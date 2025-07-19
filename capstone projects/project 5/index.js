import express from "express";
import bodyParser from "body-parser";
import { getUserBooks, createNewBooksArray, createNewBookObject, createBookReview } from "./functions.js";
import { appState, db } from "./sharedData.js";

const app = express();
const port = 3000;

app.use('/bootstrap', express.static(
    decodeURIComponent(new URL('./node_modules/bootstrap/dist', import.meta.url).pathname)
));
app.use(bodyParser.urlencoded({ extended: true }));

db.connect();

//CRIS/ GET home page
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//CRIS/ GET /userLibrary
app.get("/userLibrary", async (req, res) => {
    //CRIS/ using the name of the user, get a string array with all the titles of the books they read
    const bookTitles = await getUserBooks(appState.currentUserName);
    //CRIS/ for every book title string, create a book object that has a summary, book cover, id, and title, and then store all of this in an array
    const newBooksArray = await createNewBooksArray(bookTitles);
    appState.currentBooksArray = newBooksArray;


    res.render("userLibrary.ejs", { name: appState.currentUserName, books: appState.currentBooksArray });
});

//CRIS/ GET /userBook
app.get("/userBook", async (req, res) => {
    const bookId = appState.currentBookId;
    const userId = appState.currentUserId;
    const userName = appState.currentUserName;

    const bookObject = await createNewBookObject(bookId);

    try {
        const bookReview = await createBookReview(userId, bookId);
        res.render("userBook.ejs", {
            userName: userName,
            book: bookObject,
            bookReview: bookReview
        });
    } catch (error) {
        console.log(error);

        res.render("userBook.ejs", {
            userName: userName,
            book: bookObject
        });
    }

});

//CRIS/ GET /getBookReviewPage
app.get("/getBookReviewPage", async (req, res) => {
    const bookId = appState.currentBookId;
    const userName = appState.currentUserName;

    const bookObject = await createNewBookObject(bookId);

    res.render("bookReview.ejs", {
        bookTitle: bookObject.title,
        userName: userName
    });
});

//CRIS/ GET /editBookReview
app.get("/editBookReviewPage", async (req, res) => {
    const editingReview = true;
    const bookId = appState.currentBookId;
    const userName = appState.currentUserName;

    const bookObject = await createNewBookObject(bookId);

    res.render("bookReview.ejs", {
        editingReview: editingReview,
        bookTitle: bookObject.title,
        userName: userName
    });
});

//CRIS/ POST /user
app.post("/user", async (req, res) => {
    const user = req.body["user"];
    appState.currentUserName = user;

    let userId = await db.query("SELECT * FROM users WHERE name = $1",
        [appState.currentUserName]
    );
    userId = userId.rows[0].id;

    appState.currentUserId = userId;

    res.redirect("/userLibrary");
});

//CRIS/ POST /view
// app.post("/view", async (req, res) => {
//     const bookId = req.body["viewButtonBookId"];

//     //CRIS/ using the book id, find the book title
//     let bookTitle = await db.query("SELECT * FROM books WHERE id = $1",
//         [bookId]
//     );
//     bookTitle = bookTitle.rows[0].title;

//     //CRIS/ the function we need to use only accepts arrays, so we'll store our one book title in an array
//     const bookTitlesArray = [bookTitle];

//     //CRIS/ using the book title, create a new book object
//     let newBookObject = await createNewBooksArray(bookTitlesArray);
//     newBookObject = newBookObject[0];

//     //CRIS/ using the book id, find all the notes
//     let bookNotes = await db.query("SELECT * FROM user_book_notes WHERE book_id = $1 AND user_id = $2",
//         [bookId, appState.currentUserId]
//     );
//     bookNotes = bookNotes.rows;

//     res.render("userBook.ejs", {
//         book: newBookObject,
//         bookNotes: bookNotes,
//         user: appState.currentUserName,
//     });
// });

//CRIS/ POST /updateUserBook
app.post("/updateUserBook", async (req, res) => {
    const bookId = req.body["viewButtonBookId"];
    appState.currentBookId = bookId;

    res.redirect("userBook");
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
            [appState.currentUserId, bookId]
        );
        res.redirect("/userLibrary");
    } catch (error) {
        console.log(error);
    }
});

//CRIS/ POST /deleteBook
app.post("/deleteBook", async (req, res) => {
    const bookId = req.body["deleteButtonBookId"];
    const userId = appState.currentUserId;

    await db.query("DELETE FROM user_books WHERE book_id = $1",
        [bookId]
    );

    try {
        await db.query("DELETE FROM user_book_reviews WHERE book_id = $1 AND user_id = $2",
            [bookId, userId]
        );
        res.redirect("/userLibrary");
    } catch (error) {
        console.log(error);
        res.redirect("/userLibrary");
    }
});

//CRIS/ POST /deleteBookReview
app.post("/deleteBookReview", async (req, res) => {
    const bookId = appState.currentBookId;
    const userId = appState.currentUserId;

    await db.query("DELETE FROM user_book_reviews WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
    );

    res.redirect("/userBook");
});

//CRIS/ POST /addBookReview
app.post("/addBookReview", async (req, res) => {
    const userId = appState.currentUserId;
    const bookId = appState.currentBookId;
    const reviewNum = req.body["reviewNum"];
    const reviewNote = req.body["reviewNote"];

    await db.query("INSERT INTO user_book_reviews (user_id, book_id, review_num, review_note) VALUES ($1, $2, $3, $4)",
        [userId, bookId, reviewNum, reviewNote]
    );

    res.redirect("/userBook");
});

//CRIS/ POST /updatedBookReview
app.post("/updatedBookReview", async (req, res) => {
    const userId = appState.currentUserId;
    const bookId = appState.currentBookId;
    const reviewNum = req.body["reviewNum"];
    const reviewNote = req.body["reviewNote"];

    await db.query("UPDATE user_book_reviews SET review_num = $1, review_note = $2 WHERE user_id = $3 AND book_id = $4",
        [reviewNum, reviewNote, userId, bookId]
    );

    res.redirect("/userBook");
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});