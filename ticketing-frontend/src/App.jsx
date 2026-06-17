import React, { useState } from 'react';
import Navbar from './components/Navbar';
import EventList from './components/EventList';
import SeatGrid from './components/SeatGrid';
import { useDispatch } from 'react-redux';
import { clearMessages } from './store/eventSlice';

export default function App() {
  const [selectedEventId, setSelectedEventId] = useState(null);
  const dispatch = useDispatch();

  const handleSelectEvent = (id) => {
    dispatch(clearMessages());
    setSelectedEventId(id);
  };

  const handleBack = () => {
    dispatch(clearMessages());
    setSelectedEventId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto max-w-6xl py-6">
        {!selectedEventId ? (
          <EventList onSelectEvent={handleSelectEvent} />
        ) : (
          <SeatGrid eventId={selectedEventId} onBack={handleBack} />
        )}
      </main>
    </div>
  );
}