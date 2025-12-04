// components/assessment/TierPricingModal.tsx
// Modal wrapper for three-column tier pricing comparison

"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { TierPricingComparison } from './TierPricingComparison';

interface TierPricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTier: 'architect' | 'operator' | 'observer';
  sessionId: string;
  onArchitectSubmit: (email: string, whatsapp: string) => Promise<void>;
  onPaymentSuccess: (tier: 'operator' | 'observer') => void;
}

export function TierPricingModal({
  isOpen,
  onClose,
  currentTier,
  sessionId,
  onArchitectSubmit,
  onPaymentSuccess
}: TierPricingModalProps) {
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
          className="relative bg-background border border-border rounded-lg shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="p-8">
            <TierPricingComparison
              currentTier={currentTier}
              sessionId={sessionId}
              onArchitectSubmit={onArchitectSubmit}
              onPaymentSuccess={onPaymentSuccess}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
