import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function Dashboard({ darkMode }) {
  const [workouts, setWorkouts] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });
  const [leaderboard, setLeaderboard] = useState([]);
  const [selectedWorkout, setSelectedWorkout] = useState("Push Day");
  const [liveActivity, setLiveActivity] = useState([
    { user: "Priya Singh", action: "Started workout just now", time: "just now" },
    { user: "Amit Kumar", action: "Completed 7 day streak!", time: "2 min ago" },
    { user: "Neha Gupta", action: "5 day streak ongoing!", time: "5 min ago" },
  ]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const workoutPlans = {
    "Push Day": [
      { name: "Push Ups", sets: 4, reps: 15 },
      { name: "Bench Press", sets: 3, reps: 10 },
      { name: "Shoulder Press", sets: 3, reps: 12 },
      { name: "Tricep Dips", sets: 3, reps: 12 },
      { name: "Lateral Raises", sets: 3, reps: 15 },
    ],
    "Pull Day": [
      { name: "Pull Ups", sets: 4, reps: 8 },
      { name: "Bent Over Rows", sets: 3, reps: 10 },
      { name: "Lat Pulldown", sets: 3, reps: 12 },
      { name: "Bicep Curls", sets: 3, reps: 15 },
      { name: "Face Pulls", sets: 3, reps: 15 },
    ],
    "Leg Day": [
      { name: "Squats", sets: 4, reps: 12 },
      { name: "Romanian Deadlift", sets: 3, reps: 10 },
      { name: "Leg Press", sets: 3, reps: 15 },
      { name: "Lunges", sets: 3, reps: 12 },
      { name: "Calf Raises", sets: 4, reps: 20 },
    ],
    "Cardio Day": [
      { name: "Warm Up Run", sets: 1, reps: 5 },
      { name: "High Knees", sets: 4, reps: 30 },
      { name: "Burpees", sets: 3, reps: 15 },
      { name: "Jump Rope", sets: 4, reps: 50 },
      { name: "Cool Down Walk", sets: 1, reps: 5 },
    ],
    "Full Body": [
      { name: "Deadlifts", sets: 3, reps: 8 },
      { name: "Push Ups", sets: 3, reps: 15 },
      { name: "Pull Ups", sets: 3, reps: 8 },
      { name: "Squats", sets: 3, reps: 12 },
      { name: "Plank", sets: 3, reps: 60 },
    ],
  };

  const workoutIcons = {
    "Push Day": "💪",
    "Pull Day": "🏋️",
    "Leg Day": "🦵",
    "Cardio Day": "🏃",
    "Full Body": "🔥",
  };

  const workoutSubtitles = {
    "Push Day": "Upper Body",
    "Pull Day": "Back & Biceps",
    "Leg Day": "Lower Body",
    "Cardio Day": "Cardio & HIIT",
    "Full Body": "Full Body",
  };

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  };

  useEffect(() => {
    fetchWorkouts();
    fetchStreak();
    fetchLeaderboard();
    socket.on("friend_working_out", (data) => {
      setLiveActivity(prev => [
        { user: data.user, action: "Started a workout!", time: "just now" },
        ...prev.slice(0, 4)
      ]);
    });
    return () => socket.off("friend_working_out");
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/workout/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkouts(res.data);
    } catch (err) { console.log(err); }
  };

  const fetchStreak = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/streak/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStreak(res.data || { currentStreak: 0, bestStreak: 0 });
    } catch (err) { console.log(err); }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/workout/leaderboard", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeaderboard(res.data);
    } catch (err) { console.log(err); }
  };

  const completedWorkouts = workouts.filter(w => w.completed).length;
  
  // ✅ TODAY'S CALORIES (not all-time)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayWorkouts = workouts.filter(w => {
    const workoutDate = new Date(w.date);
    workoutDate.setHours(0, 0, 0, 0);
    return workoutDate.getTime() === today.getTime() && w.completed;
  });
  
  const todayCalories = todayWorkouts.reduce((acc, w) => acc + ((w.duration || 30) * 8), 0);
  
  const thisMonthWorkouts = workouts.filter(w => {
    const d = new Date(w.date);
    const now = new Date();
    return d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear() &&
      w.completed;
  }).length;
  const consistency = workouts.length > 0
    ? Math.round((completedWorkouts / workouts.length) * 100)
    : 0;

  // ✅ CURRENT WEEK DATA (not all-time, future days = 0)
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 1 = Monday
  
  // Calculate start of current week (Monday)
  const startOfWeek = new Date(now);
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weekData = days.map((day, index) => {
    // Calculate date for this day in current week
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + index);
    
    // Check if this day is in the future
    const isFuture = targetDate > now;
    
    // Count workouts for this specific date
    const workoutCount = workouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.toDateString() === targetDate.toDateString() && w.completed;
    }).length;
    
    return {
      day,
      workouts: isFuture ? 0 : workoutCount,
      isFuture
    };
  });

  const cardStyle = {
    background: darkMode ? "#2a2a2a" : "white",
    borderRadius: "14px",
    padding: "20px 24px",
    boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
    color: darkMode ? "#ffffff" : "#333"
  };

  const textMuted = darkMode ? "#aaaaaa" : "#888";
  const borderColor = darkMode ? "#3a3a3a" : "#f5f5f5";
  const subBg = darkMode ? "#1a1a1a" : "#f5f5f5";

  return (
    <div style={{ padding: "28px 32px", background: darkMode ? "#1a1a1a" : "#f5f5f5", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "22px", color: darkMode ? "#ffffff" : "#333" }}>
              {getGreeting()}, {user?.name}! 👋
            </h2>
            <p style={{ margin: "4px 0 0", color: textMuted }}>
              Let's crush your fitness goals today!
            </p>
          </div>
          <div style={{ background: "#FAECE7", borderRadius: "12px", padding: "14px 20px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: "22px", fontWeight: "600", color: "#D85A30" }}>
              🔥 {streak.currentStreak} days
            </p>
            <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#993C1D" }}>
              Best: {streak.bestStreak} days
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "20px" }}>
          {[
            { icon: "💪", label: "Total Workouts", value: completedWorkouts, sub: `+${thisMonthWorkouts} this month` },
            { icon: "🔥", label: "Today's Calories", value: todayCalories.toLocaleString(), sub: "today's workout" },
            { icon: "🏆", label: "Best Streak", value: `${streak.bestStreak} days`, sub: "personal best" },
            { icon: "📈", label: "Consistency", value: `${consistency}%`, sub: consistency >= 80 ? "Excellent!" : consistency >= 50 ? "Good!" : "Keep going!" },
          ].map((card, i) => (
            <div key={i} style={{ ...cardStyle, textAlign: "center" }}>
              <p style={{ fontSize: "28px", margin: "0 0 8px" }}>{card.icon}</p>
              <p style={{ margin: "0 0 4px", color: textMuted, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {card.label}
              </p>
              <p style={{ margin: "0 0 4px", fontSize: "24px", fontWeight: "600", color: darkMode ? "#ffffff" : "#333" }}>
                {card.value}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: textMuted }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Middle Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "16px", marginBottom: "20px" }}>

          {/* Today's Workout */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>🔥</span>
                <h3 style={{ margin: 0, fontSize: "16px", color: darkMode ? "#ffffff" : "#333" }}>Today's Workout</h3>
              </div>
            </div>

            {/* Workout Type Selector */}
            <div style={{ display: "flex", gap: "6px", marginBottom: "16px", flexWrap: "wrap" }}>
              {Object.keys(workoutPlans).map((type) => (
                <button key={type} onClick={() => setSelectedWorkout(type)}
                  style={{
                    padding: "6px 12px",
                    background: selectedWorkout === type ? "#D85A30" : (darkMode ? "#3a3a3a" : "#f5f5f5"),
                    color: selectedWorkout === type ? "white" : (darkMode ? "#aaa" : "#555"),
                    border: `1.5px solid ${selectedWorkout === type ? "#D85A30" : (darkMode ? "#444" : "#eee")}`,
                    borderRadius: "20px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: "500",
                    transition: "all 0.2s"
                  }}>
                  {workoutIcons[type]} {type}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: "12px" }}>
              <p style={{ margin: "0 0 4px", fontWeight: "600", color: darkMode ? "#ffffff" : "#333" }}>
                {workoutIcons[selectedWorkout]} {selectedWorkout} — {workoutSubtitles[selectedWorkout]}
              </p>
              <p style={{ margin: 0, color: textMuted, fontSize: "13px" }}>
                {workoutPlans[selectedWorkout].length} exercises · 45 minutes
              </p>
            </div>

            {workoutPlans[selectedWorkout].map((ex, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: i < workoutPlans[selectedWorkout].length - 1 ? `1px solid ${borderColor}` : "none" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `1.5px solid ${darkMode ? "#555" : "#ddd"}`, flexShrink: 0 }}></div>
                <span style={{ fontSize: "14px", color: darkMode ? "#cccccc" : "#555" }}>
                  {ex.name} {ex.sets}×{ex.reps}
                </span>
                <span style={{ marginLeft: "auto", fontSize: "12px", color: textMuted, background: subBg, padding: "2px 8px", borderRadius: "20px" }}>
                  Pending
                </span>
              </div>
            ))}

            <button
              onClick={() => {
                localStorage.setItem("selectedWorkout", selectedWorkout);
                navigate("/workout");
              }}
              style={{ width: "100%", marginTop: "16px", padding: "14px", background: "#D85A30", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: "500", cursor: "pointer" }}>
              ▶ Start {selectedWorkout}
            </button>
          </div>

          {/* Live Activity Feed */}
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D85A30" }}></div>
              <h3 style={{ margin: 0, fontSize: "16px", color: darkMode ? "#ffffff" : "#333" }}>Live Activity Feed</h3>
            </div>
            {liveActivity.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start", padding: "12px 0", borderBottom: i < liveActivity.length - 1 ? `1px solid ${borderColor}` : "none" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#993C1D", flexShrink: 0 }}>
                  {a.user.charAt(0)}
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: "500", fontSize: "14px", color: darkMode ? "#ffffff" : "#333" }}>{a.user}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "13px", color: textMuted }}>💪 {a.action}</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: darkMode ? "#666" : "#bbb" }}>{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Chart */}
        <div style={{ ...cardStyle, marginBottom: "20px" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: darkMode ? "#ffffff" : "#333" }}>📊 Weekly Consistency</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weekData}>
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: darkMode ? "#aaa" : "#666" }} />
              <YAxis hide />
              <Tooltip contentStyle={{ background: darkMode ? "#2a2a2a" : "white", border: "none", color: darkMode ? "#fff" : "#333" }} />
              <Bar dataKey="workouts" radius={[6, 6, 0, 0]}>
                {weekData.map((entry, i) => (
                  <Cell key={i} fill={entry.workouts > 0 ? "#D85A30" : darkMode ? "#3a3a3a" : "#f0f0f0"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "8px" }}>
            {weekData.map((d, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <span style={{ fontSize: "16px" }}>{d.workouts > 0 ? "✅" : "❌"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: darkMode ? "#ffffff" : "#333" }}>🏆 Leaderboard — This Week</h3>
          {leaderboard.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0" }}>
              <p style={{ fontSize: "36px", margin: "0 0 8px" }}>🏆</p>
              <p style={{ color: textMuted }}>Complete a workout to appear on leaderboard!</p>
            </div>
          ) : (
            leaderboard.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "12px", borderBottom: i < leaderboard.length - 1 ? `1px solid ${borderColor}` : "none", background: u.name === user?.name ? (darkMode ? "#3a2a1a" : "#FFF8F6") : "transparent", borderRadius: "8px" }}>
                <span style={{ fontSize: "20px", width: "28px", textAlign: "center" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                </span>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "600", color: "#993C1D" }}>
                  {u.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontWeight: "500", color: darkMode ? "#ffffff" : "#333" }}>
                    {u.name} {u.name === user?.name ? "(You)" : ""}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: "12px", color: textMuted }}>
                    🔥 {u.streak} day streak
                  </p>
                </div>
                <span style={{ color: "#D85A30", fontWeight: "600" }}>
                  {"🔥".repeat(Math.min(u.streak, 3))}
                </span>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;