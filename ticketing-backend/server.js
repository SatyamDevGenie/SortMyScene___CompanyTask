const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment configurations
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect Database
connectDB();

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api', require('./routes/bookingRoutes'));

// Global Cron/Interval fallback to release expired reservations 
// (In case MongoDB's native TTL execution experiences a minor phase delay)
const Seat = require('./models/Seat');
const Reservation = require('./models/Reservation');
setInterval(async () => {
    try {
        const expiredReservations = await Reservation.find({ expiresAt: { $lt: new Date() } });
        for (const res of expiredReservations) {
            await Seat.updateMany(
                { eventId: res.eventId, seatNumber: { $in: res.seatNumbers }, status: 'reserved' },
                { $set: { status: 'available' } }
            );
            await Reservation.findByIdAndDelete(res._id);
        }
    } catch (err) {
        console.error("Background task error:", err.message);
    }
}, 30000); // Check every 30 seconds

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));