# 🎟️ Real-Time Concurrent Event Seat Reservation System

A production-grade full-stack implementation of a concurrent event ticket booking application focused on high-availability seat locking and booking confirmation. Built using the **MERN Stack (Node.js, Express, MongoDB, React)** along with **Vite**, **Tailwind CSS**, and **JWT Authentication**.

---

# 📌 Assignment Objective

Build a simplified event ticket booking flow focused on seat reservation and booking confirmation while preventing double booking in concurrent environments.

The application allows users to:

- Browse available events.
- View event seat layouts.
- Reserve multiple seats for a limited duration.
- Confirm bookings before reservation expiry.
- Receive real-time feedback when seats become unavailable.
- Experience a clean and responsive user interface.

---

# 🚀 Features

## Backend Features

- Retrieve all available events.
- Retrieve a single event with seat details.
- Reserve multiple seats for 10 minutes.
- Confirm bookings.
- JWT-based basic authentication.
- Input validation and error handling.
- Prevent double booking using MongoDB transactions.
- Automatic expiration of reservations.
- Release expired reserved seats automatically.

## Frontend Features

- Responsive React UI.
- Event listing page.
- Event details page with seat grid.
- Color-coded seat statuses.
- Multiple seat selection.
- Reservation countdown timer.
- Booking confirmation.
- Real-time seat synchronization.
- User-friendly success and error messages.

---

# 🏗️ Architecture & Design Decisions

## 1. Double Booking Prevention

To prevent race conditions when multiple users try to reserve the same seats simultaneously, the application uses:

- MongoDB Session Transactions
- Atomic Conditional Updates

### Reservation Process

When `/api/reserve` is called:

- The selected seats are filtered using:
  - `eventId`
  - `seatNumber`
  - `status: "available"`

- All seat updates occur inside a MongoDB transaction.

- If even one seat is already reserved/booked by another user:

  - The update count becomes invalid.
  - The transaction is aborted.
  - No seats are reserved.

### Result

✅ All requested seats are reserved successfully.

OR

❌ No seats are reserved.

This completely prevents double booking.

---

## 2. Reservation Expiration

Reservations remain active for 10 minutes.

Each reservation stores:

```javascript
expiresAt
```

Once expired:

- The reservation becomes invalid.
- Expired seats are released back to `"available"` status.
- Booking attempts using expired reservations fail.

---

# 🛠️ Technology Stack

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- MongoDB Transactions

## Frontend

- React.js
- Vite
- Axios
- Tailwind CSS
- React Hooks

---

# 📂 Project Structure

```text
sortmyscene/
│
├── .git/
│
├── ticketing-backend/
│   ├── config/            # Database configuration
│   ├── middleware/        # JWT authentication middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── node_modules/
│   ├── .env
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── server.js          # Backend entry point
│
├── ticketing-frontend/
│   ├── public/            # Static assets
│   ├── src/               # React application source code
│   ├── node_modules/
│   ├── .gitignore
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── README.md
│   └── vite.config.js
│
└── README.md
```

---

# 📡 API Endpoints

## 🔐 Authentication

### Login

| Method | Endpoint |
|----------|-----------|
| POST | `/api/auth/login` |

Request Body:

```json
{
  "email": "reviewer@example.com",
  "password": "123456"
}
```

Response:

```json
{
  "token": "jwt_token",
  "userId": "reviewer@example.com"
}
```

---

## 📅 Events

### Get All Events

| Method | Endpoint |
|----------|-----------|
| GET | `/api/events` |

Description:

Returns all available events.

---

### Get Event Details

| Method | Endpoint |
|----------|-----------|
| GET | `/api/events/:id` |

Description:

Returns a single event along with its seat layout.

---

## 🎟️ Reservations

### Reserve Seats

| Method | Endpoint |
|----------|-----------|
| POST | `/api/reserve` |

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Request Body:

```json
{
  "eventId": "EVENT_ID",
  "seatNumbers": ["S1", "S2"]
}
```

Response:

```json
{
  "message": "Seats reserved successfully",
  "reservationId": "RESERVATION_ID",
  "expiresAt": "2026-06-18T15:30:00Z"
}
```

---

## ✅ Bookings

### Confirm Booking

| Method | Endpoint |
|----------|-----------|
| POST | `/api/bookings` |

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Request Body:

```json
{
  "reservationId": "RESERVATION_ID"
}
```

Response:

```json
{
  "message": "Booking confirmed successfully"
}
```

---

# 👤 Authentication Design

To satisfy the assignment requirement of **Basic User Authentication**, a lightweight login mechanism was implemented.

Reviewers are not required to register users manually.

Any valid email and password combination generates a JWT token.

Example:

```json
{
  "email": "reviewer@example.com",
  "password": "123456"
}
```

Example Implementation:

```javascript
router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
        const token = jwt.sign(
            { userId: email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({
            token,
            userId: email
        });
    }

    return res.status(400).json({
        message: "Invalid credentials"
    });
});
```

---

# 💺 Seat Status Legend

| Status | Meaning |
|----------|-----------|
| 🟢 Available | Seat can be selected |
| 🟡 Reserved | Temporarily locked |
| 🔴 Booked | Permanently booked |

---

# 🔄 Application Flow

## 1. Login

- User enters email and password.
- JWT token is generated.

## 2. View Events

Frontend calls:

```http
GET /api/events
```

All events are displayed.

---

## 3. Select Event

Frontend calls:

```http
GET /api/events/:id
```

Seat layout is displayed.

---

## 4. Reserve Seats

User selects seats.

Frontend calls:

```http
POST /api/reserve
```

Reservation timer starts.

---

## 5. Confirm Booking

Frontend calls:

```http
POST /api/bookings
```

Booking succeeds if reservation is still active.

---

## 6. Handle Errors

The application displays errors when:

- Seats become unavailable.
- Reservation expires.
- Booking fails.
- Authentication fails.

---

# ⚙️ Environment Variables

## Backend (.env)

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret
```

Create `.env.example`

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret
```

---

## Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
```

Create `.env.example`

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 🚀 Installation & Setup

## Prerequisites

Make sure you have installed:

- Node.js (v18+ recommended)
- npm
- MongoDB Community Server

---

# Backend Installation

Navigate to backend folder:

```bash
cd ticketing-backend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/event-booking
JWT_SECRET=your_jwt_secret
```

Start backend server:

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Backend runs at:

```text
http://localhost:5000
```

---

# Frontend Installation

Navigate to frontend folder:

```bash
cd ticketing-frontend
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

---

# ▶️ Running the Application

Open three terminals.

### Terminal 1

Start MongoDB.

---

### Terminal 2

Run Backend

```bash
cd ticketing-backend
npm run dev
```

---

### Terminal 3

Run Frontend

```bash
cd ticketing-frontend
npm run dev
```

---

Open the application:

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5000
```

---

# 🧪 Testing Using Postman

## Login

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "reviewer@example.com",
  "password": "123456"
}
```

Copy the JWT token.

---

## Get Events

```http
GET /api/events
```

Copy an Event ID.

---

## Reserve Seats

```http
POST /api/reserve
```

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Body:

```json
{
  "eventId": "EVENT_ID",
  "seatNumbers": ["S1", "S2"]
}
```

Copy the Reservation ID.

---

## Confirm Booking

```http
POST /api/bookings
```

Headers:

```text
Authorization: Bearer <JWT_TOKEN>
```

Body:

```json
{
  "reservationId": "RESERVATION_ID"
}
```

---

# 📝 Assumptions

- Basic authentication is intentionally simplified for assignment evaluation.
- Any valid email/password combination can generate a JWT.
- Reservations expire after 10 minutes.
- Expired reservations cannot be booked.
- Reserved seats become available again after expiration.
- Frontend periodically refreshes seat status.

---

# 🎯 Design Decisions Summary

- MongoDB transactions guarantee atomic reservations.
- Conditional updates eliminate double booking.
- Reservation expiry prevents indefinite seat locking.
- JWT secures protected endpoints.
- React Hooks manage component state efficiently.
- Tailwind CSS provides responsive UI development.
- Clear API separation improves maintainability.

---

# 🙏 Conclusion

This project demonstrates the implementation of a real-world concurrent ticket booking workflow using the MERN stack. The focus was on delivering a reliable, scalable, and user-friendly solution while ensuring seat consistency through transactional booking logic and robust error handling.
