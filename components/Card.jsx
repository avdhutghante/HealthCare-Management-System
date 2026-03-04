import { motion } from 'framer-motion'

const Card = ({ children, className = '', onClick, ...props }) => {
  // Check if className contains gradient or custom background
  const hasCustomBackground = className.includes('bg-gradient') || className.includes('!bg-') || className.includes('from-')

  const variantClass = hasCustomBackground ? 'card--custom-bg' : 'card--elevated'
  const darkDefaults = hasCustomBackground ? '' : 'dark:bg-gray-800 dark:text-white dark:border-gray-700'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card ${variantClass} ${darkDefaults} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default Card