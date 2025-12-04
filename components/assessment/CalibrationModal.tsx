// components/assessment/CalibrationModal.tsx
// Real-time calibration modal showing "dramatic purge" of opportunities

"use client";

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CalibrationEvent {
  filter: string;
  message: string;
  removed: number;
  remaining: number;
}

interface CalibrationModalProps {
  isCalibrating: boolean;
  calibrationEvents: CalibrationEvent[];
  onClose?: () => void;
}

export function CalibrationModal({
  isCalibrating,
  calibrationEvents,
  onClose
}: CalibrationModalProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animate through events
  useEffect(() => {
    if (calibrationEvents.length === 0) return;

    const timer = setInterval(() => {
      setCurrentEventIndex(prev => {
        if (prev < calibrationEvents.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 1500); // Show each event for 1.5 seconds

    return () => clearInterval(timer);
  }, [calibrationEvents.length]);

  // Show success state when calibration completes
  useEffect(() => {
    if (!isCalibrating && calibrationEvents.length > 0) {
      setShowSuccess(true);

      // Auto-close after 2 seconds
      const timer = setTimeout(() => {
        onClose?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isCalibrating, calibrationEvents.length, onClose]);

  if (!isCalibrating && calibrationEvents.length === 0) {
    return null;
  }

  const currentEvent = calibrationEvents[currentEventIndex];
  const initialCount = calibrationEvents[0]?.remaining + calibrationEvents[0]?.removed || 173;
  const finalCount = calibrationEvents[calibrationEvents.length - 1]?.remaining || initialCount;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: isCalibrating ? 360 : 0 }}
                transition={{ duration: 2, repeat: isCalibrating ? Infinity : 0, ease: "linear" }}
                className="text-3xl"
              >
                🔑
              </motion.div>
              <h2 className="text-2xl font-bold">
                {showSuccess ? 'Platform Personalized!' : 'Personalizing Platform...'}
              </h2>
            </div>
            <p className="text-blue-100 text-sm">
              {showSuccess
                ? `${finalCount} opportunities matched to your profile`
                : 'Analyzing your DNA signals and filtering opportunities'}
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* Opportunity Counter */}
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Opportunities
                </div>
                <motion.div
                  key={currentEvent?.remaining || finalCount}
                  initial={{ scale: 1.5, color: '#ef4444' }}
                  animate={{ scale: 1, color: '#000000' }}
                  className="text-5xl font-bold text-gray-900 dark:text-white"
                >
                  {showSuccess ? finalCount : (currentEvent?.remaining || initialCount)}
                </motion.div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Filtered Out
                </div>
                <div className="text-3xl font-bold text-red-500">
                  {initialCount - (showSuccess ? finalCount : (currentEvent?.remaining || initialCount))}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  Filtering Progress
                </span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {Math.round(((currentEventIndex + 1) / Math.max(calibrationEvents.length, 1)) * 100)}%
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((currentEventIndex + 1) / Math.max(calibrationEvents.length, 1)) * 100}%`
                  }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                />
              </div>
            </div>

            {/* Event List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {calibrationEvents.slice(0, currentEventIndex + 1).map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border-2 ${
                      index === currentEventIndex && isCalibrating
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-lg">
                            {index === currentEventIndex && isCalibrating ? '💥' : '✓'}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {event.filter}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {event.message}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-red-600 dark:text-red-400">
                          -{event.removed}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {event.remaining} left
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Success State */}
            {showSuccess && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-xl text-center"
              >
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold text-green-900 dark:text-green-100 mb-2">
                  Calibration Complete!
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your Command Centre now shows only opportunities matched to your DNA signals.
                </p>
              </motion.div>
            )}

            {/* Loading State */}
            {isCalibrating && !showSuccess && (
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <motion.div
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Removing incompatible opportunities...
                </motion.div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
