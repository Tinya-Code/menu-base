import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
  standalone: true
})
export class TimeFormatPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';

    // Soporta formatos H:mm o HH:mm
    const [hoursStr, minutesStr] = value.split(':');
    let hours = parseInt(hoursStr, 10);
    const minutes = minutesStr || '00';

    if (isNaN(hours)) return value;

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // La hora 0 se convierte en 12

    return `${hours}:${minutes} ${period}`;
  }
}
