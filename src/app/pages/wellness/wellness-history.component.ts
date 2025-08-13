import { WellnessTipsService } from '../../services/wellness-tips.service';
import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { WellnessTip } from '../../interfaces';


@Component({
  selector: 'app-wellness',
  templateUrl: './wellness-history.component.html',
  styleUrls: ['./wellness-history.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  standalone: true
})
export class WellnessHistoryComponent implements OnInit {
  tips: WellnessTip[] = [];     
  loading = false;
  error = '';

  page = 0;
  size = 6;
  totalPages = 0;


  showing: any = null;
  viewing = false;

  constructor(private tipsSvc: WellnessTipsService) {}

  ngOnInit(): void {
    this.fetchTips();
  }

  fetchTips(): void {
    this.loading = true;
    this.error = '';
    this.tipsSvc.getMyTips(this.page, this.size).subscribe({
      next: (res: any) => {
        
        if (res && res.content) {
          this.tips = res.content;
          this.totalPages = res.totalPages ?? 0;
        } else {

          this.tips = Array.isArray(res) ? res : [];
        }
        this.loading = false;
      },
      error: (e) => {
        this.error = e?.error?.message || 'No se pudo cargar el historial.';
        this.loading = false;
      },
    });
  }

  prev(): void {
    if (this.page === 0) return;
    this.page--; this.fetchTips();
  }

  next(): void {
    if (this.page + 1 >= this.totalPages) return;
    this.page++; this.fetchTips();
  }

  openTip(tip: any): void {

    this.viewing = true;
    this.tipsSvc.viewTip(tip.id).subscribe({
      next: (updated: any) => {

        tip.viewCount = updated?.viewCount ?? tip.viewCount;
        tip.firstViewedAt = updated?.firstViewedAt ?? tip.firstViewedAt;
        tip.lastViewedAt = updated?.lastViewedAt ?? tip.lastViewedAt;
        this.showing = updated || tip;
        this.viewing = false;
      },
      error: () => {
        this.showing = tip; 
        this.viewing = false;
      },
    });
  }

  closeModal(): void {
    this.showing = null;
  }
}

