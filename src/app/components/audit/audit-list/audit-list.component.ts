import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog } from '../../../services/audit.service';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss'],
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule
  ],
  providers: [DatePipe]
})
export class AuditListComponent implements OnInit {
  logs: AuditLog[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  constructor(
    private auditService: AuditService,
    private datePipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return this.datePipe.transform(date, 'MMM d, y', 'en') || '';
  }

  loadLogs(): void {
    this.loading = true;

    this.auditService.getLoginLogs(
      this.pageIndex + 1,
      this.pageSize
    ).subscribe({
      next: (page) => {
        this.logs = page.content.map(log => ({
          ...log,
          loginTime: this.formatDate(log.loginTime.toString()),
          // Asegurando que la acción se muestre correctamente
          action: log.action === 'LOGIN_EXITOSO' ? 'Éxito' : 
                 (log.action === 'LOGIN' ? 'Éxito' : 'Fallido')
        }));
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }
}