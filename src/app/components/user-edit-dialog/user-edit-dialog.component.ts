import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { IUser } from '../../interfaces';
import { UserService } from '../../services/user.service';

type DialogData = { user: IUser };

@Component({
  selector: 'app-user-edit-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="bg-[#1f1b17] text-white rounded-2xl p-6 w-full max-w-xl">
      <h4 class="text-lg font-semibold mb-4">Editar usuario</h4>

      <form (ngSubmit)="onSave()" autocomplete="off" class="space-y-4">
        <div>
          <label class="text-[#baa99c] block mb-1">Nombre</label>
          <input
            type="text"
            class="w-full px-3 py-2 rounded-lg bg-[#2a2520] text-white border border-[#3b342b] focus:outline-none"
            [(ngModel)]="model.name"
            name="name"
            required
          />
        </div>

        <div>
          <label class="text-[#baa99c] block mb-1">Apellido</label>
          <input
            type="text"
            class="w-full px-3 py-2 rounded-lg bg-[#2a2520] text-white border border-[#3b342b] focus:outline-none"
            [(ngModel)]="model.lastname"
            name="lastname"
            required
          />
        </div>

        <div>
          <label class="text-[#baa99c] block mb-1">Correo</label>
          <input
            type="email"
            class="w-full px-3 py-2 rounded-lg bg-[#2a2520] text-white border border-[#3b342b] focus:outline-none"
            [(ngModel)]="model.email"
            name="email"
            required
            pattern="^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            (click)="onCancel()"
            class="px-4 py-2 rounded-md border border-[#3b342b] text-[#baa99c] hover:bg-[#2a2520]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="px-4 py-2 rounded-md bg-[#f2730c] text-white hover:bg-[#d96108]"
            [disabled]="saving"
          >
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UserEditDialogComponent {
  private userService = inject(UserService);
  saving = false;

  model: IUser = {
    id: this.data.user.id,
    name: this.data.user.name,
    lastname: this.data.user.lastname,
    email: this.data.user.email,
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dialogRef: MatDialogRef<UserEditDialogComponent>,
  ) {}

  onCancel(): void {
    this.dialogRef.close('cancel');
  }

  onSave(): void {
    if (!this.model?.id) return;
    this.saving = true;

    this.userService.update(this.model);
    setTimeout(() => {
      this.saving = false;
      this.dialogRef.close('updated');
    }, 350);
  }
}
