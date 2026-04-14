import { useEffect } from "react";

function PushNotification() {

  useEffect(() => {
    requestPermission();
    scheduleReminder();
  }, []);

  const requestPermission = async () => {
    if ("Notification" in window) {
      await Notification.requestPermission();
    }
  };

  const sendNotification = (title, body) => {
    if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "https://img.icons8.com/emoji/48/fire.png",
      });
    }
  };

  const scheduleReminder = () => {
    const now = new Date();
    const lastWorkout = localStorage.getItem("lastWorkoutDate");
    const today = now.toDateString();

    if (lastWorkout !== today) {
      setTimeout(() => {
        sendNotification(
          "🔥 Tejas — Workout Reminder!",
          "Aaj ka workout abhi tak nahi kiya! Chalo shuru karte hain 💪"
        );
      }, 10000);
    }

    const morning = new Date();
    morning.setHours(7, 0, 0, 0);
    if (now < morning) {
      const timeUntilMorning = morning - now;
      setTimeout(() => {
        sendNotification(
          "🌅 Good Morning! Tejas",
          "Aaj ka workout plan ready hai! Start karo 🚀"
        );
      }, timeUntilMorning);
    }
  };

  return null;
}

export default PushNotification;