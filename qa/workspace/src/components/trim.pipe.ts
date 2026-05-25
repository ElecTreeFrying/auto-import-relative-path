import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'trim' })
export class TrimPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return (value ?? '').trim();
  }
}
