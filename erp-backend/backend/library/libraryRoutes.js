const express = require('express');
const controller = require('./libraryController');

const router = express.Router();

router.get('/books', controller.listBooks);
router.post('/books', controller.addBook);
router.post('/issue', controller.issueBook);

module.exports = router;
