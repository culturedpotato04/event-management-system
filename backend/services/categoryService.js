const Category = require('../models/Category');
const ErrorResponse = require('../utils/errorResponse');

exports.createCategory = async (data, userId) => {
  const existingCategory = await Category.findOne({ name: data.name });
  if (existingCategory) {
    throw new ErrorResponse('Category already exists', 409, 'CATEGORY_ALREADY_EXISTS');
  }

  const category = await Category.create({
    ...data,
    createdBy: userId
  });

  return category;
};

exports.getCategories = async (query = {}) => {
  return await Category.find(query);
};

exports.getCategoryById = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ErrorResponse('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return category;
};

exports.updateCategory = async (id, data) => {
  if (data.name) {
    const existingCategory = await Category.findOne({ name: data.name, _id: { $ne: id } });
    if (existingCategory) {
      throw new ErrorResponse('Category name already in use', 409, 'CATEGORY_ALREADY_EXISTS');
    }
  }

  const category = await Category.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

  if (!category) {
    throw new ErrorResponse('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  return category;
};

exports.updateCategoryStatus = async (id, isActive) => {
  const category = await Category.findByIdAndUpdate(id, { isActive }, {
    new: true,
    runValidators: true
  });

  if (!category) {
    throw new ErrorResponse('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }

  return category;
};

exports.deleteCategory = async (id) => {
  const category = await Category.findByIdAndDelete(id);
  if (!category) {
    throw new ErrorResponse('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
  return category;
};
