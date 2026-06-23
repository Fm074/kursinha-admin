// src/app/models.ts
export interface Lesson {
  id: string;
  title: string;
  durationSeconds?: number;
  type?: 'video' | 'pdf' | 'text';
  thumbnail?: string;
  url?: string;
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  cover?: string;
  instructor?: { name: string; avatar?: string };
  shortDescription?: string;
  progressPercent?: number; // 0-100
  modulesCount?: number;
  lessonsCount?: number;
}

export interface Lesson {
  id: string;
  title: string;
  durationSeconds?: number;
  type?: 'video' | 'pdf' | 'text';
  thumbnail?: string;
  url?: string;
  completed?: boolean;
  description?: string;
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  cover?: string;
  instructor?: { name: string; avatar?: string };
  shortDescription?: string;
  progressPercent?: number; // 0-100
  modulesCount?: number;
  lessonsCount?: number;
}
