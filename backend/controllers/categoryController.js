const categoryService = require('../services/categoryService');

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body, req.user.id);
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    // Determine visibility based on user role (public sees only active, admin sees all)
    let query = {};
    if (!req.user || req.user.role !== 'admin') {
      query.isActive = true;
    }
    const categories = await categoryService.getCategories(query);
    res.status(200).json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    // Hide inactive categories from non-admins
    if (!category.isActive && (!req.user || req.user.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Category not found', error: 'CATEGORY_NOT_FOUND' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.updateCategoryStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    const category = await categoryService.updateCategoryStatus(req.params.id, isActive);
    res.status(200).json({ success: true, data: category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
