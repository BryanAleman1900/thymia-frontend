import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'initials', standalone: true })
export class InitialsPipe implements PipeTransform {
  transform(name: string | null | undefined): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0]?.toUpperCase() ?? '').join('');
  }
}