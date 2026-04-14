import { useState, useEffect } from "react";
import axios from "axios";

function Profile({ darkMode }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [workouts, setWorkouts] = useState([]);
  const [streak, setStreak] = useState({ currentStreak: 0, bestStreak: 0 });
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(localStorage.getItem("userBio") || "Fitness enthusiast 💪");
  const [goal, setGoal] = useState(localStorage.getItem("userGoal") || "Build muscle");
  const [saved, setSaved] = useState(false);
  const token = localStorage.getItem("token");

  const bg = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBg = darkMode ? "#2a2a2a" : "white";
  const textColor = darkMode ? "#ffffff" : "#333";
  const mutedColor = darkMode ? "#aaaaaa" : "#888";
  const borderColor = darkMode ? "#3a3a3a" : "#f0f0f0";

  useEffect(() => {
    fetchWorkouts();
    fetchStreak();
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

  const saveProfile = () => {
    localStorage.setItem("userBio", bio);
    localStorage.setItem("userGoal", goal);
    const updatedUser = { ...user, name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const completedWorkouts = workouts.filter(w => w.completed).length;
  const totalMinutes = workouts.reduce((acc, w) => acc + (w.duration || 0), 0);

  const workoutTypes = workouts.reduce((acc, w) => {
    acc[w.name] = (acc[w.name] || 0) + 1;
    return acc;
  }, {});

  const favoriteWorkout = Object.keys(workoutTypes).length > 0
    ? Object.keys(workoutTypes).reduce((a, b) => workoutTypes[a] > workoutTypes[b] ? a : b)
    : "None yet";

  const goals = ["Build muscle", "Lose weight", "Stay fit", "Improve endurance", "Build strength"];

  const achievements = [
    { icon: "🔥", title: "First Workout", desc: "Completed your first workout!", unlocked: completedWorkouts >= 1 },
    { icon: "💪", title: "5 Workouts", desc: "Completed 5 workouts!", unlocked: completedWorkouts >= 5 },
    { icon: "🏆", title: "10 Workouts", desc: "Completed 10 workouts!", unlocked: completedWorkouts >= 10 },
    { icon: "⚡", title: "3 Day Streak", desc: "3 days in a row!", unlocked: streak.bestStreak >= 3 },
    { icon: "🌟", title: "7 Day Streak", desc: "7 days in a row!", unlocked: streak.bestStreak >= 7 },
    { icon: "👑", title: "30 Day Streak", desc: "30 days in a row!", unlocked: streak.bestStreak >= 30 },
  ];

  return (
    <div style={{ padding: "28px 32px", background: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "20px" }}>

        {/* Profile Header Card */}
        <div style={{ background: cardBg, borderRadius: "16px", padding: "32px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "24px" }}>

            {/* Avatar */}
            <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "#D85A30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "600", color: "white", flexShrink: 0 }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <input value={name} onChange={e => setName(e.target.value)}
                    style={{ padding: "10px 14px", border: `1.5px solid ${borderColor}`, borderRadius: "8px", fontSize: "16px", background: bg, color: textColor, outline: "none" }}
                    placeholder="Your name" />
                  <textarea value={bio} onChange={e => setBio(e.target.value)} rows={2}
                    style={{ padding: "10px 14px", border: `1.5px solid ${borderColor}`, borderRadius: "8px", fontSize: "14px", background: bg, color: textColor, outline: "none", resize: "none" }}
                    placeholder="Your bio..." />
                  <select value={goal} onChange={e => setGoal(e.target.value)}
                    style={{ padding: "10px 14px", border: `1.5px solid ${borderColor}`, borderRadius: "8px", fontSize: "14px", background: bg, color: textColor, outline: "none" }}>
                    {goals.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button onClick={saveProfile}
                      style={{ padding: "10px 24px", background: "#D85A30", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
                      Save Changes
                    </button>
                    <button onClick={() => setEditing(false)}
                      style={{ padding: "10px 24px", background: "transparent", color: mutedColor, border: `1.5px solid ${borderColor}`, borderRadius: "8px", cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
                    <h2 style={{ margin: 0, fontSize: "24px", color: textColor }}>{user?.name}</h2>
                    {saved && <span style={{ fontSize: "12px", color: "#3B6D11", background: "#EAF3DE", padding: "3px 10px", borderRadius: "20px" }}>✓ Saved!</span>}
                  </div>
                  <p style={{ margin: "0 0 6px", color: mutedColor, fontSize: "14px" }}>{user?.email}</p>
                  <p style={{ margin: "0 0 10px", color: darkMode ? "#cccccc" : "#555", fontSize: "14px" }}>{bio}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                    <span style={{ background: "#FAECE7", color: "#993C1D", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "500" }}>🎯 {goal}</span>
                    <span style={{ background: "#EAF3DE", color: "#3B6D11", padding: "4px 12px", borderRadius: "20px", fontSize: "13px", fontWeight: "500" }}>🔥 {streak.currentStreak} day streak</span>
                  </div>
                  <button onClick={() => setEditing(true)}
                    style={{ padding: "8px 20px", background: "transparent", color: "#D85A30", border: "1.5px solid #D85A30", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500" }}>
                    ✏️ Edit Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
          {[
            { icon: "💪", label: "Total Workouts", value: completedWorkouts },
            { icon: "🔥", label: "Best Streak", value: `${streak.bestStreak} days` },
            { icon: "⏱️", label: "Total Minutes", value: `${totalMinutes} min` },
            { icon: "🏋️", label: "Fav Workout", value: favoriteWorkout },
          ].map((stat, i) => (
            <div key={i} style={{ background: cardBg, borderRadius: "14px", padding: "18px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: "28px", margin: "0 0 6px" }}>{stat.icon}</p>
              <p style={{ margin: "0 0 4px", color: mutedColor, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{stat.label}</p>
              <p style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: textColor }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Achievements */}
        <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 20px", fontSize: "16px", color: textColor }}>🏆 Achievements</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
            {achievements.map((a, i) => (
              <div key={i} style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1.5px solid ${a.unlocked ? "#D85A30" : borderColor}`,
                background: a.unlocked ? (darkMode ? "#3a1a0a" : "#FFF8F6") : (darkMode ? "#222" : "#fafafa"),
                opacity: a.unlocked ? 1 : 0.5,
                textAlign: "center"
              }}>
                <p style={{ fontSize: "28px", margin: "0 0 6px" }}>{a.icon}</p>
                <p style={{ margin: "0 0 4px", fontWeight: "600", color: a.unlocked ? "#D85A30" : mutedColor, fontSize: "13px" }}>{a.title}</p>
                <p style={{ margin: 0, color: mutedColor, fontSize: "11px" }}>{a.desc}</p>
                {a.unlocked && <p style={{ margin: "6px 0 0", fontSize: "11px", color: "#3B6D11", fontWeight: "500" }}>✓ Unlocked!</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Workouts */}
        <div style={{ background: cardBg, borderRadius: "16px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: "16px", color: textColor }}>📋 Recent Workouts</h3>
          {workouts.length === 0 ? (
            <p style={{ color: mutedColor, textAlign: "center", padding: "20px 0" }}>No workouts yet — start your first one!</p>
          ) : (
            workouts.slice(0, 5).map((w, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < Math.min(workouts.length, 5) - 1 ? `1px solid ${borderColor}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>
                    {w.name === "Push Day" ? "💪" : w.name === "Pull Day" ? "🏋️" : w.name === "Leg Day" ? "🦵" : w.name === "Cardio Day" ? "🏃" : "🔥"}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontWeight: "500", color: textColor, fontSize: "14px" }}>{w.name}</p>
                    <p style={{ margin: "2px 0 0", color: mutedColor, fontSize: "12px" }}>
                      {new Date(w.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: "13px", color: "#D85A30", fontWeight: "500" }}>{w.duration || 0} min</p>
                  <p style={{ margin: "2px 0 0", fontSize: "11px", color: mutedColor }}>{w.completed ? "✅ Completed" : "⏳ Pending"}</p>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;