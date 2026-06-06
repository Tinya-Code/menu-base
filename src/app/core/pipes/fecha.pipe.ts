import { Pipe, PipeTransform } from '@angular/core';

export type FechaFormat = 'short' | 'medium' | 'long' | 'full' | 'dateTime';

@Pipe({
  name: 'fecha',
  standalone: true,
  pure: true
})
export class FechaPipe implements PipeTransform {
  /**
   * Transforma una fecha en un formato legible.
   * @param value La fecha a formatear (Date, string o número).
   * @param format El formato deseado: 'short', 'medium' (por defecto), 'long', 'full' o 'dateTime'.
   * @returns La fecha formateada o una cadena vacía si el valor no es válido.
   */
  transform(value: Date | string | number | null | undefined, format: FechaFormat = 'medium'): string {
    if (value === null || value === undefined || value === '') {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return '';
    }

    const options: Intl.DateTimeFormatOptions = this.getOptions(format);
    return new Intl.DateTimeFormat('es-PE', options).format(date);
  }

  /**
   * Obtiene las opciones de formato para Intl.DateTimeFormat.
   * @param format El nombre del formato.
   */
  private getOptions(format: FechaFormat): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return { year: '2-digit', month: '2-digit', day: '2-digit' };
      case 'long':
        return { year: 'numeric', month: 'long', day: 'numeric' };
      case 'full':
        return { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      case 'dateTime':
        return { 
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', hour12: true 
        };
      case 'medium':
      default:
        return { year: 'numeric', month: 'short', day: 'numeric' };
    }
  }
}
