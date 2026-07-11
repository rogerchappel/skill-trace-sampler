export type SampleCategory = 'command' | 'file' | 'tool' | 'approval' | 'blocker' | 'verification' | 'claim';

export interface TraceSample {
  category: SampleCategory;
  line: number;
  text: string;
  source: string;
}

export interface TraceReport {
  sources: string[];
  generatedAt: string;
  sampleCount: number;
  samples: TraceSample[];
  redactions: string[];
  warnings: string[];
}

export interface SamplerOptions {
  maxPerCategory: number;
  now?: string;
}
