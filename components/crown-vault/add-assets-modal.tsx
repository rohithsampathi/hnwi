import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Shield, Lock, Brain, Database } from "lucide-react";

interface ProcessingPhase {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}

interface AddAssetsModalProps {
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  rawText: string;
  setRawText: (text: string) => void;
  context: string;
  setContext: (context: string) => void;
  handleAddAssets: () => void;
  isProcessing: boolean;
  processingPhase: number;
}

const processingPhases: ProcessingPhase[] = [
  { icon: Brain, text: "AI analyzing your asset description..." },
  { icon: Database, text: "Structuring asset data securely..." },
  { icon: Lock, text: "Encrypting sensitive information..." },
  { icon: Shield, text: "Finalizing vault security protocols..." }
];

export function AddAssetsModal({
  isAddModalOpen,
  setIsAddModalOpen,
  rawText,
  setRawText,
  context,
  setContext,
  handleAddAssets,
  isProcessing,
  processingPhase
}: AddAssetsModalProps) {
  return (
    <>
      {/* Add Assets Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Assets to Your Vault</DialogTitle>
            <DialogDescription>
              Describe your assets naturally. Include asset details, values, and heir assignments. Our AI will structure everything securely.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="I have a 5-bedroom villa in Mumbai worth $2M going to my daughter Priya..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="min-h-32 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-foreground/60 dark:text-muted-foreground font-medium">
                  {rawText.length < 50 ? `${50 - rawText.length} characters needed` : `${rawText.length} characters`}
                </span>
              </div>
            </div>
            <div>
              <Input
                placeholder="Context/Notes (e.g., Estate Planning 2025)"
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddAssets}
                disabled={rawText.length < 50}
              >
                <Shield className="h-4 w-4 mr-2" />
                Process & Secure
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Processing Modal */}
      <Dialog open={isProcessing} onOpenChange={() => {}}>
        <DialogContent className="max-w-md">
          <DialogHeader className="sr-only">
            <DialogTitle>Processing Assets</DialogTitle>
            <DialogDescription>
              Your assets are being processed and secured. Please wait while we complete this operation.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <div className="mb-4">
              {processingPhases[processingPhase] && (() => {
                const IconComponent = processingPhases[processingPhase].icon;
                return <IconComponent className="h-16 w-16 text-primary mx-auto animate-pulse" />;
              })()}
            </div>
            <h3 className="text-lg font-semibold mb-4">
              {processingPhases[processingPhase]?.text || "Processing..."}
            </h3>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${((processingPhase + 1) / processingPhases.length) * 100}%` }}
              />
            </div>
            <p className="text-sm text-foreground/70 dark:text-muted-foreground mt-2">
              Phase {processingPhase + 1} of {processingPhases.length}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}