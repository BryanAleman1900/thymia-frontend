import { Injectable } from '@angular/core';
import { CallSummary } from './summary.service';

// @ts-ignore
import pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({ providedIn: 'root' })
export class ReportService {
  private emotionMap: Record<string, string> = {
    happy: '🙂 Feliz',
    sad: '😢 Triste',
    angry: '😠 Enojado',
    fearful: '😨 Miedo',
    disgusted: '🤢 Disgusto',
    surprised: '😲 Sorpresa',
    neutral: '😐 Neutral'
  };

  downloadEmotionReport(s: CallSummary) {
    const countsRows = Object.entries(s.emotionCounts || {}).map(([k, v]) => [
      this.emotionMap[k] ?? k,
      String(v)
    ]);

    const timelineRows = (s.emotions || []).map(e => [
      new Date(e.timestamp).toLocaleString(),
      this.emotionMap[e.emotion] ?? e.emotion
    ]);

    const docDefinition = {
      info: { title: `Reporte de Emociones - ${s.roomId}` },
      content: [
        { text: 'Reporte de Emociones', style: 'h1' },
        { text: `Sala: ${s.roomId}`, margin: [0, 0, 0, 4] },
        { text: `Fecha de generación: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 12] },

        { text: 'Conteo por emoción', style: 'h2', margin: [0, 8, 0, 6] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 80],
            body: [
              [{ text: 'Emoción', bold: true }, { text: 'Cantidad', bold: true }],
              ...countsRows
            ]
          },
          layout: 'lightHorizontalLines',
          margin: [0, 0, 0, 12]
        },

        { text: 'Línea de tiempo', style: 'h2', margin: [0, 8, 0, 6] },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              [{ text: 'Hora', bold: true }, { text: 'Emoción', bold: true }],
              ...timelineRows
            ]
          },
          layout: 'lightHorizontalLines'
        }
      ],
      styles: {
        h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] },
        h2: { fontSize: 14, bold: true }
      },
      defaultStyle: { fontSize: 11 }
    };

    pdfMake.createPdf(docDefinition).download(`reporte-emociones-${s.roomId}.pdf`);
  }

  downloadTranscript(s: CallSummary) {
    const text = (s.transcript || '').trim() || '(Sin datos)';
    const docDefinition = {
      info: { title: `Transcripción - ${s.roomId}` },
      content: [
        { text: 'Transcripción de la sesión', style: 'h1' },
        { text: `Sala: ${s.roomId}`, margin: [0, 0, 0, 4] },
        { text: `Fecha de generación: ${new Date().toLocaleString()}`, margin: [0, 0, 0, 12] },
        { text, margin: [0, 8, 0, 0] }
      ],
      styles: {
        h1: { fontSize: 18, bold: true, margin: [0, 0, 0, 8] }
      },
      defaultStyle: { fontSize: 11 }
    };

    pdfMake.createPdf(docDefinition).download(`transcripcion-${s.roomId}.pdf`);
  }
}
