import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from './utils/ThemeContext'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    console.log('🖱️ Toggle clicked! Current theme:', theme)
    toggleTheme()
  }

  console.log('🔍 ThemeToggle rendered with theme:', theme)

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>
      <button
        onClick={handleClick}
        style={{
          position: 'relative',
          width: '70px',
          height: '34px',
          borderRadius: '50px',
          background: theme === 'dark' 
            ? 'linear-gradient(145deg, #1e293b, #334155)' 
            : 'linear-gradient(145deg, #e2e8f0, #cbd5e1)',
          boxShadow: theme === 'dark'
            ? 'inset 2px 2px 5px #0f172a, inset -2px -2px 5px #475569'
            : 'inset 2px 2px 5px #94a3b8, inset -2px -2px 5px #f1f5f9',
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          outline: 'none'
        }}
        aria-label="Toggle theme"
      >
        <motion.div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: theme === 'dark'
              ? 'linear-gradient(145deg, #1e40af, #3b82f6)'
              : 'linear-gradient(145deg, #fbbf24, #f59e0b)',
            boxShadow: theme === 'dark'
              ? '0 4px 8px rgba(59, 130, 246, 0.4)'
              : '0 4px 8px rgba(251, 191, 36, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          animate={{
            x: theme === 'dark' ? 36 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {theme === 'light' ? (
            <Sun className="w-4 h-4" style={{ color: '#ffffff' }} />
          ) : (
            <Moon className="w-4 h-4" style={{ color: '#ffffff' }} />
          )}
        </motion.div>
      </button>
    </div>
  )
}

export default ThemeToggle
