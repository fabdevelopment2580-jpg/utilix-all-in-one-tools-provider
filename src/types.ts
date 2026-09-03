export type ToolCategory = 'all' | 'ai' | 'image' | 'pdf' | 'text' | 'design' | 'utility';

export interface ToolItem {
  id: string;
  name: string;
  category: ToolCategory;
  categoryLabel: string;
  description: string;
  iconName: string;
  keywords: string[];
  isPopular?: boolean;
}

export type ThemeMode = 'light' | 'dark';

export interface RecentTool {
  id: string;
  timestamp: number;
}
