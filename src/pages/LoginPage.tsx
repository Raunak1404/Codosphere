import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { login, register } from '../services/firebase';
import LogoIcon from '../components/common/LogoIcon';
import GlowText from '../components/common/GlowText';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        // Handle login
        const result = await login(email, password);
        if (result.error) {
          setError(result.error);
        } else if (result.user) {
          navigate('/profile');
        }
      } else {
        // Handle registration
        const result = await register(email, password);
        if (result.error) {
          setError(result.error);
        } else if (result.user) {
          navigate('/profile');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Background blob animation variants
  const blobAnimation = {
    scale: [1, 1.2, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: { 
      duration: 8, 
      repeat: Infinity, 
      ease: "easeInOut" 
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--primary)] relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div 
        className="absolute inset-0 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Animated blobs */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--accent)] filter blur-[200px] opacity-10"
          animate={blobAnimation}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[var(--accent-secondary)] filter blur-[180px] opacity-10"
          animate={{
            ...blobAnimation,
            transition: { 
              ...blobAnimation.transition,
              delay: 2 
            }
          }}
        />
        <motion.div 
          className="absolute top-1/2 right-1/3 w-[400px] h-[400px] rounded-full bg-purple-500 filter blur-[150px] opacity-5"
          animate={{
            ...blobAnimation,
            transition: { 
              ...blobAnimation.transition,
              delay: 4 
            }
          }}
        />
      </motion.div>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center justify-center mb-6 gap-3">
              <LogoIcon size={60} variant="hero" />
              <GlowText variant="hero" size="xl">
                CodoSphere
              </GlowText>
            </Link>
            <motion.h2 
              className="mt-6 text-3xl font-extrabold font-display tracking-tight text-[var(--text)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </motion.h2>
            <motion.p 
              className="mt-2 text-sm text-[var(--text-secondary)]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Fill out the form to create your account'}
            </motion.p>
          </div>

          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500 bg-opacity-20 text-red-400 p-3 rounded-lg mb-4"
              >
                {error}
              </motion.div>
            )}
            
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="mb-4">
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-[var(--text-secondary)]" />
                    </div>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-[var(--secondary)] placeholder-[var(--text-secondary)] text-[var(--text)] rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                      placeholder="Email address"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock size={18} className="text-[var(--text-secondary)]" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full pl-10 pr-10 py-3 bg-[var(--secondary)] placeholder-[var(--text-secondary)] text-[var(--text)] rounded-lg border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition-all"
                      placeholder="Password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff size={18} className="text-[var(--text-secondary)] hover:text-[var(--text)]" />
                      ) : (
                        <Eye size={18} className="text-[var(--text-secondary)] hover:text-[var(--text)]" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {isLogin && (
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <a href="#" className="font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]">
                      Forgot your password?
                    </a>
                  </div>
                </div>
              )}
              
              <motion.button
                type="submit"
                disabled={isLoading}
                className={`w-full btn-hero ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center">
                    {isLogin ? (
                      <>
                        <LogIn size={18} className="mr-2" />
                        Sign in
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} className="mr-2" />
                        Sign up
                      </>
                    )}
                  </span>
                )}
              </motion.button>
            </form>
          </motion.div>
          
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="text-sm text-[var(--text-secondary)]">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="ml-2 font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
      
      <footer className="py-4 text-center relative z-10">
        <p className="text-xs text-[var(--text-secondary)]">
          © {new Date().getFullYear()} CodoSphere. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;