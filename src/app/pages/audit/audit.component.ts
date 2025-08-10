import { Component } from '@angular/core';
import { AuditListComponent } from "../../components/audit/audit-list/audit-list.component";

@Component({
  selector: 'app-audit',
  standalone : true,
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.css'],
  imports: [AuditListComponent]
})
export class AuditComponent { }