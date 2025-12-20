// session -C
import React, { useState, createContext, useContext } from "react";
import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import axios from "axios";

// ---------------- AUTH CONTEXT ----------------
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

// ---------------- PROTECTED ROUTE ----------------
export function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/signin" />;
  return children;
}

// ---------------- HEADER ----------------
export function Header() {
  const { user, logout } = useAuth();
  return (
    <header style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#eee" }}>
      <Link to="/">Home</Link>
      <nav>
        {user ? (
          <>
            <span style={{ marginRight: "10px" }}>{user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/signin" style={{ marginRight: "10px" }}>Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  );
}

// ---------------- ADD PRODUCT PAGE ----------------
export function AddProduct() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !price || !image) return setMessage("All fields required");
    if (Number(price) <= 0) return setMessage("Price must be positive");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/products",
        { title, price, image },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("Product added successfully");
      setTitle(""); setPrice(""); setImage("");
    } catch {
      setMessage("Error adding product");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Add Product</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br /><br />
        <input placeholder="Price" type="number" value={price} onChange={e => setPrice(e.target.value)} /><br /><br />
        <input placeholder="Image URL" value={image} onChange={e => setImage(e.target.value)} /><br /><br />
        <button type="submit" disabled={loading}>{loading ? "Adding..." : "Add Product"}</button>
      </form>
    </div>
  );
}

// ---------------- SIGNIN PAGE ----------------
export function SignIn() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/signin", { email, password });
      login(res.data.user, res.data.token);
      navigate("/");
    } catch {
      setMessage("Invalid credentials");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sign In</h2>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} /><br /><br />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} /><br /><br />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

// ---------------- HOME PAGE ----------------
export function Home() {
  return <div style={{ padding: "20px" }}><h2>Welcome to Home Page</h2></div>;
}

// ---------------- MAIN APP ----------------
export default function ReactApp() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<><Header /><Home /></>} />
        <Route path="/signin" element={<><Header /><SignIn /></>} />
        <Route path="/add-product" element={<><Header /><ProtectedRoute><AddProduct /></ProtectedRoute></>} />
      </Routes>
    </AuthProvider>
  );
}
