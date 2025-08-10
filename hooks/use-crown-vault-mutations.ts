"use client";

import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import {
  createHeir,
  updateHeir,
  deleteHeir,
  updateAssetHeirs,
  processCrownVaultAssetsBatch,
  type CrownVaultHeir
} from '@/lib/api';

interface UseCrownVaultMutationsProps {
  onDataRefresh?: (data: { assets: any[]; heirs: any[]; stats: any }) => void;
}

export function useCrownVaultMutations({ onDataRefresh }: UseCrownVaultMutationsProps = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createHeirMutation = async (heirData: {
    name: string;
    relationship: string;
    email?: string;
    phone?: string;
    notes?: string;
  }) => {
    setIsLoading(true);
    try {
      const result = await createHeir(heirData);
      
      // Trigger data refresh in parent component
      if (onDataRefresh) {
        onDataRefresh(result.refreshedData);
      }
      
      toast({
        title: "Heir Added Successfully",
        description: `${result.heir.name} has been added to your Crown Vault.`,
      });
      
      return result.heir;
    } catch (error) {
      toast({
        title: "Failed to Add Heir",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeirMutation = async (
    heirId: string,
    heirData: {
      name?: string;
      relationship?: string;
      email?: string;
      phone?: string;
      notes?: string;
    }
  ) => {
    setIsLoading(true);
    try {
      const result = await updateHeir(heirId, heirData);
      
      // Trigger data refresh in parent component
      if (onDataRefresh) {
        onDataRefresh(result.refreshedData);
      }
      
      toast({
        title: "Heir Updated Successfully",
        description: `${result.heir.name}'s information has been updated.`,
      });
      
      return result.heir;
    } catch (error) {
      toast({
        title: "Failed to Update Heir",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteHeirMutation = async (heirId: string) => {
    setIsLoading(true);
    try {
      const result = await deleteHeir(heirId);
      
      // Trigger data refresh in parent component
      if (onDataRefresh) {
        onDataRefresh(result.refreshedData);
      }
      
      toast({
        title: "Heir Deleted Successfully",
        description: "The heir has been removed from your Crown Vault.",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Failed to Delete Heir",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssetHeirsMutation = async (assetId: string, heirIds: string[]) => {
    setIsLoading(true);
    try {
      const result = await updateAssetHeirs(assetId, heirIds);
      
      // Trigger data refresh in parent component
      if (onDataRefresh) {
        onDataRefresh(result.refreshedData);
      }
      
      toast({
        title: "Asset Updated Successfully",
        description: result.message,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Failed to Update Asset",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const processBatchAssetsMutation = async (rawText: string, context?: string) => {
    setIsLoading(true);
    try {
      const result = await processCrownVaultAssetsBatch(rawText, context);
      
      // Trigger data refresh in parent component
      if (onDataRefresh) {
        onDataRefresh(result.refreshedData);
      }
      
      toast({
        title: "Assets Processed Successfully",
        description: `Added ${result.assets.length} assets to your Crown Vault.`,
      });
      
      return result;
    } catch (error) {
      toast({
        title: "Failed to Process Assets",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    createHeir: createHeirMutation,
    updateHeir: updateHeirMutation,
    deleteHeir: deleteHeirMutation,
    updateAssetHeirs: updateAssetHeirsMutation,
    processBatchAssets: processBatchAssetsMutation
  };
}