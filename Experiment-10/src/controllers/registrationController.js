const Registration = require('../models/Registration');
const mongoose = require('mongoose');

const getFinalAmount = (price, code) => {
  if (!code) return price;
  if (code === 'CAMPUS50') return price * 0.5;
  if (code === 'EARLYBIRD') {
    const val = price - 100;
    return val < 0 ? 0 : val;
  }
  return null;
};

const createRegistration = async (req, res, next) => {
  try {
    const { ticketPrice, discountCode } = req.body;

    const finalAmount = getFinalAmount(ticketPrice, discountCode);
    if (finalAmount === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid discount code'
      });
    }

    const data = await Registration.create({
      ...req.body,
      finalAmount
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data
    });
  } catch (err) {
    next(err);
  }
};

const getAllRegistrations = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.eventType) query.eventType = req.query.eventType;
    if (req.query.status) query.status = req.query.status;

    const data = await Registration.find(query);

    res.status(200).json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    next(err);
  }
};

const getRegistrationById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format'
      });
    }

    const data = await Registration.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      data
    });
  } catch (err) {
    next(err);
  }
};

const updateRegistration = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format'
      });
    }

    if (req.body.ticketPrice !== undefined || req.body.discountCode !== undefined) {
      const existing = await Registration.findById(req.params.id);
      if (!existing) {
        return res.status(404).json({
          success: false,
          message: 'Registration not found'
        });
      }

      const price = req.body.ticketPrice !== undefined ? req.body.ticketPrice : existing.ticketPrice;
      const code = req.body.discountCode !== undefined ? req.body.discountCode : existing.discountCode;

      const finalAmount = getFinalAmount(price, code);
      if (finalAmount === null) {
        return res.status(400).json({
          success: false,
          message: 'Invalid discount code'
        });
      }
      req.body.finalAmount = finalAmount;
    }

    const data = await Registration.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration updated',
      data
    });
  } catch (err) {
    next(err);
  }
};

const deleteRegistration = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid registration ID format'
      });
    }

    const data = await Registration.findByIdAndDelete(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Registration not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Registration cancelled/deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRegistration,
  getAllRegistrations,
  getRegistrationById,
  updateRegistration,
  deleteRegistration
};
