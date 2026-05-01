import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Spinner from '../../components/common/spinner';
import progressService from '../../Services/progressService';
import toast from 'react-hot-toast';
import { FileText, BookOpen, TrendingUp, Clock, Award, ArrowUpRight } from 'lucide-react';

function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await progressService.getDashboardData();
        setDashboardData(data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard data');
        console.error(error);
      } finally {
        setLoading(false)
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
  return (
    <div className="h-screen flex justify-center items-center">
      <Spinner />
    </div>
    )
  }

  if (!dashboardData || !dashboardData.overview) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='min-h-screen flex items-center justify-center bg-slate-50'
      >
        <div className='text-center'>
          <motion.div
            className='inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-50 mb-4 border border-blue-100'         
          >
            <TrendingUp className='w-8 h-8 text-blue-600' />
          </motion.div>
          <p className='text-slate-500 text-sm font-semibold'>No dashboard data available</p>
        </div>
      </motion.div>
    )
  }

  const stats = [
    {
      label: 'Documents',
      value: dashboardData.overview.totalDocuments,
      icon: FileText,
      bg: 'bg-[#DE6FA1]',
      iconBg: 'bg-white/20',
      subText: 'Total Files'
    },
    {
      label: 'Flashcards',
      value: dashboardData.overview.totalFlashcards,
      icon: BookOpen,
      bg: 'bg-[#FFB33F]', // Indigo theme
      iconBg: 'bg-white/20',
      subText: 'Practice Sets'
    },
    {
      label: 'Quizzes',
      value: dashboardData.overview.totalQuizzes,
      icon: Award,
      bg: 'bg-[#458B73]', // Dark Slate theme for contrast
      iconBg: 'bg-white/20',
      subText: 'Completed'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const statCardVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.2, // Toned down for professional feel
        duration: 0.6
      }
    },
    hover: {
      y: -8,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.div
      className='min-h-screen p-6 bg-white rounded-2xl'
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className='max-w-7xl mx-auto'>

        {/* Stats Grid */}
        <motion.div
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24 mb-6'
          variants={containerVariants}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={statCardVariants}
              whileHover={{ y: -5 }}
              className={`${stat.bg} rounded-[2rem] p-6 relative overflow-hidden group cursor-pointer shadow-lg transition-all duration-300`}
            >
              {/* Centered Icon Box (Matches the Image Style) */}
              <div className='flex justify-center mb-2'>
                <motion.div
                  className={`${stat.iconBg} w-12 h-12 rounded-3xl flex items-center justify-center backdrop-blur-md border border-white/30`}
                >
                  <stat.icon className='w-6 h-6 text-white' strokeWidth={1.5} />
                </motion.div>
              </div>

              {/* Label and Value Layout */}
              <div className='relative z-10 text-white flex flex-col items-center'>
                <motion.h3
                  className='text-xl text-center font-semibold mb-2 opacity-90'
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                >
                  {stat.label}
                </motion.h3>

                {/* Changed flex justify-between to justify-center */}
                <div className='flex items-baseline justify-center w-full'>
                  <motion.div
                    className='text-3xl font-bold tracking-tight text-center'
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                  >
                    {stat.value}
                    <span className="text-lg font-medium opacity-70 ml-1">
                      {stat.subText}
                    </span>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>


        {/* Recent Activity */}
        <motion.div
          className='bg-white border-2 border-slate-200 rounded-2xl p-8 shadow-sm'
          variants={itemVariants}
        >
          <div className='flex items-center gap-4 mb-8'>
            <motion.div
              className='w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100'
            >
              <Clock className='w-5 h-5 text-blue-600' strokeWidth={2.5} />
            </motion.div>
            <h3 className='text-2xl font-bold text-slate-900 tracking-tight'>
              Activity Log
            </h3>
          </div>

          {dashboardData.recentActivity && (dashboardData.recentActivity.documents.length > 0 || dashboardData.recentActivity.quizzes.length > 0) ? (
            <motion.div
              className='space-y-4'
              variants={containerVariants}
            >
              {[
                ...(dashboardData.recentActivity.documents || []).map(doc => ({
                  id: doc._id,
                  description: doc.title,
                  timestamp: doc.lastAccessed,
                  link: `/document/${doc._id}`,
                  type: 'document'
                })),
                ...(dashboardData.recentActivity.quizzes || []).map(quiz => ({
                  id: quiz._id,
                  description: quiz.title,
                  timestamp: quiz.completedAt || quiz.createdAt,
                  link: quiz.completedAt ? `/quizzes/${quiz._id}/results` : `/quizzes/${quiz._id}`,
                  type: 'quiz',
                  isCompleted: !!quiz.completedAt
                }))
              ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
                .map((activity, index) => (
                  <motion.div
                    key={activity.id || index}
                    variants={itemVariants}
                    whileHover={{ x: 8 }}
                    className='flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer group'
                  >
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-3 mb-1'>
                        <motion.div
                          className={`w-2.5 h-2.5 rounded-full ${activity.type === 'document' ? 'bg-blue-600' :
                              activity.isCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                        />
                        <p className='text-sm font-bold text-slate-700 truncate group-hover:text-blue-700 transition-colors'>
                          {activity.type === 'document' ? 'Accessed: ' :
                            activity.isCompleted ? 'Completed: ' : 'Started: '}
                          <span className='font-semibold'>{activity.description}</span>
                        </p>
                      </div>
                      <p className='text-[11px] font-medium text-slate-400 pl-5 uppercase tracking-wider'>
                        {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </p>
                    </div>
                    {activity.link && (
                      <motion.a
                        href={activity.link}
                        className='ml-4 px-5 py-2 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 rounded-lg shadow-blue-100 shadow-md transition-all'
                        whileTap={{ scale: 0.95 }}
                      >
                        Open
                      </motion.a>
                    )}
                  </motion.div>
                ))}
            </motion.div>
          ) : (
            <motion.div
              className='text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-sm mb-4'
              >
                <Clock className='w-8 h-8 text-slate-300' />
              </motion.div>
              <p className='text-sm font-bold text-slate-600 mb-1'>No activity history found</p>
              <p className='text-xs text-slate-400'>Your recent interactions will appear here</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DashboardPage;