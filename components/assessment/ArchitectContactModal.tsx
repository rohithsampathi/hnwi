// components/assessment/ArchitectContactModal.tsx
// Modal to collect email/WhatsApp for Architect tier users

"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Crown, Mail, Phone, CheckCircle } from 'lucide-react';

interface ArchitectContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ArchitectContactModal({ isOpen, onClose, sessionId }: ArchitectContactModalProps) {
  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Submit to backend
      const response = await fetch('/api/assessment/architect-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          email,
          whatsapp,
          tier: 'architect'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit inquiry');
      }

      setSubmitted(true);

      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      setError('Failed to submit. Please try again or contact us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-card border border-primary/30 rounded-lg shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {!submitted ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 pb-6 border-b border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Crown className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">
                      Architect Tier Access
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Exclusive to systems thinkers
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 pt-6">
                <div className="mb-6 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    As an <span className="font-bold text-primary">Architect</span>, you qualify for our most exclusive tier:
                  </p>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Privé Exchange</strong> access to $500K+ opportunities</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Personal onboarding</strong> with our wealth strategist</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span><strong className="text-foreground">Custom wealth blueprint</strong> for your profile</span>
                    </li>
                  </ul>
                  <p className="text-xs text-muted-foreground pt-2 border-t border-border mt-4">
                    We'll reach out within 24 hours to discuss your personalized access and strategy.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-primary" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      WhatsApp Number <span className="text-muted-foreground font-normal text-xs">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting...' : 'Request Architect Access'}
                  </button>
                </form>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  Request onboarding — billing after activation.
                </p>
              </div>
            </>
          ) : (
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4"
              >
                <CheckCircle className="w-8 h-8 text-green-500" />
              </motion.div>
              <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
              <p className="text-sm text-muted-foreground">
                We'll contact you within 24 hours to discuss your Architect tier access.
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
