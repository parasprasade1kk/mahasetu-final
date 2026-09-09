const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    notificationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleMr: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      required: true,
    },
    messageMr: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['info', 'success', 'warning', 'action_required'],
      default: 'info',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
