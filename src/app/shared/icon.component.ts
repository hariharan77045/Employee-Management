import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICON_PATHS: Record<string, string> = {
  home: 'M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  grid: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
  file: 'M14 3H6v18h12V7zM14 3v4h4M9 13h6M9 17h6',
  folder: 'M3 6h6l2 2h10v11H3z',
  news: 'M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2zM17 9h3v10a2 2 0 0 1-2 2M8 9h5M8 13h5M8 17h5',
  tasks: 'M9 12l2 2 4-4M5 4h14v16H5z',
  book: 'M4 20V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2 2 2 0 0 0 2 2h14v-4',
  help: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  bell: 'M6 9a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 21a2 2 0 0 0 4 0',
  mail: 'M3 5h18v14H3zM3 7l9 6 9-6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  'chevron-right': 'M9 6l6 6-6 6',
  'chevron-left': 'M15 6l-6 6 6 6',
  'chevron-down': 'M6 9l6 6 6-6',
  calendar: 'M4 6h16v15H4zM4 10h16M8 3v4M16 3v4',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  wallet: 'M3 7h18v13H3zM3 7l3-4h12l3 4M16 14h.01',
  graduation: 'M2 9l10-5 10 5-10 5zM6 11.5V17c3 2.5 9 2.5 12 0v-5.5',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  code: 'M8 7l-5 5 5 5M16 7l5 5-5 5',
  flask: 'M9 3h6M10 3v6L4 20h16L14 9V3',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host { display: inline-flex; width: var(--icon-size, 18px); height: var(--icon-size, 18px); flex: none; }
    svg { width: 100%; height: 100%; }
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  protected readonly path = computed(() => ICON_PATHS[this.name()] ?? '');
}
