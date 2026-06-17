const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Simple string or ObjectId for auth
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    seatNumbers: [{ type: String, required: true }],
    expiresAt: { type: Date, required: true }
}, { timestamps: true });

// TTL index: Automatically deletes the document when expiresAt is reached
// Note: MongoDB TTL monitor runs every 60 seconds.
reservationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Reservation', reservationSchema);