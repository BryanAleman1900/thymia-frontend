import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { JournalService} from '../../services/journal.service';
import { SharedJournalEntry } from '../../interfaces';

@Component({
  standalone: true,
  selector: 'app-shared',
  imports: [CommonModule],
  template: `
    <div class="p-4 text-white">
      <h1>Compartido conmigo</h1>

      <div *ngIf="loading" class="opacity-70">Cargando...</div>
      <div *ngIf="!loading && entries.length===0" class="opacity-70">
        No hay entradas compartidas todavía.
      </div>

      <div *ngFor="let e of entries" class="bg-[#1f1f1f] rounded-xl p-3 my-2">
        <div class="flex justify-between items-center">
          <div>
            <div class="font-bold">{{ e.patientName }}</div>
            <div class="text-xs opacity-70">{{ e.patientEmail }}</div>
          </div>
          <div class="text-xs opacity-70">{{ e.createdAt | date:'medium' }}</div>
        </div>

        <div class="mt-2 whitespace-pre-wrap">{{ e.content }}</div>

        <div class="mt-2 text-sm" *ngIf="e.sentimentLabel">
          <span class="font-semibold">{{ e.sentimentLabel }}</span>
          <span class="text-xs opacity-70" *ngIf="e.sentimentScore !== null && e.sentimentScore !== undefined">
            ({{ e.sentimentScore | number:'1.2-2' }})
          </span>
        </div>
      </div>
    </div>
  `
})
export class SharedWithMeComponent implements OnInit {
  entries: SharedJournalEntry[] = [];
  loading = false;

  constructor(private journal: JournalService) {}

  ngOnInit(): void {
    this.loading = true;
    this.journal.getSharedWithMe().subscribe({
      next: data => { this.entries = data; this.loading = false; },
      error: _ => { this.entries = []; this.loading = false; }
    });
  }
}