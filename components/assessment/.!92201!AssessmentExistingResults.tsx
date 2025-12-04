// components/assessment/AssessmentExistingResults.tsx
// Shows existing assessment results with download and share options

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, Calendar, Brain, FileText, ExternalLink } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AssessmentExistingResultsProps {
  latestAssessment: {
    session_id: string;
    tier: string;
    completed_at: string;
    can_retake_at: string;
    pdf_url?: string;
  };
}

const TIER_CONFIG = {
  architect: {
