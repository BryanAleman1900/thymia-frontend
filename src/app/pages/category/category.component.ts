import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ICategory } from '../../interfaces';
import { CategoryService } from '../../services/category.service';
import { ModalService } from '../../services/modal.service';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CategoryFormComponent } from '../../components/category/category-form/category-form.component';
import { CategoryListComponent } from '../../components/category/category-list/category-list.component';
import { PaginationComponent } from '../../components/pagination/pagination.component';
import { ModalComponent } from '../../components/modal/modal.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
  standalone: true,
  imports: [
    CategoryFormComponent,
    CategoryListComponent,
    PaginationComponent,
    ModalComponent
  ]
})
export class CategoryComponent {
  public categoryService: CategoryService = inject(CategoryService);
  public fb: FormBuilder = inject(FormBuilder);
  public modalService: ModalService = inject(ModalService);
  public route: ActivatedRoute = inject(ActivatedRoute);
  public authService: AuthService = inject(AuthService);
  public areActionsAvailable: boolean = false;

  @ViewChild('editCategoryModal') public editCategoryModal: any;

  public categoryForm = this.fb.group({
    id: [''],
    name: ['', Validators.required],
    description: ['']
  });

  ngOnInit(): void {
    this.authService.getUserAuthorities();
    this.route.data.subscribe(data => {
      this.areActionsAvailable = this.authService.areActionsAvailable(data['authorities'] || []);
    });
    this.categoryService.getAll();
  }

  saveCategory(item: ICategory) {
    this.categoryService.save(item);
  }

  updateCategory(item: ICategory) {
    this.categoryService.update(item);
    this.modalService.closeAll();
    this.categoryForm.reset();
  }

  deleteCategory(item: ICategory) {
    this.categoryService.delete(item);
  }

  openEditCategoryModal(category: ICategory) {
    this.categoryForm.patchValue({
      id: category.id?.toString() || '',
      name: category.name,
      description: category.description
    });
    this.modalService.displayModal('lg', this.editCategoryModal);
  }
}