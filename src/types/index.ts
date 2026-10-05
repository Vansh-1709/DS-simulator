export type TopicId = 'array' | 'tree' | 'stack' | 'queue' | 'linked-list' | 'graph';

export interface ComplexityInfo {
  access: string;
  search: string;
  insertion: string;
  deletion: string;
  space: string;
}

export interface TopicMeta {
  id: TopicId;
  name: string;
  tagline: string;
  category: string;
  description: string;
  gameTitle: string;
  gameDescription: string;
  color: string;
  accentHex: string;
  complexity: ComplexityInfo;
  realWorldExamples: string[];
}
