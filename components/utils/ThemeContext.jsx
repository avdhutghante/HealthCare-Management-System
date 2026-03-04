import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then default to light theme
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) return savedTheme
    
    // Default to light theme
    return 'light'
  })

  useEffect(() => {
    console.log('🎨 Theme changed to:', theme)
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('✅ Added "dark" class to html element')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('✅ Removed "dark" class from html element')
    }
    // Save to localStorage
    localStorage.setItem('theme', theme)
    console.log('💾 Saved theme to localStorage:', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      console.log('🔄 Toggling theme from', prev, 'to', newTheme)
      return newTheme
    })
  }

  const setThemePreference = (newTheme) => {
    setTheme(newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  )
}
