import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditListComponent } from "../../components/audit/audit-list/audit-list.component";

@Component({
  selector: 'app-audit',
  standalone : true,
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
  imports: [AuditListComponent, CommonModule]
})
export class AuditComponent { }