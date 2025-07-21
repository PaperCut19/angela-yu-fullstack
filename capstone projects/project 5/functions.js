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
// export async function searchBookByTitle(title) {
//     try {
//         const response = await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}`);
//         return response.data.docs.find(book => book.cover_i);
//     } catch (error) {
//         console.error(error);
//     }
// }

async function searchBookByTitle(title) {
    try {
        // Make the request to Google Books API
        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
            params: {
                q: title,
                key: 'AIzaSyBaIsvtUqNjxJFYE3Bgq-JD45GWn0P8hWE',  // Replace with your actual API key
                maxResults: 10
            }
        });

        // Find the first book with both a description and a cover image
        for (const book of response.data.items) {
            const hasDescription = book.volumeInfo.description;
            const hasCoverImage = book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail;

            if (hasDescription && hasCoverImage) {
                // Return the first book that meets the criteria
                return {
                    title: book.volumeInfo.title,
                    summary: book.volumeInfo.description,
                    bookCover: book.volumeInfo.imageLinks.thumbnail
                };
            }
        }

        // If no book with both description and cover image is found
        throw new Error("something went wrong");

    } catch (error) {
        console.error('Error fetching books:', error);
    }
}

//CRIS/ return the summary of a book using the book's data
// export async function getSummary(bookData) {
//     const bookKey = bookData.key;

//     try {
//         let bookSummary = await axios.get(`https://openlibrary.org/${bookKey}.json`);
//         bookSummary = bookSummary.data.description;
//         return bookSummary;
//     } catch (error) {
//         console.log(error);
//     }

// }

async function getBookId(bookTitle) {
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
        // const summary = await getSummary(bookData);
        const bookId = await getBookId(bookTitle);

        const wordObject = splitString(bookData.summary);

        // Create a book object containing the title, book cover, and summary
        const bookObject = {
            title: bookData.title,
            bookCover: bookData.bookCover,
            summary: wordObject,
            id: bookId
        };

        newBooksArray.push(bookObject);
    }

    return newBooksArray;
}

export async function createNewBookObject(bookId) {
    let bookTitle = await db.query("SELECT * FROM books WHERE id = $1",
        [bookId]
    );
    bookTitle = bookTitle.rows[0].title;

    const bookArray = [bookTitle];

    let bookObject = await createNewBooksArray(bookArray);
    bookObject = bookObject[0];

    return bookObject;
}

export async function createBookReview(userId, bookId) {
    let bookReviewNum = await db.query("SELECT * FROM user_book_reviews WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
    );
    bookReviewNum = bookReviewNum.rows[0].review_num;

    let bookReviewNote = await db.query("SELECT * FROM user_book_reviews WHERE user_id = $1 AND book_id = $2",
        [userId, bookId]
    );
    bookReviewNote = bookReviewNote.rows[0].review_note;

    const bookReview = {
        reviewNumber: bookReviewNum,
        reviewNote: bookReviewNote
    };

    return bookReview;
}

export function splitString(string) {
    // Split the input string into an array of words
    const words = string.split(' ');

    // Get the first 50 words
    const firstPart = words.slice(0, 50).join(' ');

    // Get the rest of the words
    const secondPart = words.slice(50).join(' ');

    const allWords = firstPart + " " + secondPart;

    const textObject = {
        firstPart: firstPart,
        secondPart: secondPart,
        allWords: allWords
    };

    return textObject;
}
