import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Menu } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const getSubtitle = () => {
    const path = location.pathname;

    if (path.startsWith('/dashboard'))
      return 'Review your academic performance and latest insights';

    if (path.startsWith('/documents'))
      return 'Manage and organize your learning materials';

    if (path.startsWith('/profile'))
      return 'View and manage your personal account information';

    if (path.startsWith('/flashcards'))
      return 'Practice and reinforce your knowledge with smart flashcards';

    return null;
  };

  const getPageTitle = () => {
    const path = location.pathname;

    // If document title passed through navigation
    if (location.state?.title) {
      return location.state.title;
    }

    if (path.startsWith('/documents')) return 'My Documents';
    if (path.startsWith('/profile')) return 'Profile';
    if (path.startsWith('/flashcards')) return 'Flashcards';
    if (path.startsWith('/quizzes')) return 'Quizzes';
    if (path.startsWith('/dashboard')) return 'Dashboard';

    return 'Dashboard';
  };

  return (
    <header className='sticky top-0 z-40 w-full h-24 bg-white/90 backdrop-blur-md border-b border-gray-200'>
      <div className='flex items-center justify-between h-full px-6'>

        <div className='flex items-center gap-4'>
          {/* Mobile menu Button */}
          <button
            onClick={toggleSidebar}
            className='md:hidden inline-flex items-center justify-center w-10 h-10 text-gray-600 hover:text-purple-600 hover:bg-gray-100 rounded-lg transition-all duration-200'
            aria-label='Toggle Sidebar'
          >
            <Menu size={24} />
          </button>

          {/* Page Title */}
          <div className='hidden md:flex flex-col pl-8'>
            <h1 className='text-3xl font-bold text-gray-900 tracking-wide'>
              {getPageTitle()}
            </h1>

            {getSubtitle() && (
              <p className='text-sm text-gray-500 mt-1'>
                {getSubtitle()}
              </p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-3'>
          {/* User Profile */}
          <div
            onClick={() => navigate('/profile')}
            className='flex items-center gap-3 pl-3 border-l border-gray-200'
          >
            <div className='flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer group'>

              <div className='w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-sm'>
                <User size={18} strokeWidth={2.5} />
              </div>

              <div>
                <p className='text-sm font-semibold text-gray-900'>
                  {user?.username || 'User'}
                </p>
                <p className='text-xs text-gray-500'>
                  {user?.email || 'user@example.com'}
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;