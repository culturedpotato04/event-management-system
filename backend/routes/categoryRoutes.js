const express = require('express');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory
} = require('../controllers/categoryController');
const {
  createCategoryValidator,
  updateCategoryValidator,
  updateCategoryStatusValidator
} = require('../validators/categoryValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin'), createCategoryValidator, validate, createCategory)
  .get(optionalAuth, getCategories);

router.route('/:id')
  .get(optionalAuth, getCategory)
  .put(protect, authorize('admin'), updateCategoryValidator, validate, updateCategory)
  .delete(protect, authorize('admin'), deleteCategory);

router.route('/:id/status')
  .patch(protect, authorize('admin'), updateCategoryStatusValidator, validate, updateCategoryStatus);

module.exports = router;
