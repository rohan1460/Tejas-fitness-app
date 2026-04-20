<div align="center">

# ⚡ Tejas — Smart Fitness Tracker

**AI-powered fitness tracking with real-time workouts, nutrition, and streaks**

![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-Realtime-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LLaMA_3.3-F55036?style=for-the-badge)

</div>

---

## 📸 Overview

Tejas is a full-stack fitness web application that helps users track workouts, monitor nutrition, and stay consistent with their fitness goals. It features an AI fitness coach that responds in Hinglish, real-time live activity feed, and accurate calorie calculations based on your body weight and age.

---

## ✨ Features

### 💪 Workout Tracking
- 5 pre-built workout plans — Push, Pull, Leg, Cardio, Full Body
- Live session timer with pause/resume
- Mark exercises as done in real-time
- Progress bar tracking per session

### 🔥 Calorie Calculation (MET-Based)
- Accurate calories burned using **MET × Weight × Age formula**
- Personalized to your body weight (kg) and age
- Updates **live every second** during workout
- Different MET values per workout type (Cardio = 9.5, Leg = 6.0, Push/Pull = 5.0)

### 🥗 Nutrition Tracking
- Log meals with AI-powered macro calculation (calories, protein, carbs, fats)
- Indian food support — Dal, Roti, Chaas, Paneer, etc.
- Daily water intake tracker (8 glasses goal)
- Animated calorie ring with daily goal progress

### 🤖 AI Fitness Coach
- Powered by **Groq API (LLaMA 3.3-70B)**
- Responds in **Hinglish** (Hindi + English)
- Covers: exercises, diet, supplements, injury recovery, workout plans
- Floating chat interface accessible from any page

### 🏆 Streak & Leaderboard
- 48-hour streak window logic
- Best streak tracking
- Top 10 leaderboard sorted by current streak
- Real-time updates via Socket.io

### 📊 Dashboard
- Weekly consistency bar chart
- Today's calories, total workouts, consistency % 
- Live activity feed (friends working out)
- Greeting based on time of day

### 👤 Profile & Achievements
- Edit name, bio, goal, weight, age
- 6 achievement badges (First Workout → 30 Day Streak)
- Recent workout history
- Favorite workout type tracker

### 🎨 3D Animated UI
- Glassmorphism dark theme (`#030309` background)
- Neon orange (`#ff6b35`) accent with glow effects
- CSS 3D hover tilts (`perspective + rotateX`)
- Particle background on login/signup
- Shimmer progress bars, floating card animations
- Smooth `fadeInUp` page transitions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, React Router v7, Recharts |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas (Mongoose) |
| Auth | JWT + Bcryptjs |
| Real-time | Socket.io |
| AI | Groq API — LLaMA 3.3-70B |
| Scheduling | node-cron |
| Styling | CSS3 (Glassmorphism + Animations) |

---

## 📁 Project Structure

```
TEJAS/
├── backend/
│   ├── models/
│   │   ├── User.js          # weight, age, streak, reminders
│   │   ├── Workout.js       # exercises, duration, calories
│   │   ├── Nutrition.js     # meals, macros, water
│   │   └── Streak.js        # currentStreak, bestStreak
│   ├── routes/
│   │   ├── auth.js          # login, signup, update-profile
│   │   ├── workout.js       # CRUD + leaderboard
│   │   ├── nutrition.js     # meals + water
│   │   ├── chat.js          # Groq AI coach
│   │   ├── streak.js        # streak management
│   │   └── reminder.js      # cron-based reminders
│   ├── middleware/
│   │   └── authMiddleware.js
│   └── server.js
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Login.js
        │   ├── Signup.js
        │   ├── Dashboard.js
        │   ├── WorkoutSession.js
        │   ├── Nutrition.js
        │   └── Profile.js
        └── components/
            ├── Navbar.js
            └── FitnessBot.js
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account
- Groq API key

### 1. Clone the repo
```bash
git clone https://github.com/rohan1460/Tejas-fitness-app.git
cd Tejas-fitness-app
```

### 2. Backend setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
PORT=5000
GROQ_API_KEY=your_groq_api_key
```

Start backend:
```bash
node server.js
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm start
```

App opens at **http://localhost:3000**

> **Note:** Start backend first, then frontend.

---

## 🧮 Calorie Formula

```
Calories/min = (MET × weight_kg × 3.5) / 200
Age Factor   = 1 - (age - 20) × 0.004   [for age > 20]
Total        = Calories/min × minutes × Age Factor
```

| Workout | MET Value |
|---------|-----------|
| Cardio Day | 9.5 |
| Leg Day | 6.0 |
| Full Body | 5.5 |
| Push Day | 5.0 |
| Pull Day | 5.0 |

---

## 👨‍💻 Developer

**Rohan Sharma**
GitHub: [@rohan1460](https://github.com/rohan1460)

---

<div align="center">
Built with ⚡ for fitness warriors
</div>
