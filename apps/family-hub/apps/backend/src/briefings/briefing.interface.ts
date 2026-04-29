export interface BriefingConfig {
  category: string;
  title: string;
  icon: string;
  searchQuery: string;
  searchQueries?: string[];
  searchResultCount?: number;
  /** Prompt système injecté avant les instructions (uniquement quand hasSearch=true) */
  systemPrompt?: string;
  modelProvider: 'openai' | 'huggingface';
  modelName: string;
  briefingInstructions: string;
}
