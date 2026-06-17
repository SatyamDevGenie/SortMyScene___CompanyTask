import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEventDetails, reserveSeats, confirmBooking, clearMessages } from '../store/eventSlice';
import CountdownTimer from './CountdownTimer';

export default function SeatGrid({ eventId, onBack }) {
    const dispatch = useDispatch();
    const { currentEvent, seats, activeReservation, loading, error, successMessage } = useSelector(state => state.events);
    const { isAuthenticated } = useSelector(state => state.auth);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        dispatch(fetchEventDetails(eventId));
        const interval = setInterval(() => dispatch(fetchEventDetails(eventId)), 5000); // Polling UI status every 5s
        return () => clearInterval(interval);
    }, [eventId, dispatch]);

    const toggleSeatSelection = (seatNumber, status) => {
        if (status !== 'available' || activeReservation) return;
        setSelectedSeats(prev =>
            prev.includes(seatNumber) ? prev.filter(s => s !== seatNumber) : [...prev, seatNumber]
        );
    };

    const handleReserve = () => {
        if (!isAuthenticated) return alert("Please click 'Trigger Mock Login' at the top to authenticat before reserving!");
        dispatch(reserveSeats({ eventId, seatNumbers: selectedSeats })).then((res) => {
            if (!res.error) setSelectedSeats([]); // clear selections on successful lock
        });
    };

    const handleConfirmBooking = () => {
        dispatch(confirmBooking(activeReservation._id)).then((res) => {
            dispatch(fetchEventDetails(eventId));
        });
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button onClick={onBack} className="text-sm font-semibold text-blue-600 hover:underline mb-4 block">← Back to Events</button>

            {currentEvent && (
                <div className="mb-6">
                    <h2 className="text-3xl font-extrabold text-gray-900">{currentEvent.name}</h2>
                    <p className="text-gray-500">{currentEvent.venue}</p>
                </div>
            )}

            {/* Message Notifications banner */}
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-4 text-sm font-medium">{error}</div>}
            {successMessage && <div className="bg-emerald-100 text-emerald-800 p-4 rounded-lg mb-4 text-sm font-medium">{successMessage}</div>}

            {/* Countdown Timer integration */}
            {activeReservation && <CountdownTimer expiryTime={activeReservation.expiresAt} />}

            {/* Seat Grid Layout */}
            <div className="bg-white border p-8 rounded-xl shadow-sm mb-6">
                <div className="w-full bg-slate-300 h-2 rounded-full mb-12 text-center text-xs text-slate-600 font-bold tracking-widest pt-4">STAGE DIRECTION</div>

                <div className="grid grid-cols-5 gap-4 max-w-md mx-auto">
                    {seats.map((seat) => {
                        const isSelected = selectedSeats.includes(seat.seatNumber);
                        let seatColor = "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 cursor-pointer";

                        if (seat.status === 'reserved') seatColor = "bg-amber-400 border-amber-500 text-white cursor-not-allowed";
                        if (seat.status === 'booked') seatColor = "bg-rose-500 border-rose-600 text-white cursor-not-allowed";
                        if (isSelected) seatColor = "bg-blue-600 border-blue-700 text-white shadow-md";

                        return (
                            <button
                                key={seat._id}
                                disabled={seat.status !== 'available' || !!activeReservation}
                                onClick={() => toggleSeatSelection(seat.seatNumber, seat.status)}
                                className={`h-12 w-12 flex items-center justify-center font-mono font-bold rounded-lg border text-sm transition-all duration-150 ${seatColor}`}
                            >
                                {seat.seatNumber}
                            </button>
                        );
                    })}
                </div>

                {/* Legend Map indicators */}
                <div className="flex justify-center gap-6 mt-10 text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-gray-100 border rounded block"></span> Available</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-blue-600 rounded block"></span> Selected</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-amber-400 rounded block"></span> Reserved</div>
                    <div className="flex items-center gap-2"><span className="w-4 h-4 bg-rose-500 rounded block"></span> Booked</div>
                </div>
            </div>

            {/* Workflow CTA Buttons */}
            <div className="flex gap-4 justify-end">
                {!activeReservation ? (
                    <button
                        onClick={handleReserve}
                        disabled={selectedSeats.length === 0 || loading}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg font-bold transition-colors"
                    >
                        {loading ? 'Processing...' : `Reserve Selected Seats (${selectedSeats.length})`}
                    </button>
                ) : (
                    <button
                        onClick={handleConfirmBooking}
                        disabled={loading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-lg"
                    >
                        {loading ? 'Booking...' : 'Confirm Ticket Purchase'}
                    </button>
                )}
            </div>
        </div>
    );
}