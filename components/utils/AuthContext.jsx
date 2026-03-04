import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Optionally verify token with backend
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await authAPI.getMe();
      setUser(response.data.user);
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data;
      
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      // Update state
      setUser(newUser);
      
      return { success: true, user: newUser, message: response.data.message };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUserData) => {
    const updatedUser = { ...user, ...updatedUserData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isApproved = () => {
    return user?.isApproved === true;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
    isApproved
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

/* 
USAGE EXAMPLE:

1. Wrap your app in App.jsx or main.jsx:
   
   import { AuthProvider } from './utils/AuthContext';
   
   <AuthProvider>
     <App />
   </AuthProvider>

2. Use in any component:

   import { useAuth } from './utils/AuthContext';
   
   function MyComponent() {
     const { user, login, logout, isAuthenticated, hasRole } = useAuth();
     
     if (!isAuthenticated()) {
       return <Navigate to="/login" />;
     }
     
     if (hasRole('admin')) {
       // Show admin features
     }
     
     return <div>Hello {user.name}</div>;
   }

3. In Login page:

   const { login } = useAuth();
   const navigate = useNavigate();
   
   const handleSubmit = async (e) => {
     e.preventDefault();
     const result = await login(email, password);
     
     if (result.success) {
       // Redirect based on role
       if (result.user.role === 'admin') {
         navigate('/admin');
       } else if (result.user.role === 'doctor') {
         navigate('/doctor-dashboard');
       } else if (result.user.role === 'lab') {
         navigate('/lab-dashboard');
       } else {
         navigate('/dashboard');
       }
     } else {
       alert(result.message);
     }
   };
*/
