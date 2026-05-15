import { motion } from "framer-motion";

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-primaryDark">

      <div className="absolute w-96 h-96 bg-primaryBlue rounded-full blur-3xl opacity-20 top-10 left-10"></div>

      <div className="absolute w-80 h-80 bg-accentBlue rounded-full blur-3xl opacity-20 bottom-10 right-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="z-10 w-full max-w-md px-6"
      >
        {children}
      </motion.div>
    </div>
  );
}