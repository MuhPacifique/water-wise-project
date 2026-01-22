
import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ProblemSectionProps {
  TranslatableText: React.FC<{ text: string }>;
  points: string[];
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
}

const ProblemSection: React.FC<ProblemSectionProps> = ({ TranslatableText, points, title, subtitle, description, imageUrl }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const listItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (index: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.section
      className="py-20 bg-white"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
          <motion.div
            className="relative mb-12 lg:mb-0"
            variants={itemVariants}
          >
            <motion.img
              src={imageUrl}
              alt={title}
              className="rounded-3xl shadow-2xl shadow-blue-100 object-cover w-full h-[400px]"
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
            />
            <motion.div
              className="absolute -bottom-6 -right-6 bg-red-50 p-6 rounded-2xl border border-red-100 shadow-xl max-w-xs"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="flex items-center gap-3 mb-2 text-red-600 font-bold">
                <motion.div
                  whileHover={{ rotate: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertTriangle size={20} />
                </motion.div>
                <TranslatableText text={subtitle} />
              </div>
              <p className="text-sm text-red-800 leading-snug">
                <TranslatableText text="Climate change effects are hitting African countries hard, exacerbated by human activities." />
              </p>
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <motion.h2
              className="text-3xl font-bold text-slate-900 mb-6"
              variants={itemVariants}
            >
              <TranslatableText text={title} />
            </motion.h2>
            <motion.p
              className="text-slate-600 mb-8 text-lg"
              variants={itemVariants}
            >
              <TranslatableText text={description} />
            </motion.p>
            <motion.ul
              className="space-y-4"
              variants={containerVariants}
            >
              {points.map((point, idx) => (
                <motion.li
                  key={idx}
                  className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors group"
                  variants={listItemVariants}
                  custom={idx}
                  whileHover={{ scale: 1.02, x: 5 }}
                >
                  <motion.div
                    className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {idx + 1}
                  </motion.div>
                  <span className="text-slate-700 leading-relaxed font-medium">
                    <TranslatableText text={point} />
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default ProblemSection;
