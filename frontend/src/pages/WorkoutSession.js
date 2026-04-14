import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function WorkoutSession({ darkMode }) {
  const workoutPlans = {
    "Push Day": [
      { name: "Push Ups", sets: 4, reps: 15, completed: false },
      { name: "Bench Press", sets: 3, reps: 10, completed: false },
      { name: "Shoulder Press", sets: 3, reps: 12, completed: false },
      { name: "Tricep Dips", sets: 3, reps: 12, completed: false },
      { name: "Lateral Raises", sets: 3, reps: 15, completed: false },
    ],
    "Pull Day": [
      { name: "Pull Ups", sets: 4, reps: 8, completed: false },
      { name: "Bent Over Rows", sets: 3, reps: 10, completed: false },
      { name: "Lat Pulldown", sets: 3, reps: 12, completed: false },
      { name: "Bicep Curls", sets: 3, reps: 15, completed: false },
      { name: "Face Pulls", sets: 3, reps: 15, completed: false },
    ],
    "Leg Day": [
      { name: "Squats", sets: 4, reps: 12, completed: false },
      { name: "Romanian Deadlift", sets: 3, reps: 10, completed: false },
      { name: "Leg Press", sets: 3, reps: 15, completed: false },
      { name: "Lunges", sets: 3, reps: 12, completed: false },
      { name: "Calf Raises", sets: 4, reps: 20, completed: false },
    ],
    "Cardio Day": [
      { name: "Warm Up Run", sets: 1, reps: 5, completed: false },
      { name: "High Knees", sets: 4, reps: 30, completed: false },
      { name: "Burpees", sets: 3, reps: 15, completed: false },
      { name: "Jump Rope", sets: 4, reps: 50, completed: false },
      { name: "Cool Down Walk", sets: 1, reps: 5, completed: false },
    ],
    "Full Body": [
      { name: "Deadlifts", sets: 3, reps: 8, completed: false },
      { name: "Push Ups", sets: 3, reps: 15, completed: false },
      { name: "Pull Ups", sets: 3, reps: 8, completed: false },
      { name: "Squats", sets: 3, reps: 12, completed: false },
      { name: "Plank", sets: 3, reps: 60, completed: false },
    ],
  };

  const workoutIcons = {
    "Push Day": "💪",
    "Pull Day": "🏋️",
    "Leg Day": "🦵",
    "Cardio Day": "🏃",
    "Full Body": "🔥",
  };

  const [selectedWorkout, setSelectedWorkout] = useState(
    localStorage.getItem("selectedWorkout") || "Push Day"
  );
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [exercises, setExercises] = useState(
    workoutPlans[localStorage.getItem("selectedWorkout") || "Push Day"]
  );
  const [friendActivity, setFriendActivity] = useState([]);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  const bg = darkMode ? "#1a1a1a" : "#f5f5f5";
  const cardBg = darkMode ? "#2a2a2a" : "white";
  const textColor = darkMode ? "#ffffff" : "#333";
  const mutedColor = darkMode ? "#aaaaaa" : "#888";
  const borderColor = darkMode ? "#3a3a3a" : "#f5f5f5";
  const subBg = darkMode ? "#333333" : "#f5f5f5";

  useEffect(() => {
    socket.on("friend_working_out", (data) => {
      setFriendActivity(prev => [
        { ...data, time: new Date().toLocaleTimeString() },
        ...prev.slice(0, 9)
      ]);
    });
    return () => {
      socket.off("friend_working_out");
      clearInterval(intervalRef.current);
    };
  }, []);

  const changeWorkout = (type) => {
    if (isRunning) {
      const confirm = window.confirm("Workout chal rahi hai! Change karna chahte ho?");
      if (!confirm) return;
    }
    setSelectedWorkout(type);
    setExercises(workoutPlans[type].map(e => ({ ...e, completed: false })));
    setSeconds(0);
    setIsRunning(false);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    localStorage.setItem("selectedWorkout", type);
  };

  const startWorkout = () => {
    setIsRunning(true);
    setIsPaused(false);
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    socket.emit("workout_started", { user: user?.name });
  };

  const pauseWorkout = () => {
    if (!isPaused) {
      clearInterval(intervalRef.current);
      setIsPaused(true);
    } else {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
      setIsPaused(false);
    }
  };

  const finishWorkout = async () => {
    if (saving) return;
    setSaving(true);
    clearInterval(intervalRef.current);
    setIsRunning(false);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/workout/create",
        {
          name: selectedWorkout,
          exercises: exercises,
          duration: Math.floor(seconds / 60) || 1
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newStreak = res.data.streak;
      const updatedUser = { ...user, streak: newStreak };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setFinished(true);
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      console.log("Finish error:", err);
      setSaving(false);
      alert("Error saving! Check console.");
    }
  };

  const toggleExercise = (index) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], completed: !updated[index].completed };
      return updated;
    });
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m < 10 ? "0" : ""}${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const progress = Math.round((completedCount / exercises.length) * 100);

  if (finished) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: bg }}>
        <div style={{ background: cardBg, padding: "56px 48px", borderRadius: "20px", textAlign: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <p style={{ fontSize: "72px", margin: "0 0 16px" }}>🔥</p>
          <h2 style={{ color: "#D85A30", margin: "0 0 8px", fontSize: "28px" }}>Workout Complete!</h2>
          <p style={{ color: mutedColor, margin: "0 0 8px" }}>Amazing work! Streak updated!</p>
          <p style={{ fontSize: "14px", color: "#D85A30", fontWeight: "600", margin: "0 0 16px" }}>{selectedWorkout} {workoutIcons[selectedWorkout]}</p>
          <p style={{ fontSize: "40px", fontWeight: "300", color: textColor, margin: "0 0 8px" }}>{formatTime(seconds)}</p>
          <p style={{ color: mutedColor, fontSize: "14px" }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 32px", background: bg, minHeight: "100vh" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, color: textColor, fontSize: "22px" }}>
              {workoutIcons[selectedWorkout]} {selectedWorkout}
            </h2>
            <p style={{ margin: "4px 0 0", color: mutedColor, fontSize: "14px" }}>
              {exercises.length} exercises · Let's go!
            </p>
          </div>
          {isRunning && (
            <div style={{ background: "#EAF3DE", color: "#3B6D11", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#639922" }}></div>
              Live Session
            </div>
          )}
        </div>

        {/* Workout Type Selector */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
          {Object.keys(workoutPlans).map((type) => (
            <button key={type} onClick={() => changeWorkout(type)}
              style={{
                padding: "8px 18px",
                background: selectedWorkout === type ? "#D85A30" : cardBg,
                color: selectedWorkout === type ? "white" : mutedColor,
                border: `1.5px solid ${selectedWorkout === type ? "#D85A30" : borderColor}`,
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                transition: "all 0.2s"
              }}>
              {workoutIcons[type]} {type}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px" }}>

          {/* Left */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Timer Card */}
            <div style={{ background: cardBg, borderRadius: "16px", padding: "32px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ color: mutedColor, margin: "0 0 8px", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>Session Time</p>
              <h1 style={{ fontSize: "72px", color: "#D85A30", margin: "0 0 28px", fontWeight: "300", letterSpacing: "4px" }}>
                {formatTime(seconds)}
              </h1>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                {!isRunning ? (
                  <button onClick={startWorkout}
                    style={{ padding: "14px 48px", background: "#D85A30", color: "white", border: "none", borderRadius: "10px", fontSize: "16px", fontWeight: "500", cursor: "pointer" }}>
                    ▶ Start Workout
                  </button>
                ) : (
                  <>
                    <button onClick={pauseWorkout}
                      style={{ padding: "14px 28px", background: isPaused ? "#D85A30" : subBg, color: isPaused ? "white" : textColor, border: "none", borderRadius: "10px", fontSize: "15px", cursor: "pointer", fontWeight: "500" }}>
                      {isPaused ? "▶ Resume" : "⏸ Pause"}
                    </button>
                    <button onClick={finishWorkout} disabled={saving}
                      style={{ padding: "14px 28px", background: saving ? "#aaa" : "#333", color: "white", border: "none", borderRadius: "10px", fontSize: "15px", cursor: saving ? "not-allowed" : "pointer", fontWeight: "500" }}>
                      {saving ? "Saving..." : "Finish 💪"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div style={{ background: cardBg, borderRadius: "12px", padding: "16px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <span style={{ fontSize: "14px", color: textColor, fontWeight: "500" }}>Progress</span>
                <span style={{ fontSize: "14px", fontWeight: "600", color: "#D85A30" }}>{completedCount}/{exercises.length} done · {progress}%</span>
              </div>
              <div style={{ background: subBg, borderRadius: "20px", height: "10px" }}>
                <div style={{ background: "#D85A30", borderRadius: "20px", height: "10px", width: `${progress}%`, transition: "width 0.4s ease" }}></div>
              </div>
            </div>

            {/* Exercise List */}
            <div style={{ background: cardBg, borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${borderColor}` }}>
                <h3 style={{ margin: 0, fontSize: "15px", color: textColor }}>
                  {workoutIcons[selectedWorkout]} {selectedWorkout} Exercises
                </h3>
              </div>
              {exercises.map((ex, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: i < exercises.length - 1 ? `1px solid ${borderColor}` : "none", background: ex.completed ? (darkMode ? "#222" : "#fafafa") : cardBg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: ex.completed ? "#D85A30" : subBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: ex.completed ? "white" : mutedColor, fontWeight: "600", transition: "all 0.3s" }}>
                      {ex.completed ? "✓" : i + 1}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "500", color: ex.completed ? mutedColor : textColor, textDecoration: ex.completed ? "line-through" : "none", transition: "all 0.3s" }}>{ex.name}</p>
                      <p style={{ margin: "3px 0 0", color: mutedColor, fontSize: "13px" }}>{ex.sets} sets × {ex.reps} reps</p>
                    </div>
                  </div>
                  <button onClick={() => toggleExercise(i)}
                    style={{ padding: "8px 20px", background: ex.completed ? "#D85A30" : subBg, color: ex.completed ? "white" : textColor, border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "13px", fontWeight: "500", transition: "all 0.3s" }}>
                    {ex.completed ? "Done ✓" : "Mark Done"}
                  </button>
                </div>
              ))}
            </div>

          </div>

          {/* Right Side */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Session Stats */}
            <div style={{ background: cardBg, borderRadius: "16px", padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", color: textColor }}>Session Stats</h3>
              {[
                { label: "Workout Type", value: `${workoutIcons[selectedWorkout]} ${selectedWorkout}` },
                { label: "Duration", value: formatTime(seconds) },
                { label: "Exercises Done", value: `${completedCount}/${exercises.length}`, highlight: true },
                { label: "Calories Est.", value: `${Math.round(seconds / 60 * 8)} kcal` },
                { label: "Current Streak", value: `🔥 ${user?.streak || 0} days`, highlight: true },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i < 4 ? `1px solid ${borderColor}` : "none" }}>
                  <span style={{ color: mutedColor, fontSize: "14px" }}>{s.label}</span>
                  <span style={{ fontWeight: "600", color: s.highlight ? "#D85A30" : textColor, fontSize: "14px" }}>{s.value}</span>
                </div>
              ))}
            </div>

            {/* Live Activity */}
            <div style={{ background: cardBg, borderRadius: "16px", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ padding: "18px 24px", borderBottom: `1px solid ${borderColor}`, display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D85A30" }}></div>
                <h3 style={{ margin: 0, fontSize: "15px", color: textColor }}>Live Activity</h3>
              </div>
              {friendActivity.length === 0 ? (
                <div style={{ padding: "32px 24px", textAlign: "center" }}>
                  <p style={{ fontSize: "36px", margin: "0 0 8px" }}>👥</p>
                  <p style={{ color: mutedColor, fontSize: "13px", margin: 0 }}>Start workout to see friends activity!</p>
                </div>
              ) : (
                friendActivity.map((a, i) => (
                  <div key={i} style={{ padding: "14px 20px", borderBottom: `1px solid ${borderColor}`, display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#FAECE7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "600", color: "#993C1D", flexShrink: 0 }}>
                      {a.user?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: "500", fontSize: "13px", color: textColor }}>{a.user}</p>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: mutedColor }}>💪 Started a workout</p>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: mutedColor }}>{a.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutSession;