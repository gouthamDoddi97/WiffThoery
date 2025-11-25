import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, AlertCircle } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="admin-login__container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="admin-login__card"
        >
          <div className="admin-login__header">
            <Lock className="admin-login__icon" />
            <h1 className="admin-login__title">Admin Access</h1>
            <p className="admin-login__subtitle">Sign in to manage expenses</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="admin-login__error"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="admin-login__form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                placeholder="admin@perfume.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="button button--primary button--full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <div className="admin-login__footer">
            <p>Authorized personnel only</p>
          </div>
        </motion.div>
      </div>

      <style jsx>{`
        .admin-login {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .admin-login__container {
          width: 100%;
          max-width: 420px;
        }

        .admin-login__card {
          background: white;
          border-radius: 1rem;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .admin-login__header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .admin-login__icon {
          width: 48px;
          height: 48px;
          margin: 0 auto 1rem;
          color: #667eea;
        }

        .admin-login__title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .admin-login__subtitle {
          color: #666;
          font-size: 0.95rem;
        }

        .admin-login__error {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #c00;
          font-size: 0.9rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e0e0e0;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
        }

        .button--full {
          width: 100%;
          margin-top: 0.5rem;
        }

        .admin-login__footer {
          margin-top: 2rem;
          text-align: center;
          font-size: 0.85rem;
          color: #999;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
