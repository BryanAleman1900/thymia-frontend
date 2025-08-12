import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';
import { JournalService } from '../../services/journal.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JournalEntry } from '../../interfaces/index';
import { Router } from '@angular/router';

@Component({
  selector: 'app-journal',
  templateUrl: './journal.component.html',
  styleUrls: ['./journal.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class JournalComponent implements OnInit {
  form!: FormGroup;
  entries: JournalEntry[] = [];
  errorMessage: string = '';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private journalService: JournalService
  ) {}

    goToWellnessHistory() {
    this.router.navigate(['/app/wellness']);
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      content: ['', Validators.required]
    });

    this.loadEntries();
  }

  submit(): void {
    if (this.form.invalid) {
      this.errorMessage = 'El contenido no puede estar vacío.';
      return;
    }

    const content = this.form.value.content as string;

    this.journalService.createEntry(content).subscribe({
      next: () => {
        this.form.reset();
        this.errorMessage = '';
        this.loadEntries();
      },
      error: (err) => {
        console.error('Error al guardar la entrada:', err);
        this.errorMessage = 'Hubo un problema al guardar tu entrada.';
      }
    });
  }

  loadEntries(): void {
    this.journalService.getMyEntries().subscribe({
      next: (data) => {
        this.entries = data;
      },
      error: (err) => {
        console.error('Error al cargar entradas:', err);
      }
    });
  }

 onCheckboxChange(event: Event, entry: JournalEntry): void {
  const input = event.target as HTMLInputElement;
  this.toggleShare(entry, input.checked);
}

toggleShare(entry: JournalEntry, shared: boolean): void {
  this.journalService.setShared(entry.id, shared).subscribe({
    next: () => entry.sharedWithProfessional = shared,
    error: (err: any) => console.error('Error al cambiar visibilidad:', err)
  });
}
}



