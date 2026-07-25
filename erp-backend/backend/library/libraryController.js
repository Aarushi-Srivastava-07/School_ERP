const books = [
  {
    id: 1,
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "978-0201616224",
    totalCopies: 5,
    availableCopies: 3,
    createdAt: new Date("2024-01-15T10:00:00.000Z").toISOString(),
  },
  {
    id: 2,
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    totalCopies: 4,
    availableCopies: 2,
    createdAt: new Date("2024-02-20T11:30:00.000Z").toISOString(),
  },
  {
    id: 3,
    title: "JavaScript: The Good Parts",
    author: "Douglas Crockford",
    isbn: "978-0596517748",
    totalCopies: 3,
    availableCopies: 1,
    createdAt: new Date("2024-03-10T09:15:00.000Z").toISOString(),
  },
];
let nextBookId = 4;
let nextIssueId = 1;

function sendSuccess(res, statusCode, data) {
  return res.status(statusCode).json({ success: true, data });
}

function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}

function listBooks(req, res) {
  return sendSuccess(res, 200, books);
}

function addBook(req, res) {
  const { title, author, isbn, totalCopies = 1 } = req.body || {};

  if (!title || !author || !isbn) {
    return sendError(res, 400, 'Title, author, and isbn are required');
  }

  const book = {
    id: nextBookId++,
    title,
    author,
    isbn,
    totalCopies: Number(totalCopies),
    availableCopies: Number(totalCopies),
    createdAt: new Date().toISOString(),
  };

  books.push(book);
  return sendSuccess(res, 201, book);
}

function issueBook(req, res) {
  const { bookId, studentId } = req.body || {};

  if (!bookId || !studentId) {
    return sendError(res, 400, 'bookId and studentId are required');
  }

  const book = books.find((item) => item.id === Number(bookId));

  if (!book) {
    return sendError(res, 404, 'Book not found');
  }

  if (book.availableCopies <= 0) {
    return sendError(res, 409, 'No copies available to issue');
  }

  book.availableCopies -= 1;

  const issue = {
    id: nextIssueId++,
    bookId: Number(bookId),
    studentId,
    issuedAt: new Date().toISOString(),
  };

  return sendSuccess(res, 201, { issue, book });
}

module.exports = {
  addBook,
  issueBook,
  listBooks,
};
