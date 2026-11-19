const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());                          
app.use(express.static(path.join(__dirname, 'public')));  

let books = [
  { bookID: '101', title: 'The Pragmatic Programmer', author: 'Andrew Hunt', price: 39.99 },
  { bookID: '102', title: 'Clean Code', author: 'Robert C. Martin', price: 42.50 },
  { bookID: '103', title: 'You Don\'t Know JS', author: 'Kyle Simpson', price: 28.00 }
];

function validateBook(body, requireId = false) {
  const errors = [];
  if (requireId && !body.bookID) errors.push('bookID is required');
  if (!body.title || typeof body.title !== 'string') errors.push('title is required');
  if (!body.author || typeof body.author !== 'string') errors.push('author is required');
  if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) {
    errors.push('price must be a non-negative number');
  }
  return errors;
}

app.get('/books', (req, res) => {
  res.status(200).json(books);
});

app.get('/books/:id', (req, res) => {
  const book = books.find(b => b.bookID === req.params.id);
  if (!book) {
    return res.status(404).json({ message: `Book with ID ${req.params.id} not found` });
  }
  res.status(200).json(book);
});

app.post('/books', (req, res) => {
  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  const { bookID, title, author, price } = req.body;

  const finalId = bookID || String(Date.now());

  if (books.some(b => b.bookID === finalId)) {
    return res.status(409).json({ message: `Book ID ${finalId} already exists` });
  }

  const newBook = { bookID: finalId, title, author, price };
  books.push(newBook);
  res.status(201).json({ message: 'Book added successfully', book: newBook });
});

app.put('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.bookID === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: `Book with ID ${req.params.id} not found` });
  }

  const errors = validateBook(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  books[index] = {
    ...books[index],
    title: req.body.title,
    author: req.body.author,
    price: req.body.price
  };

  res.status(200).json({ message: 'Book updated successfully', book: books[index] });
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex(b => b.bookID === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: `Book with ID ${req.params.id} not found` });
  }

  const deleted = books.splice(index, 1)[0];
  res.status(200).json({ message: 'Book deleted successfully', book: deleted });
});

app.use('/books', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON in request body' });
  }
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`📚 Book Manager server running at http://localhost:${PORT}`);
});