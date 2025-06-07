// client.js

const axios = require('axios');

// TASK 10: Get All Books Using Callback
function getBooks(callback) {
  axios.get('http://localhost:3000/books')
    .then(res => callback(null, res.data))
    .catch(err => callback(err));
}
getBooks((err, data) => {
  if (err) console.error(err);
  else console.log("Task 10: Callback Get All Books", data);
});

// TASK 11: Search by ISBN – Promises
axios.get('http://localhost:3000/books/isbn/12345')
  .then(res => {
    console.log("Task 11: Book by ISBN (Promise)", res.data);
  })
  .catch(console.error);

// TASK 12: Search by Author – Async/Await
async function getByAuthor() {
  try {
    const res = await axios.get('http://localhost:3000/books/author/John Doe');
    console.log("Task 12: Books by Author", res.data);
  } catch (e) {
    console.error(e);
  }
}
getByAuthor();

// TASK 13: Search by Title – Async/Await
async function getByTitle() {
  try {
    const res = await axios.get('http://localhost:3000/books/title/Book One');
    console.log("Task 13: Books by Title", res.data);
  } catch (e) {
    console.error(e);
  }
}
getByTitle();
