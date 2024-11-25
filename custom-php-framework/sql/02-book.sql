CREATE TABLE books
(
    id      integer not null
        constraint books_pk
            primary key autoincrement,
    title   text not null,
    author  text not null,
    description text not null
);