import { useState, useContext } from "react";
import { motion } from "framer-motion";
import { loginUser } from "../../api/authApi";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await loginUser(email, password);

      login(response.data.access_token);

      navigate("/dashboard");
    } catch (error) {
      alert("Login failed");
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-3xl p-8 shadow-glow"
      >
        <h1 className="text-3xl font-bold text-center mb-2">
          StudentOS AI
        </h1>

        <p className="text-center text-gray-300 mb-8">
          AI Academic & Placement Copilot
        </p>

        <form onSubmit={handleLogin} className="space-y-5">

          <input
            type="email"
            placeholder="Email"
            className="w-full p-4 rounded-xl bg-secondaryDark border border-gray-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 rounded-xl bg-secondaryDark border border-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full p-4 rounded-xl gradient-btn font-semibold hover:scale-105 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center mt-6 text-gray-300">
          New user?{" "}
          <Link
            to="/signup"
            className="text-primaryBlue"
          >
            Sign up
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}