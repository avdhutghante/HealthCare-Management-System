export const fadeIn = (delay = 0) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.5, delay }
})

export const slideUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay }
})

export const slideIn = (direction = 'left', delay = 0) => {
  const x = direction === 'left' ? -20 : 20
  return {
    initial: { opacity: 0, x },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.5, delay }
  }
}

export const scale = (delay = 0) => ({
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.3, delay }
})

export const stagger = (staggerChildren = 0.1) => ({
  animate: {
    transition: {
      staggerChildren
    }
  }
})