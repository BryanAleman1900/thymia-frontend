import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as faceapi from 'face-api.js';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-backend-cpu';
import { EmotionService } from '../../services/emotion.service';
import { EmotionDisplayPipe } from '../../pipes/emotion-display.pipe';

@Component({
  selector: 'app-emotion-detector',
  standalone: true,
  imports: [CommonModule, EmotionDisplayPipe],
  templateUrl: './emotion-detector.component.html',
  styleUrls: ['./emotion-detector.component.scss']
})
export class EmotionDetectorComponent implements OnInit, AfterViewInit, OnDestroy {
  currentEmotion: string = '';
  private intervalId: number | undefined;
  private mediaStream: MediaStream | null = null;

  constructor(private emotionService: EmotionService) {}

  ngOnInit(): void {}

  async ngAfterViewInit(): Promise<void> {
    await this.initTensorflow();
    await this.loadModels();

    const video = document.getElementById('videoElement') as HTMLVideoElement | null;
    if (!video) return;

    this.mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = this.mediaStream;
    await video.play();

    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = window.setInterval(async () => {
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detections?.expressions) {
        const sorted = Object.entries(detections.expressions)
          .sort((a, b) => (b[1] as number) - (a[1] as number));
        const topEmotion = sorted[0][0];
        this.currentEmotion = topEmotion;
        this.sendEmotion(topEmotion);
      }
    }, 5000);
  }

  private async initTensorflow() {
    try {
      await tf.setBackend('webgl');
    } catch {
      await tf.setBackend('cpu');
    }
    await tf.ready();
  }

  private async loadModels() {
    if (!faceapi.nets.tinyFaceDetector.isLoaded) {
      await faceapi.nets.tinyFaceDetector.loadFromUri('/assets/models/tiny_face_detector');
    }
    if (!faceapi.nets.faceExpressionNet.isLoaded) {
      await faceapi.nets.faceExpressionNet.loadFromUri('/assets/models/face_expression');
    }
  }

  private sendEmotion(emotion: string) {
    const roomId = (window as any).currentRoomId || '';
    this.emotionService.sendEmotion(emotion, roomId).subscribe({
      next: () => {},
      error: () => {}
    });
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
      this.mediaStream = null;
    }
  }
}
