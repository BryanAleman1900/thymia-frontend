import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICategory } from '../../../interfaces';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})
export class CategoryListComponent {
  @Input() categoryList: ICategory[] = [];
  @Output() callDeleteMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
  @Output() callUpdateModalMethod: EventEmitter<ICategory> = new EventEmitter<ICategory>();
}