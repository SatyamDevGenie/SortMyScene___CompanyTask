const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Reservation = require('../models/Reservation');
const auth = require('../middleware/authMiddleware');

// POST /api/reserve
router.post('/reserve', auth, async (req, res) => {
    const { eventId, seatNumbers } = req.body;
    const userId = req.user.userId;

    if (!eventId || !seatNumbers || !Array.isArray(seatNumbers)) {
        return res.status(400).json({ message: 'Invalid payload' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Attempt to update requested seats atomicly ONLY if they are currently 'available'
        const result = await Seat.updateMany(
            {
                eventId,
                seatNumber: { $in: seatNumbers },
                status: 'available'
            },
            { $set: { status: 'reserved' } },
            { session }
        );

        // 2. Validate that ALL requested seats were successfully updated
        if (result.modifiedCount !== seatNumbers.length) {
            await session.abortTransaction();
            session.endSession();
            return res.status(409).json({
                message: 'One or more selected seats are no longer available. Please refresh.'
            });
        }

        // 3. Create the Reservation record (10-minute expiry)
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const reservation = await Reservation.create([{
            userId,
            eventId,
            seatNumbers,
            expiresAt
        }], { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Seats reserved successfully for 10 minutes',
            reservation: reservation[0]
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Reservation failed', error: error.message });
    }
});

// POST /api/bookings
router.post('/bookings', auth, async (req, res) => {
    const { reservationId } = req.body;
    const userId = req.user.userId;

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch the reservation
        const reservation = await Reservation.findById(reservationId).session(session);

        if (!reservation) {
            // If the reservation expired, check if seats are stuck in 'reserved' state and free them
            return res.status(410).json({ message: 'Reservation expired or does not exist.' });
        }

        // 2. Verify reservation ownership
        if (reservation.userId !== userId) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        // 3. Complete booking by changing seat status from 'reserved' to 'booked'
        await Seat.updateMany(
            {
                eventId: reservation.eventId,
                seatNumber: { $in: reservation.seatNumbers },
                status: 'reserved'
            },
            { $set: { status: 'booked' } },
            { session }
        );

        // 4. Remove the reservation record explicitly
        await Reservation.findByIdAndDelete(reservationId).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Booking confirmed successfully!' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ message: 'Booking confirmation failed', error: error.message });
    }
});

module.exports = router;