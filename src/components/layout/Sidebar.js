import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
    HiHome,
    HiCode,
    HiPlus,
    HiLogout,
    HiMenuAlt3,
    HiX,
    HiHeart,
    HiBookmark,
    HiCollection
} from 'react-icons/hi';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const menuItems = [
        { icon: HiHome, label: 'Home', path: '/' },
        { icon: HiCode, label: 'Explore', path: '/explore' },
        { icon: HiCollection, label: 'Collections', path: '/collections' },
        { icon: HiBookmark, label: 'Saved', path: '/saved' },
        { icon: HiHeart, label: 'Liked', path: '/liked' },
    ];

    const sidebarVariants = {
        open: {
            width: '16rem',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            width: '4rem',
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    const itemVariants = {
        open: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            opacity: 0,
            x: -20,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                        onClick={() => setIsOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.div
                variants={sidebarVariants}
                animate={isOpen ? 'open' : 'closed'}
                className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 z-50 lg:sticky lg:top-0 lg:h-screen lg:z-auto"
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <AnimatePresence>
                            {isOpen && (
                                <motion.div
                                    variants={itemVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                    className="flex items-center space-x-2"
                                >
                                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                                        <HiCode className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        Snippime
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isOpen ? (
                                <HiX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            ) : (
                                <HiMenuAlt3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            )}
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <motion.div key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center space-x-3 p-3 rounded-lg transition-colors group ${isActive
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                            }`} />
                                        <AnimatePresence>
                                            {isOpen && (
                                                <motion.span
                                                    variants={itemVariants}
                                                    initial="closed"
                                                    animate="open"
                                                    exit="closed"
                                                    className={`font-medium ${isActive
                                                        ? 'text-blue-600 dark:text-blue-400'
                                                        : 'text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400'
                                                        }`}
                                                >
                                                    {item.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Create Button */}
                    <div className="p-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg"
                        >
                            <HiPlus className="w-5 h-5" />
                            <AnimatePresence>
                                {isOpen && (
                                    <motion.span
                                        variants={itemVariants}
                                        initial="closed"
                                        animate="open"
                                        exit="closed"
                                        className="font-medium"
                                    >
                                        New Snippet
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </div>

                    {/* User Profile */}
                    {user && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || user.email}&background=6366f1&color=fff`}
                                    alt={user.displayName || user.email}
                                    className="w-10 h-10 rounded-full"
                                />
                                <AnimatePresence>
                                    {isOpen && (
                                        <motion.div
                                            variants={itemVariants}
                                            initial="closed"
                                            animate="open"
                                            exit="closed"
                                            className="flex-1 min-w-0"
                                        >
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {user.displayName || user.email}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                {/* Logout button - always visible */}
                                <button
                                    onClick={logout}
                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    title="Logout"
                                >
                                    <HiLogout className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </>
    );
};

export default Sidebar;