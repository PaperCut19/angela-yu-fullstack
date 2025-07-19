import pg from "pg";  // Assuming you're using PostgreSQL, adjust as needed for your database

//CRIS/ this object will hold the current app state
export const appState = {
    currentUserId: null,
    currentUserName: null,
    currentBooksArray: [],
    currentBookId: null
};

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "capstone 5",
    password: "gyccof-rajwy0-pyccAx",
    port: 5432
});

// Export the database connection so it can be imported in other files
export { db };
