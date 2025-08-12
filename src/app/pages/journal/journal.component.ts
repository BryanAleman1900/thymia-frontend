import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, FormGroup, Validators } from '@angular/forms';
import { JournalService } from '../../services/journal.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { JournalEntry } from '../../interfaces/index';
import { Router } from '@angular/router';
import { TherapistService } from '../../services/therapist.service';
import { Therapist } from '../../interfaces/index';

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
  errorMessage: string = 'La entrada es obligatoria y no debe exceder 1500 caracteres.';

    // estado del modal de compartir
  shareOpen = false;
  shareLoading = false;
  therapists: Therapist[] = [];
  selectedEmails = new Set<string>();
  activeEntryId: number | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private journalService: JournalService,
    private therapistsSvc: TherapistService
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



  openShare(entry: JournalEntry) {
    this.activeEntryId = entry.id;
    this.selectedEmails.clear();
    this.shareOpen = true;
    this.shareLoading = true;
    this.therapistsSvc.list().subscribe({
      next: (list) => {
        this.therapists = list;
        this.shareLoading = false;
      },
      error: () => {
        this.shareLoading = false;
        alert('No se pudo cargar la lista de terapeutas.');
      },
    });
  }

  toggleEmail(email: string, checked: boolean) {
    if (checked) this.selectedEmails.add(email);
    else this.selectedEmails.delete(email);
  }

  confirmShare() {
    if (!this.activeEntryId) return;
    if (this.selectedEmails.size === 0) {
      alert('Selecciona al menos un terapeuta.');
      return;
    }
    this.shareLoading = true;
    this.journalService.share(this.activeEntryId, Array.from(this.selectedEmails)).subscribe({
      next: () => {
        this.shareLoading = false;
        this.shareOpen = false;
        // Indicador visual provisional:
        const idx = this.entries.findIndex(e => e.id === this.activeEntryId);
        if (idx >= 0) this.entries[idx].sharedWithProfessional = true;
        this.activeEntryId = null;
      },
      error: () => {
        this.shareLoading = false;
        alert('No se pudo compartir la entrada.');
      },
    });
  }

  cancelShare() {
    this.shareOpen = false;
    this.activeEntryId = null;
    this.selectedEmails.clear();
  }

  // opcional: revocar (si quieres poner un botón por ahora)
  revokeShare(entry: JournalEntry, email: string) {
    this.journalService.revoke(entry.id, email).subscribe({
      next: () => {
        // si llevas una lista de compartidos por entrada, acá la actualizas
      },
      error: () => alert('No se pudo revocar el acceso.'),
    });
  }
}



