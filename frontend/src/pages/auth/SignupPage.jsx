import { useState } from "react";
import { motion } from "framer-motion";
import { signupUser } from "../../api/authApi";
import { useNavigate, Link } from "react-router-dom";
import AuthLayout from "../../layouts/AuthLayout";

export default function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    cgpa: "",
    branch: "",
    semester: "",
    college: "",
    placement_target: "",
    weak_subjects: "",
    available_study_hours: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await signupUser(form);

      alert("Signup successful");

      navigate("/");
    } catch {
      alert("Signup failed");
    }
  };

  return (
    <AuthLayout>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass rounded-3xl p-8 shadow-glow"
      >
        <h1 className="text-3xl font-bold text-center mb-6">
          Create Account
        </h1>

        <form
          onSubmit={handleSignup}
          className="space-y-4 max-h-[80vh] overflow-y-auto"
        >
          {Object.keys(form).map((key) => (
            <input
              key={key}
              name={key}
              placeholder={key.replace(/_/g, " ")}
              type={key === "password" ? "password" : "text"}
              className="w-full p-3 rounded-xl bg-secondaryDark border border-gray-700 text-white"
              onChange={handleChange}
            />
          ))}

          <button
            type="submit"
            className="w-full p-4 rounded-xl gradient-btn font-semibold"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center mt-4">
          <Link to="/" className="text-primaryBlue">
            Already have an account?
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  );
}