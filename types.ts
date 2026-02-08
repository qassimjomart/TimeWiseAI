
export interface TimeCategory {
  id: string;
  name: string;
  color: string;
}

export interface TimeEntry {
  id: number;
  categoryId: string;
  durationMinutes: number;
  description: string;
  date: string; 
}

export interface AIAnalysis {
  insights: string[];
  suggestions: string[];
}

export interface ChartData {
  name: string;
  value: number;
  color: string;
}
