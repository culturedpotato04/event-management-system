const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

exports.getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ErrorResponse('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

exports.updateProfile = async (userId, updateData) => {
  // Prevent role, status or password update through this method
  const safeData = {
    name: updateData.name,
    email: updateData.email
  };
  
  // Remove undefined fields
  Object.keys(safeData).forEach(key => safeData[key] === undefined && delete safeData[key]);

  const user = await User.findByIdAndUpdate(userId, safeData, {
    new: true,
    runValidators: true
  });

  return user;
};

exports.changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');

  if (!(await user.matchPassword(currentPassword))) {
    throw new ErrorResponse('Password incorrect', 401, 'INVALID_CREDENTIALS');
  }

  user.password = newPassword;
  await user.save();
  return user;
};

exports.getAllUsers = async () => {
  return await User.find();
};

exports.getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) {
    throw new ErrorResponse('User not found', 404, 'USER_NOT_FOUND');
  }
  return user;
};

exports.updateUser = async (id, updateData) => {
  const user = await User.findById(id);
  if (!user) throw new ErrorResponse('User not found', 404, 'USER_NOT_FOUND');

  // Safeguard last active admin when changing role
  if (updateData.role && updateData.role !== 'admin' && user.role === 'admin' && user.status === 'active') {
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1) {
      throw new ErrorResponse('Cannot change role of the last active admin', 400, 'ADMIN_LAST_ACCOUNT_PROTECTION');
    }
  }

  const safeData = {};
  if (updateData.name) safeData.name = updateData.name;
  if (updateData.email) safeData.email = updateData.email;
  if (updateData.role) safeData.role = updateData.role;

  const updatedUser = await User.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true
  });
  if (!updatedUser) {
    throw new ErrorResponse('User not found', 404, 'USER_NOT_FOUND');
  }
  return updatedUser;
};

exports.updateUserStatus = async (id, status) => {
  const user = await User.findById(id);
  if (!user) throw new ErrorResponse('User not found', 404, 'USER_NOT_FOUND');

  if (user.role === 'admin' && status === 'inactive') {
    const adminCount = await User.countDocuments({ role: 'admin', status: 'active' });
    if (adminCount <= 1) {
      throw new ErrorResponse('Cannot deactivate the last active admin', 400, 'ADMIN_LAST_ACCOUNT_PROTECTION');
    }
  }

  user.status = status;
  await user.save();
  return user;
};
