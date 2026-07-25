const express = require('express');
const { listFees, payFee } = require('./feeController');

const router = express.Router();

router.get('/', listFees);
router.post('/pay', payFee);

module.exports = router;
