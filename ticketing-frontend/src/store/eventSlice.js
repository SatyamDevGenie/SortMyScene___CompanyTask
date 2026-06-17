import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Set up base axios instance config headers
const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

export const fetchEvents = createAsyncThunk('events/fetchEvents', async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/events`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to fetch events');
    }
});

export const fetchEventDetails = createAsyncThunk('events/fetchEventDetails', async (id, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/events/${id}`);
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Failed to load event data');
    }
});

export const reserveSeats = createAsyncThunk('events/reserveSeats', async ({ eventId, seatNumbers }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/reserve`, { eventId, seatNumbers }, getAuthHeader());
        return response.data.reservation;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Reservation concurrency error');
    }
});

export const confirmBooking = createAsyncThunk('events/confirmBooking', async (reservationId, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/bookings`, { reservationId }, getAuthHeader());
        return response.data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || 'Booking execution failed');
    }
});

const eventSlice = createSlice({
    name: 'events',
    initialState: {
        list: [],
        currentEvent: null,
        seats: [],
        activeReservation: null,
        loading: false,
        error: null,
        successMessage: null
    },
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.successMessage = null;
        },
        clearReservation: (state) => {
            state.activeReservation = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Events
            .addCase(fetchEvents.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchEvents.fulfilled, (state, action) => { state.list = action.payload; state.loading = false; })
            .addCase(fetchEvents.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Fetch Event Details
            .addCase(fetchEventDetails.fulfilled, (state, action) => {
                state.currentEvent = action.payload.event;
                state.seats = action.payload.seats;
            })
            // Reserve Seats
            .addCase(reserveSeats.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(reserveSeats.fulfilled, (state, action) => {
                state.loading = false;
                state.activeReservation = action.payload;
                state.successMessage = "Seats temporarily reserved for 10 minutes!";
            })
            .addCase(reserveSeats.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
            // Confirm Booking
            .addCase(confirmBooking.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(confirmBooking.fulfilled, (state) => {
                state.loading = false;
                state.activeReservation = null;
                state.successMessage = "Ticket booked successfully! Enjoy your event.";
            })
            .addCase(confirmBooking.rejected, (state, action) => { state.loading = false; state.error = action.payload; state.activeReservation = null; });
    }
});

export const { clearMessages, clearReservation } = eventSlice.actions;
export default eventSlice.reducer;