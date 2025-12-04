// components/assessment/IdentityProtocol.tsx
// Elite identity capture - not a form, a protocol

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Mail } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface IdentityProtocolProps {
  onSubmit: (data: { name: string; email: string }) => void;
  loading?: boolean;
}

export const IdentityProtocol: React.FC<IdentityProtocolProps> = ({ onSubmit, loading }) => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Primary identity required';
    }

    if (!email.trim()) {
      newErrors.email = 'Secure channel required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid channel format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit({ name: name.trim(), email: email.trim() });
    }
  };

  return (
    <div className={`min-h-full flex items-center justify-center p-4 md:p-8 ${theme === 'dark' ? 'bg-background' : 'bg-background'}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full"
      >
        {/* Top border */}
        <motion.div
          className={`h-px w-full mb-8 ${
            theme === 'dark'
              ? 'bg-gradient-to-r from-transparent via-yellow-500 to-transparent'
              : 'bg-gradient-to-r from-transparent via-gray-800 to-transparent'
          }`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        />

        <div className={`border rounded-lg p-8 md:p-12 ${
          theme === 'dark'
            ? 'bg-black/90 border-yellow-500/30'
            : 'bg-white border-gray-300'
        }`}>
          <div className="mb-8">
            <h2 className={`text-2xl md:text-3xl font-bold mb-2 ${
              theme === 'dark' ? 'text-yellow-500' : 'text-black'
            }`}>
              INTELLIGENCE CLASSIFICATION PROTOCOL
            </h2>
            <div className={`h-px w-20 mb-6 ${theme === 'dark' ? 'bg-yellow-500/50' : 'bg-gray-800'}`} />
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Establish secure channel for intelligence delivery
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <div>
              <label className={`block text-sm font-mono mb-3 ${
                theme === 'dark' ? 'text-yellow-500' : 'text-black'
              }`}>
                PRIMARY IDENTITY
              </label>
              <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`}>
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Your Name"
                  className={`
                    w-full border rounded-lg py-4 pl-12 pr-4
                    focus:outline-none focus:ring-2
                    transition-all duration-300
                    ${theme === 'dark'
                      ? 'bg-black/50 text-white placeholder-gray-600'
                      : 'bg-gray-50 text-black placeholder-gray-400'
                    }
                    ${errors.name
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : theme === 'dark'
                        ? 'border-yellow-500/30 focus:ring-yellow-500/50 focus:border-yellow-500/50'
                        : 'border-gray-300 focus:ring-gray-500/50 focus:border-gray-500'
                    }
                  `}
                  disabled={loading}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-2 font-mono"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-mono text-yellow-500 mb-3">
                SECURE CHANNEL
              </label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  placeholder="Email - Encrypted"
                  className={`
                    w-full bg-black/50 border rounded-lg py-4 pl-12 pr-4
                    text-white placeholder-gray-600
                    focus:outline-none focus:ring-2
                    transition-all duration-300
                    ${errors.email
                      ? 'border-red-500/50 focus:ring-red-500/50'
                      : 'border-yellow-500/30 focus:ring-yellow-500/50 focus:border-yellow-500/50'
                    }
                  `}
                  disabled={loading}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-xs mt-2 font-mono"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="flex items-start gap-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4">
              <Lock size={16} className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                <span className="text-yellow-500 font-mono">ENCRYPTION:</span>{' '}
                Your information is encrypted end-to-end. We never share your data.
                Used solely for intelligence delivery and strategic communication.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-4 rounded-lg font-bold text-lg
                  transition-all duration-300 transform
                  ${loading
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-600 text-black hover:scale-[1.02]'
                  }
                `}
                whileHover={!loading ? { boxShadow: "0 0 40px rgba(212, 175, 55, 0.4)" } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
                    Initializing profile...
                  </span>
                ) : (
                  'INITIATE PROTOCOL'
                )}
              </motion.button>
            </div>
          </form>

          {/* Bottom Info */}
          <div className="mt-8 pt-6 border-t border-yellow-500/20">
            <p className="text-xs text-gray-500 text-center">
              By proceeding, you acknowledge this assessment is for intelligence analysis purposes only.
              Strategic advice requires professional consultation.
            </p>
          </div>
        </div>

        {/* Bottom border */}
        <motion.div
          className="h-px w-full bg-gradient-to-r from-transparent via-yellow-500 to-transparent mt-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        />
      </motion.div>
    </div>
  );
};
