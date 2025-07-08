import { Component, ViewChild, inject } from '@angular/core';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { IProduct, ICategory } from '../../interfaces';
import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../services/category.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';

import { ProductFormComponent } from '../../components/product/product-form/product-form.component';
import { ProductListComponent } from '../../components/product/product-list/product-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  standalone: true,
  imports: [
    ProductFormComponent,
    ProductListComponent,
    PaginationComponent,
    ModalComponent
  ]
})
export class ProductComponent {
  public productService: ProductService = inject(ProductService);
  public categoryService: CategoryService = inject(CategoryService);
  public fb: FormBuilder = inject(FormBuilder);
  public modalService: ModalService = inject(ModalService);
  public route: ActivatedRoute = inject(ActivatedRoute);
  public authService: AuthService = inject(AuthService);

  public areActionsAvailable: boolean = false;
  public categoryList: ICategory[] = [];

  @ViewChild('editProductModal') public editProductModal: any;

  public productForm = this.fb.group<{
  id: FormControl<string | null>;
  name: FormControl<string | null>;
  description: FormControl<string | null>;
  price: FormControl<number | null>;
  stockQuantity: FormControl<number | null>; 
  categoryId: FormControl<number | null>;
}>({
  id: this.fb.control(null),
  name: this.fb.control('', Validators.required),
  description: this.fb.control(''),
  price: this.fb.control(0, Validators.required),
  stockQuantity: this.fb.control(0, Validators.required), 
  categoryId: this.fb.control(null, Validators.required)
});


  ngOnInit(): void {
    this.authService.getUserAuthorities();

    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] || []);
    });

    this.productService.getAll();
    this.categoryService.getAll();
    this.categoryList = this.categoryService.categories$();
  }

  saveProduct(product: IProduct) {
    this.productService.save(product);
  }

  updateProduct(product: IProduct) {
    this.productService.update(product);
    this.modalService.closeAll();
    this.productForm.reset();
  }

  deleteProduct(product: IProduct) {
    this.productService.delete(product);
  }

  openEditProductModal(product: IProduct) {
    this.productForm.patchValue({
      id: String(product.id),
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      categoryId: product.category?.id ?? null
    });

    this.modalService.displayModal('lg', this.editProductModal);
  }
}