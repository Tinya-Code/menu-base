import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Local {
  /**
   * Get a value from localStorage.
   * @param key string
   * @returns T | null
   */
  get<T>(key: string): T | null {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  /**
   * Set a value in localStorage.
   * @param key string
   * @param value any
   */
  set(key: string, value: any): void {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
  }

  /**
   * Remove a value from localStorage.
   * @param key string
   */
  remove(key: string): void {
    localStorage.removeItem(key);
  }

  /**
   * Clear all localStorage.
   */
  clear(): void {
    localStorage.clear();
  }
}
