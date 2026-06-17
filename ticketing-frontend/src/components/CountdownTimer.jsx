import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { clearReservation } from '../store/eventSlice';

export default function CountdownTimer({ expiryTime }) {
    const dispatch = useDispatch();
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(expiryTime) - new Date();
            return difference > 0 ? Math.floor(difference / 1000) : 0;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            const rem = calculateTimeLeft();
            setTimeLeft(rem);
            if (rem <= 0) {
                clearInterval(timer);
                dispatch(clearReservation());
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [expiryTime, dispatch]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-center justify-between mb-4 animate-pulse">
            <span className="text-amber-800 font-semibold text-sm">⚠️ Complete payment/booking before expiry:</span>
            <span className="text-xl font-mono font-bold text-amber-600">{formatTime(timeLeft)}</span>
        </div>
    );
}