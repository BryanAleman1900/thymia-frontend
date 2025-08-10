import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmotionDetectorComponent } from '../emotion-detector/emotion-detector.component';
import { TranscriptionComponent } from '../transcription/transcription.component';
import { SummaryService, CallSummary } from '../../services/summary.service';
import { ReportService } from '../../services/report.service';

declare const JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-call',
  standalone: true,
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss'],
  imports: [CommonModule, EmotionDetectorComponent, TranscriptionComponent],
})
export class CallComponent implements OnDestroy {
  started = signal(false);
  roomId = `thymia-room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  summary: CallSummary | null = null;
  private api: any = null;

  constructor(
    private summaryService: SummaryService,
    private reportService: ReportService
  ) {}

  startCall() {
    this.started.set(true);
    (window as any).currentRoomId = this.roomId;

    const domain = 'meet.jit.si';
    const parentNode = document.getElementById('jitsi-container');
    if (!parentNode) return;

    const options = {
      roomName: this.roomId,
      parentNode,
      userInfo: { displayName: 'Usuario' },
      configOverwrite: { disableDeepLinking: true },
      interfaceConfigOverwrite: {},
    };

    try {
      this.api = new JitsiMeetExternalAPI(domain, options);
      this.api.addListener('videoConferenceJoined', () => {});
      this.api.addListener('readyToClose', () => this.endCall());
    } catch (e) {
      console.error('Error inicializando Jitsi:', e);
      this.started.set(false);
    }
  }

  endCall() {
    try { this.api?.dispose?.(); } catch {}
    this.api = null;
    this.started.set(false);

    this.summaryService.getSummary(this.roomId).subscribe({
      next: s => { this.summary = s; },
      error: () => {
        this.summary = {
          roomId: this.roomId,
          transcript: '',
          emotionCounts: {},
          segments: [],
          emotions: []
        };
      }
    });
  }

  downloadEmotionPdf() {
    if (this.summary) this.reportService.downloadEmotionReport(this.summary);
  }

  downloadTranscriptPdf() {
    if (this.summary) this.reportService.downloadTranscript(this.summary);
  }

  ngOnDestroy(): void {
    try { this.api?.dispose?.(); } catch {}
    this.api = null;
    this.started.set(false);
  }
}
