import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { WellnessTipsService, WellnessTip, Page } from '../../services/wellness-tips.service';


@Component({
  selector: 'app-wellness',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './wellness-history.component.html',
  styleUrls: ['./wellness-history.component.scss'],
})
export class WellnessHistoryComponent {
  private svc = inject(WellnessTipsService);

  tips: WellnessTip[] = [];
  loading = false;
  error: string | null = null;

  page = 0;
  size = 10;
  totalPages = 0;
  totalElements = 0;

  // Modal state
  showing: WellnessTip | null = null;
  viewing = false;

  ngOnInit() {
    this.load();
  }

  load(p = this.page) {
    this.loading = true;
    this.error = null;
    this.svc.getMyTips(p, this.size).subscribe({
      next: (res: Page<WellnessTip>) => {
        this.tips = res.content;
        this.page = res.number;
        this.size = res.size;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.loading = false;
      },
      error: () => {
        this.error = 'No se pudo cargar el historial.';
        this.loading = false;
      },
    });
  }

  prev() {
    if (this.page > 0) this.load(this.page - 1);
  }

  next() {
    if (this.page + 1 < this.totalPages) this.load(this.page + 1);
  }

  openTip(tip: WellnessTip) {
    this.viewing = true;
    this.svc.viewTip(tip.id).subscribe({
      next: (updated) => {
        // actualiza el item en la lista
        const idx = this.tips.findIndex(x => x.id === updated.id);
        if (idx >= 0) this.tips[idx] = updated;
        this.showing = updated;
        this.viewing = false;
      },
      error: () => {
        this.showing = tip; 
        this.viewing = false;
      },
    });
  }

  closeModal() {
    this.showing = null;
  }
}
