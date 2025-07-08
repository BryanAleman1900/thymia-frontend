import { inject, Injectable, signal } from '@angular/core';
import { BaseService } from './base-service';
import { IProduct, IResponse, ISearch } from '../interfaces';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService extends BaseService<IProduct> {
  protected override source: string = 'products';
  private productListSignal = signal<IProduct[]>([]);
  
  get products$() {
    return this.productListSignal;
  }

  public search: ISearch = {
    page: 1,
    size: 5
  }

  public totalItems: any = [];
  private alertService: AlertService = inject(AlertService);

  getAll() {
    this.findAllWithParams({ page: this.search.page, size: this.search.size }).subscribe({
      next: (response: IResponse<IProduct[]>) => {
        this.search = { ...this.search, ...response.meta };
        this.totalItems = Array.from({ length: this.search.totalPages || 0 }, (_, i) => i + 1);
        this.productListSignal.set(response.data);
      },
      error: (err: any) => {
        console.error('Error al listar productos', err);
      }
    });
  }

  save(item: IProduct) {
    this.add(item).subscribe({
      next: (response: IResponse<IProduct>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al agregar producto', 'center', 'top', ['error-snackbar']);
        console.error('Error al guardar producto', err);
      }
    });
  }

  update(item: IProduct) {
    this.edit(item.id, item).subscribe({
      next: (response: IResponse<IProduct>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al actualizar producto', 'center', 'top', ['error-snackbar']);
        console.error('Error al actualizar producto', err);
      }
    });
  }

  delete(item: IProduct) {
    this.del(item.id).subscribe({
      next: (response: IResponse<IProduct>) => {
        this.alertService.displayAlert('success', response.message, 'center', 'top', ['success-snackbar']);
        this.getAll();
      },
      error: (err: any) => {
        this.alertService.displayAlert('error', 'Error al eliminar producto', 'center', 'top', ['error-snackbar']);
        console.error('Error al eliminar producto', err);
      }
    });
  }
}
