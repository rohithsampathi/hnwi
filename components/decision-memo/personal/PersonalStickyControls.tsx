'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Download, Share2, Check, Loader2, LayoutGrid, ArrowLeft, Shield } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

interface PersonalStickyControlsProps {
  intakeId: string;
  onExportPDF?: () => void;
  isExportingPDF?: boolean;
}

export default function PersonalStickyControls({
  intakeId,
  onExportPDF,
  isExportingPDF = false
}: PersonalStickyControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme } = useTheme();
  const [linkCopied, setLinkCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleExitWarRoom = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('personal');
    router.push(`${window.location.pathname}?${params.toString()}`);
  };

  return (
    <>
      {/* Back bar — matches linear view */}
      <div className="bg-background border-b border-border print:hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center gap-3 pl-1">
            <button
              onClick={() => router.push('/war-room')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded bg-secondary border border-border text-foreground hover:bg-primary hover:text-white transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${theme === 'dark' ? 'text-primary' : 'text-black'}`} />
              <span className="text-foreground font-bold text-sm">War Room</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky banner — same layout as linear view */}
      <div className="bg-card/95 backdrop-blur-xl border-b border-border print:hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left — HC branding + ref */}
            <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push('/war-room')}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-primary-foreground font-bold text-sm">HC</span>
              </div>
              <div>
                <p className="text-foreground font-semibold">Decision Memo</p>
                <p className="text-muted-foreground text-xs">
                  Ref: {intakeId.slice(7, 19).toUpperCase()}
                </p>
              </div>
            </div>

            {/* Right — action buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <button
                onClick={handleExitWarRoom}
                className="min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border border-gold bg-gold/5 hover:bg-gold/10 rounded-lg flex items-center justify-center gap-2 transition-colors group"
              >
                <LayoutGrid className="w-4 h-4 text-gold" />
                <span className="hidden sm:inline text-gold font-medium">Report View</span>
              </button>
              <button
                onClick={handleShare}
                className={`min-h-[44px] min-w-[44px] px-2 sm:px-3 text-sm border rounded-lg flex items-center justify-center gap-2 transition-colors ${
                  linkCopied
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                {linkCopied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                <span className="hidden sm:inline">{linkCopied ? 'Copied!' : 'Share'}</span>
              </button>
              <button
                onClick={onExportPDF}
                disabled={isExportingPDF}
                className="min-h-[44px] px-2 sm:px-3 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="hidden sm:inline">{isExportingPDF ? 'Exporting...' : 'Export PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
