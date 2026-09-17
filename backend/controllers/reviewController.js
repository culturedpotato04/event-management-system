const reviewService = require('../services/reviewService');

exports.createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.body, req.user.id);
    res.status(201).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.getEventReviews = async (req, res, next) => {
  try {
    const data = await reviewService.getEventReviews(req.params.eventId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getReview = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.body, req.user);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await reviewService.deleteReview(req.params.id, req.user);
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};

exports.updateReviewStatus = async (req, res, next) => {
  try {
    const review = await reviewService.updateReviewStatus(req.params.id, req.body.isVisible);
    res.status(200).json({ success: true, data: review });
  } catch (err) {
    next(err);
  }
};
