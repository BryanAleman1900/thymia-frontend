import { Component, OnInit } from '@angular/core';
import { AuditService, AuditLog } from '../../../services/audit.service';
import { PageEvent } from '@angular/material/paginator';
import { DatePipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  templateUrl: './audit-list.component.html',
  styleUrls: ['./audit-list.component.scss'],
  providers: [DatePipe],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule,
    MatCardModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule
  ]
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
    return date ? this.datePipe.transform(date, 'yyyy-MM-ddTHH:mm:ss') || undefined : undefined;
  };

  this.auditService.getLoginLogs(
    this.pageIndex + 1,
    this.pageSize,
    action,
    userId,
    safeDateTransform(startDate),
    safeDateTransform(endDate)
  ).subscribe({
    next: (page) => {
      this.logs = page.content.map(log => ({
        ...log,
        loginTime: this.datePipe.transform(log.loginTime, 'medium') || log.loginTime
      }));
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