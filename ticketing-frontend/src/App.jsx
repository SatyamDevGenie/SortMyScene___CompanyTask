import React from 'react';

function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-100 p-6">
      <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl transition-all hover:scale-105">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">
          Tailwind is Working! 🎉
        </h1>
        <p className="text-slate-600 mb-6">
          If you see a centered white card with a blue title, rounded corners, and a shadow, your Tailwind CSS setup is successful.
        </p>
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
          Test Button Effect
        </button>
      </div>
    </div>
  );
}

export default App;