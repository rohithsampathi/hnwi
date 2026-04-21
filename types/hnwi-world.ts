export interface HNWIWorldPatternMetadata {
  signal_count?: number
  bundle_count?: number
  related_development_count?: number
  citation_count?: number
  quality_score?: number
  validation_status?: string
  native_version?: string
  verdict?: string
  pattern_labels?: string[]
  signal_labels?: string[]
  bundle_labels?: string[]
}

export interface HNWIWorldLibraryContract {
  source_of_truth: string
  central_library: string
  central_registry: string
  canonical_versions: Record<string, string>
  substrate_order: string[]
  brain_dimensions: string[]
  state_channels: string[]
  surface: string
  canonical_projection_key: string
  substrate_family: string
  native_version?: string | null
  validation_status?: string | null
  verdict?: string | null
  write_back_targets: string[]
}

export interface HNWIWorldBrainContract {
  dimensions: string[]
  state_channels: string[]
}

export interface HNWIWorldKingdomContract {
  source_of_truth: string
  central_library: string
  central_registry: string
  canonical_versions: Record<string, string>
  substrate_order: string[]
  brain_dimensions: string[]
  state_channels: string[]
}

export interface HNWIWorldNumericalDataItem {
  number: string
  unit: string
  context: string
  source?: string
  industry?: string
  product?: string
  article_date?: string
}

export interface HNWIWorldDevelopment {
  id: string
  title: string
  description: string
  industry: string
  date?: string
  summary: string
  product?: string
  url?: string
  source?: string
  score?: number | null
  numerical_data?: HNWIWorldNumericalDataItem[]
  pattern_metadata?: HNWIWorldPatternMetadata
  library_contract?: HNWIWorldLibraryContract
  brain_contract?: HNWIWorldBrainContract
}
