import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog } from '../../../services/audit.service';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-audit-list',
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss'],
  providers: [DatePipe]
})
export class AuditListComponent implements OnInit {
  logs: AuditLog[] = [];
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  loading = false;

  filterForm: FormGroup;

  constructor(
    private auditService: AuditService,
    private datePipe: DatePipe,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      action: [''],
      userId: [''],
      startDate: [null],
      endDate: [null]
    });
  }

  ngOnInit(): void {
    this.loadLogs();
    
    this.filterForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this.loadLogs();
      });
  }

  loadLogs(): void {
    this.loading = true;
    const { action, userId, startDate, endDate } = this.filterForm.value;
    
    const safeDateTransform = (date: any): string | undefined => {
      return date ? this.datePipe.transform(date, 'yyyy-MM-dd') || undefined : undefined;
    };

    this.auditService.getLoginLogs(
      this.pageIndex,
      this.pageSize,
      action,
      userId,
      safeDateTransform(startDate),
      safeDateTransform(endDate)
    ).subscribe({
      next: (page) => {
        this.logs = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadLogs();
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.pageIndex = 0;
  }
}