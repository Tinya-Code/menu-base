import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LucideAngularModule, X } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ModalComponent {
  isOpen = input.required<boolean>();
  title = input<string>('');
  close = output<void>();

  readonly X = X;

  onClose(): void {
    this.close.emit();
  }
}
