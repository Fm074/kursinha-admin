import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private apiBase = '/api';

  constructor(private http: HttpClient) {}

  saveProgress(userId: string, courseId: string, lessonId: string, seconds: number): Observable<any> {
    // return this.http.post(`${this.apiBase}/progress`, { userId, courseId, lessonId, seconds });
    console.log('saveProgress', { userId, courseId, lessonId, seconds });
    return of({ ok: true });
  }

  markLessonComplete(userId: string, lessonId: string): Observable<any> {
    // return this.http.post(`${this.apiBase}/lessons/${lessonId}/complete`, {});
    console.log('markLessonComplete', { userId, lessonId });
    return of({ ok: true });
  }
}
