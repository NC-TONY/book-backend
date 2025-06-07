// Filename: server.js

const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json()); // ✅ IMPORTANT: Fixes req.body undefined
app.use(session({
  secret: 'bookreviewsecret',
  resave: false,
  saveUninitialized: true,
}));

// Data
const users = []; // In-memory user store
const booksPath = path.join(__dirname, 'books.json');
let books = JSON.parse(fs.readFileSync(booksPath)).books;

// JWT Auth Middleware
const authenticateJWT = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.sendStatus(401);

  jwt.verify(token, 'jwtsecret', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// ------------------ Public Routes ------------------ //

// Task 1: Get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  res.json(book || {});
});

// Task 3: Get books by author
app.get('/books/author/:author', (req, res) => {
  const filtered = books.filter(b => b.author.toLowerCase() === req.params.author.toLowerCase());
  res.json(filtered);
});

// Task 4: Get books by title
app.get('/books/title/:title', (req, res) => {
  const filtered = books.filter(b => b.title.toLowerCase().includes(req.params.title.toLowerCase()));
  res.json(filtered);
});

// Task 5: Get reviews of a book
app.get('/books/review/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  res.json(book?.reviews || {});
});

// Task 6: Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }
  users.push({ username, password });
  res.json({ message: 'User registered successfully' });
});

// Task 7: Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' });

  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, 'jwtsecret');
  res.json({ message: 'Login successful', token });
});

// ------------------ Protected Routes ------------------ //

// Task 8: Add/Modify Review
app.post('/books/review/:isbn', authenticateJWT, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;

  const book = books.find(b => b.isbn === isbn);
  if (!book) return res.status(404).json({ message: 'Book not found' });

  if (!book.reviews) book.reviews = {};
  book.reviews[req.user.username] = review;

  res.json({ message: 'Review added/updated', reviews: book.reviews });
});

// Task 9: Delete Review
app.delete('/books/review/:isbn', authenticateJWT, (req, res) => {
  const { isbn } = req.params;

  const book = books.find(b => b.isbn === isbn);
  if (!book || !book.reviews) return res.status(404).json({ message: 'Review not found' });

  delete book.reviews[req.user.username];
  res.json({ message: 'Review deleted', reviews: book.reviews });
});

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
