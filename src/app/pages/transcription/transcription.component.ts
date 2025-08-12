import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

declare const webkitSpeechRecognition: any;

@Component({
  selector: 'app-transcription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transcription.component.html',
})
export class TranscriptionComponent implements OnInit, OnDestroy {
  finalTranscript = signal<string>('');
  interim = signal<string>('');
  recognizing = signal(false);

  private recognition: any = null;
  private roomId: string = '';
  private lastFinalChunk = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.roomId = (window as any).currentRoomId || '';
    const SpeechRec: any =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) return;

    this.recognition = new SpeechRec();
    this.recognition.lang = 'es-ES';
    this.recognition.interimResults = true;
    this.recognition.continuous = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      let interimBuild = '';
      let finalBuild = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = (event.results[i][0].transcript || '').trim();
        if (!t) continue;
        if (event.results[i].isFinal) finalBuild += t + ' ';
        else interimBuild += t + ' ';
      }

      this.interim.set(interimBuild.trim());
      if (finalBuild) {
        const text = finalBuild.trim();
        this.interim.set('');
        this.appendFinal(text);
      }
    };

    this.recognition.onerror = () => {};
    this.recognition.onend = () => {
      if (this.recognizing()) {
        setTimeout(() => { try { this.recognition.start(); } catch {} }, 150);
      }
    };

    try {
      this.recognition.start();
      this.recognizing.set(true);
    } catch {}
  }

  private normalize(s: string) {
    return (s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private appendFinal(text: string) {
    const current = this.finalTranscript();
    const normCurrent = this.normalize(current);
    const normText = this.normalize(text);

    if (normText === this.normalize(this.lastFinalChunk)) return;
    if (normCurrent.endsWith(normText)) return;

    const updated = (current + (current ? ' ' : '') + text).trim();
    this.finalTranscript.set(updated);
    this.lastFinalChunk = text;

    if (this.roomId) {
      this.http.post(`calls/${this.roomId}/transcripts`, { text, ts: Date.now() }).subscribe();
    }
  }

  pause() {
    this.recognizing.set(false);
    try { this.recognition?.stop(); } catch {}
  }

  resume() {
    if (!this.recognizing()) {
      this.recognizing.set(true);
      try { this.recognition?.start(); } catch {}
    }
  }

  ngOnDestroy(): void {
    this.pause();
  }
}
