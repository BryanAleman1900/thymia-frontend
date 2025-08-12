import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'emotionDisplay',
  standalone: true
})
export class EmotionDisplayPipe implements PipeTransform {
  transform(value: string): string {
    const map: { [key: string]: string } = {
      happy: '🙂 Feliz',
      sad: '😢 Triste',
      angry: '😠 Enojado',
      fearful: '😨 Miedo',
      disgusted: '🤢 Disgusto',
      surprised: '😲 Sorpresa',
      neutral: '😐 Neutral'
    };
    return map[value] || '❓ Desconocido';
  }
}