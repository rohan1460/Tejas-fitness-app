import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      setError("Wrong email or password!");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f5f5" }}>
      <div style={{ background: "white", padding: "40px", borderRadius: "12px", width: "360px", boxShadow: "0 2px 12px rgba(0,0,0,0.1)" }}>
        <h1 style={{ color: "#D85A30", marginBottom: "8px" }}>⚡ Tejas</h1>
        <p style={{ color: "#888", marginBottom: "24px" }}>Welcome back, warrior!</p>
        {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "12px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "12px", marginBottom: "16px", borderRadius: "8px", border: "1px solid #ddd", boxSizing: "border-box" }} />
        <button onClick={handleLogin}
          style={{ width: "100%", padding: "12px", background: "#D85A30", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", cursor: "pointer" }}>
          Login
        </button>
        <p style={{ textAlign: "center", marginTop: "16px", color: "#888" }}>
          New here? <Link to="/signup" style={{ color: "#D85A30" }}>Create account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;