// src/app/services/courses.service.ts
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Course, Module } from '../interfaces/models';

// Mock data (exemplo): substituir por chamadas HTTP reais
const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Growth Sprint',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=Growth+Sprint',
    instructor: {
      name: 'Ana Costa',
      avatar: 'https://placehold.co/60/76A96E/ffffff?text=AC',
    },
    shortDescription: 'Sprint intensivo para crescimento rápido.',
    progressPercent: 28,
    modulesCount: 6,
    lessonsCount: 32,
  },
  {
    id: 'c2',
    title: 'Masterclass de Copy',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=Masterclass+Copy',
    instructor: {
      name: 'Bruno Lima',
      avatar: 'https://placehold.co/60/3498DB/ffffff?text=BL',
    },
    shortDescription: 'Copy que converte em formatos longos e curtos.',
    progressPercent: 72,
    modulesCount: 8,
    lessonsCount: 48,
  },
  {
    id: 'c3',
    title: 'Product Launch Lab',
    cover: 'https://placehold.co/400x250/202330/ffffff?text=Launch+Lab',
    instructor: {
      name: 'Lívia Torres',
      avatar: 'https://placehold.co/60/E74C3C/ffffff?text=LT',
    },
    shortDescription: 'Lançamentos do zero ao topo.',
    progressPercent: 12,
    modulesCount: 5,
    lessonsCount: 22,
  },
  {
    id: 'c4',
    title: 'IA para Creators',
    cover: 'https://placehold.co/400x250/202330/ffffff?text=IA+Creators',
    instructor: {
      name: 'Rafael Souza',
      avatar: 'https://placehold.co/60/9B59B6/ffffff?text=RS',
    },
    shortDescription: 'Automatize e acelere sua produção com IA.',
    progressPercent: 0,
    modulesCount: 7,
    lessonsCount: 40,
  },
  // --- Novos Cursos Adicionados ---
  {
    id: 'c5',
    title: 'Edição Profissional de Vídeo',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=Edicao+Video',
    instructor: {
      name: 'Clara Mendes',
      avatar: 'https://placehold.co/60/F39C12/ffffff?text=CM',
    },
    shortDescription:
      'Domine softwares de edição e crie vídeos cinematográficos.',
    progressPercent: 55,
    modulesCount: 10,
    lessonsCount: 65,
  },
  {
    id: 'c6',
    title: 'Branding e Identidade Visual',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=Branding+Visual',
    instructor: {
      name: 'André Farias',
      avatar: 'https://placehold.co/60/1ABC9C/ffffff?text=AF',
    },
    shortDescription: 'Construa uma marca forte e visualmente atraente.',
    progressPercent: 88,
    modulesCount: 7,
    lessonsCount: 35,
  },
  {
    id: 'c7',
    title: 'SEO Estratégico',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=SEO+Estrategico',
    instructor: {
      name: 'Fernanda Reis',
      avatar: 'https://placehold.co/60/34495E/ffffff?text=FR',
    },
    shortDescription: 'Otimize seu conteúdo para rankear no topo do Google.',
    progressPercent: 41,
    modulesCount: 9,
    lessonsCount: 50,
  },
  {
    id: 'c8',
    title: 'Gestão de Mídias Sociais',
    cover:
      'https://placehold.co/400x250/202330/ffffff?text=Midias+Sociais',
    instructor: {
      name: 'Guilherme Neves',
      avatar: 'https://placehold.co/60/963D6B/ffffff?text=GN',
    },
    shortDescription: 'Planejamento e execução para engajamento máximo.',
    progressPercent: 100, // Curso concluído
    modulesCount: 6,
    lessonsCount: 30,
  },
];

@Injectable({ providedIn: 'root' })
export class CoursesService {
  // Simula rede; retorne Observable para facilitar switch para HttpClient
  getMyCourses(userId?: string): Observable<Course[]> {
    // Aqui poderia ser: return this.http.get<Course[]>(`${api}/members/${userId}/courses`);
    return of(MOCK_COURSES);
  }

  getCourse(courseId: string): Observable<Course> {
    // return this.http.get<Course>(`${this.apiBase}/courses/${courseId}`);
    return of({
      id: courseId,
      title: 'Exemplo de Curso',
      cover: 'assets/covers/placeholder.jpg',
      instructor: {
        name: 'Instrutor Exemplo',
        avatar: 'assets/avatars/placeholder.jpg',
      },
      shortDescription: 'Descrição curta do curso.',
      progressPercent: 12,
      modulesCount: 3,
      lessonsCount: 10,
    });
  }

  getCourseStructure(courseId: string): Observable<Module[]> {
    // return this.http.get<Module[]>(`${this.apiBase}/courses/${courseId}/structure`);
    // mock
    const mock: Module[] = [
      {
        id: 'm1',
        title: 'Módulo 1 — Fundamentos',
        lessons: [
          {
            id: 'l1',
            title: 'Aula 1 — Apresentação',
            type: 'video',
            url: 'assets/videos/sample.mp4',
            durationSeconds: 90,
            completed: false,
          },
          {
            id: 'l2',
            title: 'Aula 2 — Conceitos',
            type: 'video',
            url: 'assets/videos/sample.mp4',
            durationSeconds: 120,
            completed: false,
          },
        ],
      },
      {
        id: 'm2',
        title: 'Módulo 2 — Prática',
        lessons: [
          {
            id: 'l3',
            title: 'Aula 3 — Hands-on',
            type: 'video',
            url: 'assets/videos/sample.mp4',
            durationSeconds: 300,
            completed: false,
          },
        ],
      },
    ];
    return of(mock);
  }
}
