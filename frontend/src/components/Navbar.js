import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar({ darkMode, setDarkMode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const bg = darkMode ? "#1e1e1e" : "white";
  const mutedColor = darkMode ? "#aaaaaa" : "#555";

  const navLink = (path, label) => (
    <Link to={path} style={{
      textDecoration: "none",
      color: location.pathname === path ? "#D85A30" : mutedColor,
      fontWeight: location.pathname === path ? "600" : "500",
      fontSize: "15px",
      padding: "6px 12px",
      borderRadius: "8px",
      background: location.pathname === path ? "#FAECE7" : "transparent"
    }}>{label}</Link>
  );

  return (
    <nav style={{
      background: bg,
      padding: "14px 32px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      boxShadow: darkMode ? "0 1px 4px rgba(0,0,0,0.4)" : "0 1px 4px rgba(0,0,0,0.08)",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <Link to="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "20px" }}>🔥</span>
        <h2 style={{ color: "#D85A30", margin: 0, fontSize: "20px", fontWeight: "700" }}>Tejas</h2>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {navLink("/dashboard", "Dashboard")}
        {navLink("/workout", "Workout")}
        {navLink("/profile", "Profile")}
        {navLink("/nutrition", "Nutrition 🥗")}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Dark Mode Toggle */}
        <div onClick={() => setDarkMode(!darkMode)}
          style={{
            width: "56px",
            height: "28px",
            borderRadius: "20px",
            background: darkMode ? "#D85A30" : "#ddd",
            cursor: "pointer",
            position: "relative",
            transition: "background 0.3s"
          }}>
          <div style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            background: "white",
            position: "absolute",
            top: "3px",
            left: darkMode ? "30px" : "3px",
            transition: "left 0.3s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px"
          }}>
            {darkMode ? "🌙" : "☀️"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#FAECE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            color: "#D85A30",
            fontSize: "13px"
          }}>
            {user?.name?.charAt(0)}
          </div>
          <span style={{ color: mutedColor, fontSize: "14px" }}>Hi, {user?.name?.split(" ")[0]}!</span>
        </div>

        <button onClick={handleLogout}
          style={{
            padding: "8px 18px",
            background: "#D85A30",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500"
          }}>
          Logout
        </button>
      </div>
    </nav>
  );
}

export default Navbar;