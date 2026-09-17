const express = require('express');
const {
  createReview,
  getEventReviews,
  getReview,
  updateReview,
  deleteReview,
  updateReviewStatus
} = require('../controllers/reviewController');
const {
  createReviewValidator,
  updateReviewValidator,
  updateReviewStatusValidator
} = require('../validators/reviewValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createReviewValidator, validate, createReview);

router.route('/event/:eventId')
  .get(getEventReviews);

router.route('/:id')
  .get(getReview)
  .put(protect, updateReviewValidator, validate, updateReview)
  .delete(protect, deleteReview);

router.route('/:id/status')
  .patch(protect, authorize('admin'), updateReviewStatusValidator, validate, updateReviewStatus);

module.exports = router;
