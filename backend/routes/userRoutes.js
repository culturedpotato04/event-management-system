const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  getUsers,
  getUser,
  updateUser,
  updateUserStatus
} = require('../controllers/userController');
const {
  updateProfileValidator,
  changePasswordValidator,
  updateUserValidator,
  updateStatusValidator
} = require('../validators/userValidators');
const { validate } = require('../middleware/validateMiddleware');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // All user routes require authentication

// User specific routes
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidator, validate, updateProfile);
router.put('/change-password', changePasswordValidator, validate, changePassword);

// Admin specific routes
router.use(authorize('admin'));
router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUserValidator, validate, updateUser);
router.patch('/:id/status', updateStatusValidator, validate, updateUserStatus);

module.exports = router;
