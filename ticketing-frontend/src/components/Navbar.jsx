import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { loginSuccess, logout } from '../store/authSlice';
import axios from 'axios';

export default function Navbar() {
    const { isAuthenticated, userId } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleMockLogin = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'developer@example.com',
                password: 'password123'
            });
            dispatch(loginSuccess(response.data));
        } catch (err) {
            alert('Mock login failed');
        }
    };

    return (
        <nav className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
            <h1 className="text-xl font-bold tracking-wide">🎟️ Concurrency Ticket System</h1>
            <div>
                {isAuthenticated ? (
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-300">User: {userId}</span>
                        <button onClick={() => dispatch(logout())} className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded text-sm transition-colors">
                            Logout
                        </button>
                    </div>
                ) : (
                    <button onClick={handleMockLogin} className="bg-emerald-500 hover:bg-emerald-600 px-4 py-1.5 rounded text-sm font-semibold transition-colors">
                        Trigger Mock Login
                    </button>
                )}
            </div>
        </nav>
    );
}