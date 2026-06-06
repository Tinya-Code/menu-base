import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-category-nav',
  standalone: true,
  template: `
    <div
      class="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-primary/10 shadow-sm py-4 px-4"
    >
      <div
        class="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        @for (catData of categories(); track catData.category.id) {
          <a
            (click)="scrollToCategory('category-' + catData.category.id)"
            class="whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold uppercase tracking-wider transition-all bg-secondary/5 text-secondary hover:bg-primary/20 hover:text-primary active:scale-95 cursor-pointer"
          >
            {{ catData.category.name }}
          </a>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryNav {
  categories = input.required<any[]>();

  scrollToCategory(categoryId: string) {
    const element = document.getElementById(categoryId);
    if (element) {
      const offset = 140;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth',
      });
    }
  }
}
