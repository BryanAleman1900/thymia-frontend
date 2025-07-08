import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../interfaces';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  standalone: true,
  styleUrls: ['./category-form.component.scss'],
  imports: [
    ReactiveFormsModule,
    CommonModule
  ]
})
export class CategoryFormComponent {
  public fb: FormBuilder = inject(FormBuilder);

  @Input() form!: FormGroup;
  @Output() callSaveMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
  @Output() callUpdateMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();

  callSave() {
    const category: ICategory = {
      name: this.form.controls['name'].value,
      description: this.form.controls['description'].value,
    };

    if (this.form.controls['id'].value) {
      category.id = this.form.controls['id'].value;
      this.callUpdateMethod.emit(category);
    } else {
      this.callSaveMethod.emit(category);
    }
  }
}
