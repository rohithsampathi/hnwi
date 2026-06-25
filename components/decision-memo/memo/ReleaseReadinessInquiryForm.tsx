'use client';

import { useState, type FormEvent } from 'react';
import { Check, Send } from 'lucide-react';

interface ReleaseReadinessInquiryFormProps {
  intakeId: string;
  reference: string;
}

export function ReleaseReadinessInquiryForm({
  intakeId,
  reference,
}: ReleaseReadinessInquiryFormProps) {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setStatus('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/decision-memo/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intake_id: intakeId,
          memo_reference: reference,
          requester_name: String(formData.get('name') || ''),
          requester_email: String(formData.get('email') || ''),
          requester_phone: String(formData.get('phone') || ''),
          move_summary: String(formData.get('move') || ''),
          request_type: 'release_readiness_review',
          source_url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setStatus('sent');
      setMessage('Request received. We will respond with the evidence scope and next document ask.');
      form.reset();
    } catch {
      setStatus('error');
      setMessage('Unable to submit from this page. Please retry, or share the memo reference directly.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 grid gap-4 text-left md:grid-cols-2">
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Name</span>
        <input
          required
          name="name"
          autoComplete="name"
          className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
          placeholder="Your name"
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Email</span>
        <input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
          placeholder="name@familyoffice.com"
        />
      </label>
      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Phone</span>
        <input
          required
          type="tel"
          name="phone"
          autoComplete="tel"
          className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
          placeholder="+971 ..."
        />
      </label>
      <label className="space-y-2 md:col-span-2">
        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/70">Move description brief</span>
        <textarea
          required
          name="move"
          rows={3}
          className="w-full resize-none rounded-xl border border-border/70 bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary/70 focus:ring-2 focus:ring-primary/20"
          placeholder="Example: Dubai family considering a London property purchase before offer or exchange."
        />
      </label>
      <div className="md:col-span-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          No names, account numbers, passports, or private documents are needed in this form.
        </p>
        <button
          type="submit"
          disabled={status === 'submitting' || status === 'sent'}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/15 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === 'submitting' ? 'Sending...' : status === 'sent' ? 'Request Sent' : 'Request Review'}
          {status === 'sent' ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      {message ? (
        <p className={`md:col-span-2 text-sm ${status === 'error' ? 'text-red-500' : 'text-emerald-600'}`}>
          {message}
        </p>
      ) : null}
    </form>
  );
}
