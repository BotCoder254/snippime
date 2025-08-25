import { motion } from 'framer-motion';
import { HiSun, HiMoon, HiDesktopComputer } from 'react-icons/hi';
import { useTheme } from '../../hooks/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return HiSun;
      case 'dark':
        return HiMoon;
      default:
        return HiDesktopComputer;
    }
  };

  const Icon = getIcon();

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
      title={`Current theme: ${theme}`}
    >
      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </motion.button>
  );
};

export default ThemeToggle;