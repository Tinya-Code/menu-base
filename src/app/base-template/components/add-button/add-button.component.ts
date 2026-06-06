import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-add-button',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './add-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddButtonComponent {
  // Button text
  text = input<string>('');

  // Additional CSS classes for customization
  customClass = input<string>('');
  disabled = input<boolean>(false);
  readonly Plus = Plus;

  // Click event
  clicked = output<Event>();

  handleClick(event: Event) {
    event.stopPropagation();
    if (this.disabled()) return;
    this.clicked.emit(event);
  }
}
