import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EmotionService {
  private http = inject(HttpClient);
  private emotionURL = `emotions`;

  sendEmotion(emotion: string) {
    return this.http.post(this.emotionURL, { emotion });
  }
}
