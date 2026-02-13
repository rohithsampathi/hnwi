// components/decision-memo/SuccessConfirmation.tsx
// Success page after payment completion

"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Mail, FileText, Clock } from 'lucide-react';
import Link from 'next/link';

export function SuccessConfirmation() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={3} />
          </motion.div>

          {/* Header */}
          <h1 className="text-4xl font-bold mb-4">
            ✅ PAYMENT CONFIRMED
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your payment of ₹83,000 (~$1,000 USD).
          </p>

          {/* Status */}
          <div className="bg-card border border-border rounded-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">Your Full Decision Memo is Being Generated</h2>
            <p className="text-muted-foreground mb-6">
              You'll receive an email with your PDF within 48 hours.
            </p>

            <div className="space-y-3 text-left max-w-md mx-auto">
              <StatusItem
                icon={Mail}
                label="Email confirmation sent"
                status="complete"
              />
              <StatusItem
                icon={FileText}
                label="Analyzing 1,875 corridor signals"
                status="in-progress"
              />
              <StatusItem
                icon={FileText}
                label="Generating 8-10 page PDF"
                status="pending"
              />
              <StatusItem
                icon={Clock}
                label="Delivery within 48 hours"
                status="pending"
              />
            </div>
          </div>

          {/* What's Included */}
          <div className="bg-muted/30 rounded-xl p-6 mb-8 text-left">
            <h3 className="text-xl font-bold mb-4 text-center">Your memo includes:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Complete exposure map (all blind spots)</li>
              <li>✓ 10+ corridor signals cited (MongoDB dev_ids)</li>
              <li>✓ 11 failure modes with evidence</li>
              <li>✓ Corrected sequencing roadmap</li>
              <li>✓ Implementation timeline with advisor SLAs</li>
              <li>✓ Full evidence sources (traceability)</li>
            </ul>
          </div>

          {/* CTA */}
          <Link
            href="/dashboard"
            className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>

          {/* Support */}
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Questions? Email <a href="mailto:support@hnwichronicles.com" className="text-amber-500 underline">support@hnwichronicles.com</a></p>
            <p className="mt-2">Payment ID: {/* TODO: Show actual payment ID */} DM_{Date.now()}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatusItem({
  icon: Icon,
  label,
  status
}: {
  icon: React.ElementType;
  label: string;
  status: 'complete' | 'in-progress' | 'pending';
}) {
  const statusColor = {
    'complete': 'text-green-500',
    'in-progress': 'text-orange-500',
    'pending': 'text-muted-foreground',
  }[status];

  const statusIcon = {
    'complete': '✓',
    'in-progress': '⟳',
    'pending': '○',
  }[status];

  return (
    <div className="flex items-center gap-3 p-3 bg-background rounded-lg">
      <Icon className="w-5 h-5 text-muted-foreground" />
      <span className="flex-1">{label}</span>
      <span className={`${statusColor} font-bold text-xl`}>{statusIcon}</span>
    </div>
  );
}
