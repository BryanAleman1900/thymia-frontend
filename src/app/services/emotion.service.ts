import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class EmotionService {
  private http = inject(HttpClient);
  private resource = 'emotions';

  sendEmotion(emotion: string, roomId: string) {
    return this.http.post(this.resource, { emotion, roomId });
  }
}
