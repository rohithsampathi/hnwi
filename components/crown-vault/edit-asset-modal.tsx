"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { CrownVaultAsset, updateCrownVaultAsset } from "@/lib/api";

interface EditAssetModalProps {
  asset: CrownVaultAsset | null;
  isOpen: boolean;
  onClose: () => void;
  onAssetUpdated: (updatedAsset: CrownVaultAsset) => void;
}

export function EditAssetModal({ asset, isOpen, onClose, onAssetUpdated }: EditAssetModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    asset_type: "",
    value: "",
    currency: "USD",
    location: "",
    notes: ""
  });

  // Reset form data when asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.asset_data?.name || "",
        asset_type: asset.asset_data?.asset_type || "",
        value: asset.asset_data?.value?.toString() || "",
        currency: asset.asset_data?.currency || "USD",
        location: asset.asset_data?.location || "",
        notes: asset.asset_data?.notes || ""
      });
    }
  }, [asset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!asset) return;

    setIsLoading(true);
    try {
      const updateData = {
        name: formData.name,
        asset_type: formData.asset_type,
        value: parseFloat(formData.value) || 0,
        currency: formData.currency,
        location: formData.location,
        notes: formData.notes
      };

      
      const updatedAsset = await updateCrownVaultAsset(asset.asset_id, updateData);
      
      
      onAssetUpdated(updatedAsset);
      onClose();
      
      toast({
        title: "Asset Updated",
        description: `${formData.name} has been updated successfully.`,
        variant: "default"
      });

    } catch (error) {
      console.error('Update asset error:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update asset. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the details of your asset. All changes will be saved to your Crown Vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Asset Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Asset Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter asset name"
              required
              disabled={isLoading}
            />
          </div>

          {/* Asset Type */}
          <div className="space-y-2">
            <Label htmlFor="asset_type">Asset Type</Label>
            <Select 
              value={formData.asset_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, asset_type: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Real Estate">Real Estate</SelectItem>
                <SelectItem value="Vehicle">Vehicle</SelectItem>
                <SelectItem value="Art & Collectibles">Art & Collectibles</SelectItem>
                <SelectItem value="Jewelry">Jewelry</SelectItem>
                <SelectItem value="Stocks">Stocks</SelectItem>
                <SelectItem value="Bonds">Bonds</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
                <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value and Currency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency}
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CHF">CHF</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Enter location"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this asset"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Asset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}