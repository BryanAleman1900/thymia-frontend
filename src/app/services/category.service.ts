import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { ICategory, IResponse, ISearch } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService extends BaseService<ICategory> {
  protected override source: string = 'categories';
  private categoryListSignal = signal<ICategory[]>([]);
  get categories$() {
    return this.categoryListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: IResponse<ICategory[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.categoryListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al listar categorías', err);
      }
    });
  }

  save(item: ICategory) {
    this.add(item).subscribe({
      next: (response: IResponse<ICategory>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al agregar categoría', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar categoría', err);
      }
    });
  }

  update(item: ICategory) {
    this.edit(item.id, item).subscribe({
      next: (response: IResponse<ICategory>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al actualizar categoría', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar categoría', err);
      }
    });
  }

  delete(item: ICategory) {
    this.del(item.id).subscribe({
      next: (response: IResponse<ICategory>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al eliminar categoría', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar categoría', err);
      }
    });
  }
}
