import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IUser } from '../../interfaces';
import { UserService } from '../../services/user.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserEditDialogComponent } from '../user-edit-dialog/user-edit-dialog.component';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-admin-user-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  template: `
    <div class="space-y-4">

      <!-- Filtros / acciones -->
      <div class="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
        <div class="flex-1 flex items-center gap-2">
          <input
            type="text"
            class="w-full md:max-w-sm px-3 py-2 rounded-lg bg-[#2a2520] text-white border border-[#3b342b] focus:outline-none"
            placeholder="Buscar por nombre, apellido o correo"
            [(ngModel)]="searchText"
            (input)="onSearchInput(searchText)"
          />
          <button
            class="px-3 py-2 rounded-md bg-[#393028] text-white hover:bg-[#4a3e34]"
            (click)="refresh()"
            [disabled]="isLoading"
            title="Refrescar"
          >
            {{ isLoading ? '...' : 'Refrescar' }}
          </button>
        </div>

        <div class="flex items-center gap-2">
          <label class="text-[#baa99c] text-sm">Ítems por página</label>
          <select
            class="px-2 py-1 rounded-md bg-[#2a2520] text-white border border-[#3b342b]"
            [(ngModel)]="size"
            (change)="onSizeChange(size)"
          >
            <option [ngValue]="5">5</option>
            <option [ngValue]="10">10</option>
            <option [ngValue]="20">20</option>
          </select>
        </div>
      </div>

      <!-- Tabla (sin scroll horizontal) -->
      <div>
        <table class="table-auto w-full text-sm">
          <thead class="text-[#baa99c] border-b border-[#393028]">
            <tr>
              <th class="text-left py-2 w-14">#</th>
              <th class="text-left py-2">Nombre</th>
              <th class="text-left py-2">Apellido</th>
              <th class="text-left py-2">Correo</th>
              <th class="text-left py-2 w-36">Rol</th>
              <th class="text-center py-2 w-64">Acciones</th>
            </tr>
          </thead>
          <tbody class="text-white">
            <tr *ngFor="let u of users; let i = index" class="border-b border-[#393028]">
              <td class="py-2">{{ indexOf(i) }}</td>
              <td class="py-2 whitespace-normal">{{ u.name }}</td>
              <td class="py-2 whitespace-normal">{{ u.lastname }}</td>
              <td class="py-2 whitespace-normal break-words">{{ u.email }}</td>
              <td class="py-2">
                <span class="px-2 py-1 rounded-full bg-[#3b342b] text-[#baa99c]">
                  {{ u.role?.name || '-' }}
                </span>
              </td>
              <td class="py-2">
                <div class="flex items-center justify-center gap-2">
                  <button
                    class="px-3 py-1 rounded-md bg-[#2f5d2f] text-white hover:bg-[#367a36]"
                    (click)="openEdit(u)"
                  >
                    Actualizar
                  </button>
                  <button
                    class="px-3 py-1 rounded-md bg-[#7a2d2d] text-white hover:bg-[#933636]"
                    (click)="onDelete(u)"
                  >
                    Eliminar
                  </button>
                  <button
                    class="px-3 py-1 rounded-md bg-[#393028] text-white hover:bg-[#4a3e34]"
                    (click)="onToggleRole(u)"
                    [disabled]="isToggling"
                  >
                    {{ u.role?.name === 'THERAPIST' ? 'Cambiar a Usuario' : 'Cambiar a Terapeuta' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr *ngIf="!users?.length">
              <td colspan="6" class="text-center text-[#baa99c] py-6">
                No hay usuarios para mostrar.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Paginación -->
      <div class="flex flex-col md:flex-row items-center justify-between gap-3 pt-2">
        <div class="text-[#baa99c] text-sm">
          Página {{ page }} de {{ totalPages }} —
          {{ totalElements }} usuarios
        </div>

        <div class="flex items-center gap-2">
          <button
            class="px-3 py-1 rounded-md border border-[#3b342b] text-[#baa99c] hover:bg-[#2a2520]"
            [disabled]="page <= 1"
            (click)="goTo(page - 1)"
          >
            Anterior
          </button>

          <ng-container *ngFor="let p of pagesToShow">
            <button
              class="px-3 py-1 rounded-md"
              [ngClass]="p === page ? 'bg-[#f2730c] text-white' : 'border border-[#3b342b] text-[#baa99c] hover:bg-[#2a2520]'"
              (click)="goTo(p)"
            >
              {{ p }}
            </button>
          </ng-container>

          <button
            class="px-3 py-1 rounded-md border border-[#3b342b] text-[#baa99c] hover:bg-[#2a2520]"
            [disabled]="page >= totalPages"
            (click)="goTo(page + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  `,
})
export class AdminUserPanelComponent implements OnInit {
  private userService = inject(UserService);
  private dialog = inject(MatDialog);

  users: IUser[] = [];
  isLoading = false;
  isToggling = false;

  // estado de paginación/búsqueda
  page = 1;
  size = 10;
  totalPages = 1;
  totalElements = 0;
  searchText = '';

  // debounce para búsqueda
  private search$ = new Subject<string>();

  ngOnInit(): void {
    // debounce de búsqueda
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
    ).subscribe((term) => {
      this.page = 1; // reinicia a la primera página
      this.fetch();
    });

    // carga inicial
    this.fetch();
  }

  // Helpers de UI
  get pagesToShow(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, start + 4);
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  indexOf(i: number): number {
    return (this.page - 1) * this.size + (i + 1);
  }

  // Acciones UI
  onSearchInput(value: string) {
    this.search$.next(value || '');
  }

  onSizeChange(newSize: number) {
    this.size = Number(newSize) || 10;
    this.page = 1;
    this.fetch();
  }

  goTo(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.fetch();
  }

  refresh(): void {
    this.fetch();
  }

  private fetch(): void {
    this.isLoading = true;
    this.userService.list({
      page: this.page,
      size: this.size,
      q: this.searchText,
      sortBy: 'createdAt',
      sortDir: 'desc',
    }).subscribe({
      next: () => {
        this.users = this.userService.users$();
        // sincroniza meta
        this.page = this.userService.search.page!;
        this.size = this.userService.search.size!;
        this.totalPages = this.userService.search.totalPages!;
        this.totalElements = this.userService.search.totalElements!;
        this.isLoading = false;
      },
      error: () => (this.isLoading = false),
    });
  }

  openEdit(u: IUser): void {
    const ref = this.dialog.open(UserEditDialogComponent, {
      data: { user: u },
      disableClose: true,
      panelClass: 'tw-dialog-panel',
    });

    ref.afterClosed().subscribe((result) => {
      if (result === 'updated') this.fetch();
    });
  }

  onDelete(u: IUser): void {
    if (!u?.id) return;
    if (!confirm(`¿Eliminar al usuario ${u.email}?`)) return;
    this.userService.delete(u);
    setTimeout(() => this.fetch(), 350);
  }

  onToggleRole(u: IUser): void {
    if (!u?.id) return;
    const isTherapist = u.role?.name === 'THERAPIST';
    const target = isTherapist ? 'USER' : 'THERAPIST';

    this.isToggling = true;
    this.userService.changeRole(u.id, target as any);
    setTimeout(() => {
      this.isToggling = false;
      this.fetch();
    }, 500);
  }
}
