-- ## CREATING TABLES ## --

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL UNIQUE,
    summary TEXT,
    book_cover TEXT
);

-- two foreign keys --
CREATE TABLE user_book_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    note TEXT,
    page_number TEXT
);

-- one user can only have one review per book, this table has two foreign keys --
CREATE TABLE user_book_reviews (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    review_num INTEGER NOT NULL,
    PRIMARY KEY (user_id, book_id)
);

-- each user can only read a book one time --
CREATE TABLE user_books (
  user_id INTEGER NOT NULL,
  book_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, book_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);


-- ## INSERTING DATA ## -- 

INSERT INTO users (name)
VALUES ('Cristian'), ('Alyssa');

INSERT INTO books (title, summary, book_cover)
VALUES ('Star Wars: Dark Disciple', 'The Jedi Council pairs brash Jedi Knight Quinlan Vos with infamous one-time Sith acolyte Asajj Ventress to target and kill the man responsible for so many war atrocities, Count Dooku himself.', 'https://covers.openlibrary.org/b/isbn/0345511530-L.jpg'),
('Pride and Prejudice', 'The romantic clash of two opinionated young people provides the sustaining theme of Pride and Prejudice. Vivacious Elizabeth Bennet is fascinated and repelled by the arrogant Mr. Darcy, whose condescending airs and acrid tongue have alienated her entire family. Their spirited courtship is conducted against a background of assembly-ball flirtations and drawing-room intrigues. Jane Austen''s famous novel captures the affectations of class-conscious Victorian families with matrimonial aims and rivalries. Her people are universal; they live a truth beyond time, change, or caricature. George Eliot called Jane Austen "the greatest artist that has ever written," and Sir Walter Scott wrote of her work, "There is a truth of painting in her writings which always delights me."', 'https://covers.openlibrary.org/b/olid/OL50998784M-L.jpg');

INSERT INTO user_book_reviews (user_id, book_id, review_num)
VALUES (1, 1, 10), (2, 2, 10);

INSERT INTO user_book_notes (user_id, book_id, note, page_number)
VALUES (1, 1, 'I love Star Wars: Dark Disciple', 1), (2, 2, 'I love Pride and Prejudice', 1);

INSERT INTO user_books (user_id, book_id)
VALUES (1, 1), (2, 2);

-- ## READING DATA ## --
 
SELECT users.name, books.title, user_book_reviews.review_num
FROM user_book_reviews
JOIN users ON user_id = users.id
JOIN books ON book_id = books.id;

SELECT users.name, books.title, user_book_notes.note, user_book_notes.page_number
FROM user_books
JOIN users ON user_id = users.id
JOIN books ON book_id = books.id
JOIN user_book_notes ON user_book_notes.user_id = user_books.user_id