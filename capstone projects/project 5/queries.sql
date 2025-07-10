-- CREATE users table --
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

-- CREATE books table --
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    book_cover TEXT NOT NULL
);

-- CREATE user_book_notes table --
CREATE TABLE user_book_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    note TEXT,
    page_number TEXT
);

-- CREATE user_book_reviews, one user can only have one review per book --
CREATE TABLE user_book_reviews (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    review_num INTEGER NOT NULL,
    PRIMARY KEY (user_id, book_id)
);