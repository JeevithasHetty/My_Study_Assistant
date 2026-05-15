import { motion } from "framer-motion";
import DashboardLayout from "../../layouts/DashboardLayout";

const stats = [
  {
    title: "Study Hours",
    value: "12h",
  },
  {
    title: "Tasks Completed",
    value: "18",
  },
  {
    title: "Placement Readiness",
    value: "72%",
  },
  {
    title: "Upcoming Exams",
    value: "3",
  },
];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className="text-4xl font-bold mb-8">
          Welcome to StudentOS AI
        </h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-3xl p-6 shadow-glow"
            >
              <h2 className="text-gray-300">
                {stat.title}
              </h2>

              <p className="text-3xl font-bold mt-3">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">
              Today's Tasks
            </h2>

            <ul className="space-y-3">
              <li>Complete DBMS Unit 2</li>
              <li>Solve 5 Java DSA problems</li>
              <li>Resume skill improvement</li>
              <li>AI mock interview prep</li>
            </ul>
          </motion.div>

          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="glass rounded-3xl p-6"
          >
            <h2 className="text-2xl font-semibold mb-4">
              AI Recommendations
            </h2>

            <ul className="space-y-3">
              <li>Focus on OS first (weak subject)</li>
              <li>Practice Java collections today</li>
              <li>Resume missing backend keywords</li>
              <li>Placement prep priority increased</li>
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}