const paymentService = require('../services/paymentService');

exports.processPayment = async (req, res, next) => {
  try {
    const result = await paymentService.processDemoPayment(req.body, req.user);
    res.status(200).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.user);
    res.status(200).json({ success: true, data: payment });
  } catch (err) {
    next(err);
  }
};
