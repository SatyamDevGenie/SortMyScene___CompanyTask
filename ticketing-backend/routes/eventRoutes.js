const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const Seat = require('../models/Seat');

// GET /api/events
router.get('/', async (req, res) => {
    try {
        let events = await Event.find();

        // Seed Data if empty for easy testing
        if (events.length === 0) {
            const sampleEvent = await Event.create({
                name: "Tech Summit 2026",
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                venue: "Grand Arena, Mumbai",
                totalSeats: 20
            });

            const seats = [];
            for (let i = 1; i <= 20; i++) {
                seats.push({ eventId: sampleEvent._id, seatNumber: `S${i}`, status: 'available' });
            }
            await Seat.insertMany(seats);
            events = [sampleEvent];
        }

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// GET /api/events/:id
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const seats = await Seat.find({ eventId: req.params.id });
        res.json({ event, seats });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

module.exports = router;