import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as faceapi from 'face-api.js';
import { EmotionService } from '../../services/emotion.service';
import { EmotionDisplayPipe } from '../../pipes/emotion-display.pipe';

@Component({
  selector: 'app-emotion-detector',
  standalone: true,
  imports: [CommonModule, EmotionDisplayPipe],
  templateUrl: './emotion-detector.component.html',
  styleUrls: ['./emotion-detector.component.scss']
})
export class EmotionDetectorComponent implements OnInit, AfterViewInit {
  currentEmotion: string = '';

  constructor(private emotionService: EmotionService) {}

  ngOnInit(): void {
    this.loadModels();
  }

  async ngAfterViewInit(): Promise<void> {
    const video = document.getElementById('videoElement') as HTMLVideoElement;
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    video.addEventListener('play', () => {
      setInterval(async () => {
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceExpressions();

        if (detections?.expressions) {
          const sorted = Object.entries(detections.expressions).sort((a, b) => b[1] - a[1]);
          const topEmotion = sorted[0][0];
          this.currentEmotion = topEmotion;
          this.sendEmotion(topEmotion);
        }
      }, 5000);
    });
  }

  async loadModels() {
    await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models/tiny_face_detector');
    await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models/face_expression');
  }

  sendEmotion(emotion: string) {
    this.emotionService.sendEmotion(emotion).subscribe({
      next: () => console.log('Emoción enviada:', emotion),
      error: (err) => console.error('Error al enviar emoción:', err),
    });
  }
}
