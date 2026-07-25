import React, { useEffect, useState } from "react";
import api from "../api";

export default function Library() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "",
    totalCopies: 1,
  });
  const [issueForm, setIssueForm] = useState({
    studentId: "",
    bookId: "",
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function fetchBooks() {
    try {
      setIsLoading(true);
      const response = await api.get("/library/books");
      const payload = response?.data?.data ?? response?.data ?? [];
      const normalizedBooks = (Array.isArray(payload) ? payload : []).map((book) => ({
        id: book.id,
        displayId: `LIB${String(book.id).padStart(3, "0")}`,
        title: book.title,
        author: book.author,
        isbn: book.isbn,
        category: book.category || "General",
        copies: Number(book.totalCopies || 0),
        available: Number(book.availableCopies || 0),
        status: Number(book.availableCopies || 0) > 0 ? "Available" : "Out of Stock",
      }));

      setBooks(normalizedBooks);
    } catch (error) {
      const message = error?.response?.data?.message || "Unable to load books.";
      setToast({ type: "error", message });
    } finally {
      setIsLoading(false);
    }
  }

  const filteredBooks = books.filter((book) => {
    const searchTerm = search.toLowerCase();
    return [book.title, book.author, book.displayId, book.isbn]
      .join(" ")
      .toLowerCase()
      .includes(searchTerm);
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const resetAddForm = () => {
    setAddForm({ title: "", author: "", isbn: "", category: "", totalCopies: 1 });
  };

  const resetIssueForm = () => {
    setIssueForm({ studentId: "", bookId: "" });
  };

  async function handleAddBook(event) {
    event.preventDefault();

    try {
      const payload = {
        title: addForm.title,
        author: addForm.author,
        isbn: addForm.isbn,
        category: addForm.category,
        totalCopies: Number(addForm.totalCopies || 1),
      };

      await api.post("/library/books", payload);
      setShowAddModal(false);
      resetAddForm();
      showToast("Book added successfully.");
      await fetchBooks();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to add book.";
      showToast(message, "error");
    }
  }

  async function handleIssueBook(event) {
    event.preventDefault();

    try {
      const payload = {
        studentId: issueForm.studentId,
        bookId: Number(issueForm.bookId),
      };

      await api.post("/library/issue", payload);
      setShowIssueModal(false);
      resetIssueForm();
      showToast("Book issued successfully.");
      await fetchBooks();
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to issue book.";
      showToast(message, "error");
    }
  }

  return (
    <div className="bg-[#f4f5fb] min-h-[80vh] font-sans p-6 rounded-xl relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1f36]">Library Management</h1>
          <p className="text-gray-500 text-sm">Manage books catalog, issues, and returns</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowIssueModal(true)}
            className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            Issue Book
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#3949ab] hover:bg-[#283593] text-white px-5 py-2.5 rounded-lg font-semibold transition-colors shadow-sm"
          >
            + Add New Book
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Total Books", val: books.length, color: "border-l-[#3949ab]" },
          { label: "Books Issued", val: books.filter((book) => book.available < book.copies).length, color: "border-l-yellow-500" },
          { label: "Out of Stock", val: books.filter((book) => book.available === 0).length, color: "border-l-red-500" },
          { label: "Available", val: books.reduce((sum, book) => sum + book.available, 0), color: "border-l-green-500" },
        ].map((stat) => (
          <div key={stat.label} className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm border-l-4 ${stat.color}`}>
            <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-2">{stat.label}</h3>
            <p className="text-2xl font-bold text-gray-800">{stat.val}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center">
          <input
            placeholder="Search books by title, author, or ID..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-md border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-gray-200">Book ID</th>
                <th className="p-4 font-bold border-b border-gray-200">Title & Author</th>
                <th className="p-4 font-bold border-b border-gray-200">Category</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Copies (Total/Avail)</th>
                <th className="p-4 font-bold border-b border-gray-200 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">Loading books...</td>
                </tr>
              ) : filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-6 text-center text-gray-500">No books found.</td>
                </tr>
              ) : (
                filteredBooks.map((book) => (
                  <tr key={book.id} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="p-4">
                      <span className="font-mono text-[#3949ab] bg-[#e8eaf6] px-2 py-1 rounded font-bold">{book.displayId}</span>
                    </td>
                    <td className="p-4 font-semibold text-gray-800">
                      {book.title}
                      <div className="text-xs text-gray-500 font-normal mt-0.5">by {book.author}</div>
                    </td>
                    <td className="p-4 text-gray-600">{book.category}</td>
                    <td className="p-4 text-center font-semibold">{book.copies} / {book.available}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${book.status === "Available" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {book.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add New Book</h2>
            <form onSubmit={handleAddBook} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  required
                  value={addForm.title}
                  onChange={(event) => setAddForm({ ...addForm, title: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Author</label>
                <input
                  required
                  value={addForm.author}
                  onChange={(event) => setAddForm({ ...addForm, author: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">ISBN</label>
                <input
                  required
                  value={addForm.isbn}
                  onChange={(event) => setAddForm({ ...addForm, isbn: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                <input
                  value={addForm.category}
                  onChange={(event) => setAddForm({ ...addForm, category: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Total Copies</label>
                <input
                  type="number"
                  min="1"
                  value={addForm.totalCopies}
                  onChange={(event) => setAddForm({ ...addForm, totalCopies: event.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-[#3949ab] hover:bg-[#283593] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors">
                  Add Book
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetAddForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showIssueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Issue Book</h2>
            <form onSubmit={handleIssueBook} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Student ID</label>
                <input
                  required
                  value={issueForm.studentId}
                  onChange={(event) => setIssueForm({ ...issueForm, studentId: event.target.value })}
                  placeholder="e.g. STU2023015"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Book ID</label>
                <input
                  required
                  type="number"
                  value={issueForm.bookId}
                  onChange={(event) => setIssueForm({ ...issueForm, bookId: event.target.value })}
                  placeholder="e.g. 1"
                  className="w-full border border-gray-300 rounded-lg p-2 focus:border-[#3949ab] outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 bg-[#3949ab] hover:bg-[#283593] text-white px-4 py-2.5 rounded-lg font-semibold transition-colors">
                  Issue
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowIssueModal(false);
                    resetIssueForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-[60] px-4 py-3 rounded-lg shadow-lg text-white font-semibold ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
