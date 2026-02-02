// =============================================================================
// PAYMENT SUCCESS DIALOG
// Shown after successful Razorpay payment with request ID and contact info
// =============================================================================

"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { CheckCircle, Copy, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  intakeId: string;
}

export function PaymentSuccessDialog({
  open,
  onClose,
  intakeId
}: PaymentSuccessDialogProps) {
  const { toast } = useToast();

  const copyRequestId = () => {
    navigator.clipboard.writeText(intakeId);
    toast({
      title: "Copied",
      description: "Request ID copied to clipboard."
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-6 h-6" />
            Payment Confirmed
          </DialogTitle>
          <DialogDescription>
            Your Decision Posture Audit has been submitted to our team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-4">
          {/* Request ID */}
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Your Request ID
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2.5 bg-muted border border-border rounded-lg font-mono text-sm text-foreground select-all break-all">
                {intakeId}
              </div>
              <button
                onClick={copyRequestId}
                className="p-2.5 border border-border rounded-lg hover:bg-muted transition-colors shrink-0"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Screenshot and save this for future reference.
            </p>
          </div>

          {/* Processing Note */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-sm text-foreground">
              Our intelligence systems and team are now reviewing your submission.
              You will receive your report link and credentials over email within 48 hours.
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              Questions? Reach us at
            </p>
            <div className="text-sm text-foreground space-y-1">
              <p>
                <span className="text-muted-foreground">Email:</span>{' '}
                <a href="mailto:hnwi@montaigne.co" className="text-primary hover:underline">
                  hnwi@montaigne.co
                </a>
              </p>
              <p>
                <span className="text-muted-foreground">WhatsApp:</span>{' '}
                <a
                  href="https://wa.me/919700500900"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  +91 9700 500 900
                </a>
              </p>
            </div>
          </div>

          {/* Visit Website Button */}
          <a
            href="https://www.hnwichronicles.com"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3.5 px-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Visit Our Website</span>
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PaymentSuccessDialog;
