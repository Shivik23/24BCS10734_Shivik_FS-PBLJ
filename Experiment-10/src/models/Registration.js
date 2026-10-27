const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  studentName: {
    type: String,
    required: [true, 'Student name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  collegeEmail: {
    type: String,
    required: [true, 'College email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/,
      'Must be a valid college email ending in .edu or .ac.in'
    ]
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required'],
    uppercase: true,
    match: [
      /^[A-Z0-9]{8,10}$/,
      'Roll number must be alphanumeric and 8 to 10 characters'
    ]
  },
  eventType: {
    type: String,
    required: [true, 'Event type is required'],
    enum: {
      values: ['CODING_HACKATHON', 'AI_WORKSHOP', 'ROBOTICS', 'GAMING'],
      message: 'Invalid event type'
    }
  },
  teamSize: {
    type: Number,
    required: [true, 'Team size is required'],
    min: [1, 'Team size must be at least 1'],
    max: [4, 'Team size cannot be more than 4'],
    validate: {
      validator: Number.isInteger,
      message: 'Team size must be an integer'
    }
  },
  ticketPrice: {
    type: Number,
    required: [true, 'Ticket price is required'],
    min: [0, 'Ticket price cannot be negative']
  },
  discountCode: {
    type: String,
    uppercase: true,
    trim: true
  },
  finalAmount: {
    type: Number
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  registrationDate: {
    type: Date,
    default: Date.now,
    validate: {
      validator: function (val) {
        return val <= new Date();
      },
      message: 'Registration date cannot be in the future'
    }
  }
});

registrationSchema.pre('validate', function (next) {
  if (this.eventType === 'AI_WORKSHOP' && this.teamSize > 1) {
    this.invalidate('teamSize', 'AI Workshop only permits individual registrations');
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
