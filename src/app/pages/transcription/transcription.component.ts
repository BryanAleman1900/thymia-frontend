import { Component, OnInit, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-transcription',
  standalone: true,
  templateUrl: './transcription.component.html',
})
export class TranscriptionComponent implements OnInit {
  public transcript = signal<string>('');

  private socket: WebSocket | null = null;
  private audioContext: AudioContext | null = null;

  ngOnInit(): void {
    this.startDeepgramTranscription();
  }

  async startDeepgramTranscription() {
    const apiKey = environment.deepgramApiKey;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.audioContext = new AudioContext();
      const source = this.audioContext.createMediaStreamSource(stream);
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      this.socket = new WebSocket(`wss://api.deepgram.com/v1/listen`, [
        'token',
        apiKey,
      ]);

      this.socket.onopen = () => {
        processor.onaudioprocess = (e) => {
          if (this.socket?.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const int16Array = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              int16Array[i] = inputData[i] * 32767;
            }
            this.socket?.send(int16Array.buffer);
          }
        };
        source.connect(processor);
        processor.connect(this.audioContext!.destination);
      };

      this.socket.onmessage = (msg) => {
        const data = JSON.parse(msg.data);
        const transcriptText = data.channel?.alternatives?.[0]?.transcript;
        if (transcriptText) {
          this.transcript.update((prev) => prev + ' ' + transcriptText);
        }
      };

      this.socket.onerror = (err) => console.error('Deepgram error', err);
      this.socket.onclose = () => console.log('Deepgram closed');
    } catch (err) {
      console.error('Error al capturar audio:', err);
    }
  }
}
