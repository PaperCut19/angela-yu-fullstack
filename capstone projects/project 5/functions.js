import { appState, db } from "./sharedData.js";
import axios from "axios";

//CRIS/ return an array of strings containing book titles of the user
export async function getUserBooks(user) {

    //CRIS/ get the id of the user by using the name
    let userId = await db.query("SELECT id FROM users WHERE name = $1",
        [user]
    );

    userId = userId.rows[0].id;

    appState.currentUserId = userId;

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
export async function searchBookByTitle(title) {
    try {
        const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
        return response.data.docs.find(book => book.cover_i);
    } catch (error) {
        console.error(error);
    }
}

//CRIS/ return the summary of a book using the book's data
export async function getSummary(bookData) {
    const bookKey = bookData.key;

    try {
        let bookSummary = await axios.get(`https://openlibrary.org/${bookKey}.json`);
        bookSummary = bookSummary.data.description;
        return bookSummary;
    } catch (error) {
        console.log(error);
    }

}

export async function getBookId(bookTitle) {
    let bookId = await db.query("SELECT * FROM books WHERE title = $1",
        [bookTitle]
    );

    bookId = bookId.rows[0].id;

    return bookId;
}

//CRIS/ for each book title, create a detailed object and add it to an array
export async function createNewBooksArray(bookTitles) {
    let newBooksArray = [];

    // Use for...of to handle export async operations properly
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