import { Component } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EmotionDetectorComponent } from '../emotion-detector/emotion-detector.component';
import { TranscriptionComponent } from '../transcription/transcription.component'; 

@Component({
  selector: 'app-call',
  standalone: true,
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
  imports: [EmotionDetectorComponent, TranscriptionComponent],
})
export class CallComponent {
  public jitsiRoomUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) {
    const roomId = this.generateRoomId();
    const url = `https://meet.jit.si/${roomId}`;
    this.jitsiRoomUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  private generateRoomId(): string {
    return 'thymia-room-' + Math.floor(Math.random() * 100000);
  }
}
