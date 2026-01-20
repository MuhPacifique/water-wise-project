import React from 'react';
import { motion } from 'framer-motion';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';

const MaintenanceMode: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <motion.div
        className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-slate-200"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Icon */}
        <motion.div
          className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          <Wrench size={48} />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl font-bold text-slate-900 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Under Maintenance
        </motion.h1>

        {/* Message */}
        <motion.p
          className="text-xl text-slate-600 mb-8 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          We're currently performing some important updates to improve your experience.
          Please check back soon!
        </motion.p>

        {/* Details */}
        <motion.div
          className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex items-center justify-center gap-3 text-slate-700 mb-4">
            <Clock size={20} />
            <span className="font-semibold">Expected Duration</span>
          </div>
          <p className="text-slate-600">
            We're working hard to get everything back up and running as quickly as possible.
            Thank you for your patience!
          </p>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          className="flex items-center justify-center gap-2 text-slate-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <AlertTriangle size={16} />
          <span className="text-sm">
            If you need immediate assistance, please contact our support team.
          </span>
        </motion.div>

        {/* Animated dots */}
        <motion.div
          className="flex justify-center gap-2 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-orange-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MaintenanceMode;
