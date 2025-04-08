const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  role: Joi.string().valid('client', 'trainer').required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateUserSchema = Joi.object({
  first_name: Joi.string(),
  last_name: Joi.string(),
  email: Joi.string().email(),
  password: Joi.string().min(8),
  current_password: Joi.string().when('password', {
    is: Joi.exist(),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});

// Trainer profile validation schemas
const trainerProfileSchema = Joi.object({
  bio: Joi.string().required(),
  specializations: Joi.array().items(Joi.string()).required(),
  years_experience: Joi.number().integer().min(0).required(),
  location: Joi.string().required(),
  profile_image: Joi.string().uri().optional()
});

const updateTrainerProfileSchema = Joi.object({
  bio: Joi.string(),
  specializations: Joi.array().items(Joi.string()),
  years_experience: Joi.number().integer().min(0),
  location: Joi.string(),
  profile_image: Joi.string().uri().optional()
});

// Trainer service validation schemas
const trainerServiceSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  duration: Joi.number().integer().min(15).required(),
  price: Joi.number().precision(2).positive().required(),
  is_active: Joi.boolean().default(true)
});

const updateTrainerServiceSchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  duration: Joi.number().integer().min(15),
  price: Joi.number().precision(2).positive(),
  is_active: Joi.boolean()
});

// Booking validation schemas
const createBookingSchema = Joi.object({
  trainerId: Joi.number().integer().required(),
  serviceId: Joi.number().integer().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  notes: Joi.string().optional()
}).custom((value, helpers) => {
  if (new Date(value.startTime) >= new Date(value.endTime)) {
    return helpers.error('any.invalid', { message: 'End time must be after start time' });
  }
  return value;
});

const updateBookingSchema = Joi.object({
  startTime: Joi.date().iso(),
  endTime: Joi.date().iso(),
  notes: Joi.string()
}).custom((value, helpers) => {
  if (value.startTime && value.endTime && new Date(value.startTime) >= new Date(value.endTime)) {
    return helpers.error('any.invalid', { message: 'End time must be after start time' });
  }
  return value;
});

const cancelBookingSchema = Joi.object({
  cancellationReason: Joi.string().required()
});

// Payment validation schemas
const createPaymentIntentSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  amount: Joi.number().precision(2).positive().required(),
  currency: Joi.string().default('usd'),
  metadata: Joi.object().optional()
});

const confirmPaymentSchema = Joi.object({
  paymentIntentId: Joi.string().required()
});

// Review validation schemas
const createReviewSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().required(),
  isPublic: Joi.boolean().default(true)
});

// Zoom meeting validation schemas
const createZoomMeetingSchema = Joi.object({
  bookingId: Joi.number().integer().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().required(),
  trainerName: Joi.string().required(),
  clientName: Joi.string().required(),
  serviceName: Joi.string().required()
});

// Email validation schemas
const sendEmailSchema = Joi.object({
  recipientEmail: Joi.string().email().required(),
  recipientName: Joi.string().required(),
  subject: Joi.string().required(),
  content: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  trainerProfileSchema,
  updateTrainerProfileSchema,
  trainerServiceSchema,
  updateTrainerServiceSchema,
  createBookingSchema,
  updateBookingSchema,
  cancelBookingSchema,
  createPaymentIntentSchema,
  confirmPaymentSchema,
  createReviewSchema,
  createZoomMeetingSchema,
  sendEmailSchema
};
