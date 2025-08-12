import { Pipe, PipeTransform } from '@angular/core';
import { IUser } from '../../../interfaces';

@Pipe({ name: 'userFilter', standalone: true })
export class UserFilterPipe implements PipeTransform {
  transform(items: IUser[], q: string): IUser[] {
    if (!q) return items;
    const s = q.toLowerCase();
    return (items || []).filter(u => {
      const full = (u.fullName || `${u.name ?? ''} ${u.lastname ?? ''} ${u.email ?? ''}`).toLowerCase();
      return full.includes(s);
    });
  }
}