const express = require('express');
const {
  processPayment,
  getPayment
} = require('../controllers/paymentController');
const {
  processPaymentValidator
} = require('../validators/paymentValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/process')
  .post(processPaymentValidator, validate, processPayment);

router.route('/:id')
  .get(getPayment);

module.exports = router;
