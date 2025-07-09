CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    summary TEXT NOT NULL,
    book_cover TEXT NOT NULL
);

CREATE TABLE user_book_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    note TEXT,
    page_number TEXT
);

CREATE TABLE user_book_reviews (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    review_num INTEGER NOT NULL,
    PRIMARY KEY (user_id, book_id)
);