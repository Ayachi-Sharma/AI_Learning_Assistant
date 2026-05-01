import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FileText, User,  BookMarked , LogOut, WalletCards, LayoutDashboard } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login')
  }

  const navLinks = [
    { to: '/dashboard', icon: LayoutDashboard, text: 'Dashboard' },
    { to: '/documents', icon: FileText, text: 'Documents' },
    { to: '/flashcards', icon: WalletCards, text: 'Flashcards' },
    { to: '/profile', icon: User, text: 'Profile' },
  ]

  const sidebarVariants = {
    collapsed: { width: 70 },
    expanded: { width: 230 }
  }

  const textVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.25 } }
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden'
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isHovered ? 'expanded' : 'collapsed'}
        variants={sidebarVariants}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className={`
          fixed md:relative top-0 left-0 h-full z-50
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          shadow-2xl md:shadow-none
          flex flex-col
        `}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >

        {/* Curved Gradient Background */}
        <div className='absolute inset-0 bg-gradient-to-b from-indigo-500 via-blue-500 to-indigo-600 rounded-r-[40px]' />

        {/* Content Wrapper */}
        <div className='relative flex flex-col h-full text-white'>

          {/* Logo */}
          <div className='h-24 flex flex-col items-start justify-center px-4 border-b border-white/20'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur'>
                <BookMarked size={28} />
                {/* <Logo/> */}
              </div>

              <AnimatePresence>
                {isHovered && (
                  <motion.h1
                    variants={textVariants}
                    initial='hidden'
                    animate='visible'
                    exit='hidden'
                    className='font-semibold text-lg whitespace-nowrap'
                  >
                    AI Learning
                  </motion.h1>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Navigation */}
          <nav className='flex-1 mt-4 space-y-2'>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => isSidebarOpen && toggleSidebar()}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-l-xl transition-all duration-200 relative w-full
                  ${isActive ? 'bg-white text-indigo-600 shadow-lg w-full' : 'text-white/90 hover:bg-white/10'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <link.icon size={20} strokeWidth={2.2} />

                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          variants={textVariants}
                          initial='hidden'
                          animate='visible'
                          exit='hidden'
                          className='text-sm font-medium whitespace-nowrap'
                        >
                          {link.text}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {isActive && (
                      <motion.div
                        layoutId='active-pill'
                        className='absolute inset-0 bg-white rounded-xl -z-10'
                        transition={{ type: 'spring', duration: 0.5 }}
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Logout */}
          <div className='px-3 pb-6'>
            <button
              onClick={handleLogout}
              className='cursor-pointer flex items-center gap-3 w-full px-3 py-3 rounded-xl text-white/90 hover:bg-blue-500/60 transition'
            >
              <LogOut size={20} strokeWidth={2.2} />

              <AnimatePresence>
                {isHovered && (
                  <motion.span
                    variants={textVariants}
                    initial='hidden'
                    animate='visible'
                    exit='hidden'
                    className='text-sm font-medium whitespace-nowrap'
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </motion.aside>
    </>
  )
}

export default Sidebar;