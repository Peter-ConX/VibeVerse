'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sparkles, Video, Users, Zap } from 'lucide-react';

export default function WelcomePage() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: '' 
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        router.push('/interests');
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: signupData.username,
          email: signupData.email,
          password: signupData.password,
        }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        router.push('/interests');
      } else {
        alert(data.message || 'Signup failed');
      }
    } catch (error) {
      alert('Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-20 w-72 h-72 bg-primary opacity-20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-accent opacity-10 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-12 h-12 text-accent" />
            <h1 className="text-5xl font-bold text-accent">Silicon</h1>
          </div>
          <p className="text-gray-400 text-lg">Your Social Entertainment Hub</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 gap-4 mb-8"
        >
          <div className="bg-primary/30 p-4 rounded-lg border border-primary/50">
            <Video className="w-6 h-6 text-accent mb-2" />
            <p className="text-sm text-gray-300">Videos & Shorts</p>
          </div>
          <div className="bg-primary/30 p-4 rounded-lg border border-primary/50">
            <Users className="w-6 h-6 text-accent mb-2" />
            <p className="text-sm text-gray-300">Connect</p>
          </div>
          <div className="bg-primary/30 p-4 rounded-lg border border-primary/50">
            <Zap className="w-6 h-6 text-accent mb-2" />
            <p className="text-sm text-gray-300">AI Chat</p>
          </div>
          <div className="bg-primary/30 p-4 rounded-lg border border-primary/50">
            <Sparkles className="w-6 h-6 text-accent mb-2" />
            <p className="text-sm text-gray-300">Stories</p>
          </div>
        </motion.div>

        {/* Login Form */}
        {showLogin && !showSignup && (
          <motion.form
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleLogin}
            className="bg-primary/20 backdrop-blur-lg p-6 rounded-2xl border border-primary/50 mb-4"
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Login</h2>
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
            <button
              type="button"
              onClick={() => setShowLogin(false)}
              className="w-full mt-2 text-gray-400 hover:text-accent text-sm"
            >
              Back
            </button>
          </motion.form>
        )}

        {/* Signup Form */}
        {showSignup && !showLogin && (
          <motion.form
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onSubmit={handleSignup}
            className="bg-primary/20 backdrop-blur-lg p-6 rounded-2xl border border-primary/50 mb-4"
          >
            <h2 className="text-2xl font-bold text-accent mb-4">Sign Up</h2>
            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) => setSignupData({ ...signupData, username: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={signupData.email}
              onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <input
              type="password"
              placeholder="Confirm Password"
              value={signupData.confirmPassword}
              onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
              className="w-full bg-background-secondary border border-primary/50 rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-primary font-bold py-3 rounded-lg hover:bg-accent-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing up...' : 'Sign Up'}
            </button>
            <button
              type="button"
              onClick={() => setShowSignup(false)}
              className="w-full mt-2 text-gray-400 hover:text-accent text-sm"
            >
              Back
            </button>
          </motion.form>
        )}

        {/* Action Buttons */}
        {!showLogin && !showSignup && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <button
              onClick={() => {
                setShowSignup(true);
                setShowLogin(false);
              }}
              className="w-full bg-accent text-primary font-bold py-4 rounded-lg hover:bg-accent-dark transition-colors text-lg"
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setShowLogin(true);
                setShowSignup(false);
              }}
              className="w-full bg-primary/50 text-accent font-bold py-4 rounded-lg hover:bg-primary/70 transition-colors text-lg border border-primary"
            >
              Log In
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
