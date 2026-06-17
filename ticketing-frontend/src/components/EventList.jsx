import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchEvents } from '../store/eventSlice';

export default function EventList({ onSelectEvent }) {
    const dispatch = useDispatch();
    const { list: events, loading } = useSelector(state => state.events);

    useEffect(() => {
        dispatch(fetchEvents());
    }, [dispatch]);

    if (loading) return <div className="text-center py-10 font-medium">Loading events...</div>;

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Available Live Events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <div key={event._id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 mb-2">{event.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">📅 {new Date(event.date).toLocaleString()}</p>
                        <p className="text-sm text-gray-600 mb-4">📍 {event.venue}</p>
                        <button
                            onClick={() => onSelectEvent(event._id)}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
                        >
                            Select & View Seats
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}