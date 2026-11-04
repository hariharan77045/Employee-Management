import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const COLORS = ['#3f6fd8', '#0f8a7e', '#b4541a', '#8a3fb5', '#b8325a', '#2c7a3f'];

/** Shows a person's initials until the backend can provide real photos. */
@Component({
  selector: 'app-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `{{ initials() }}`,
  host: {
    '[style.background]': 'color()',
    '[style.width.px]': 'size()',
    '[style.height.px]': 'size()',
    '[style.font-size.px]': 'size() * 0.38',
    'aria-hidden': 'true',
  },
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      border-radius: 50%;
      color: #fff;
      font-weight: 600;
    }
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly size = input(36);

  protected readonly initials = computed(() =>
    this.name()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );

  protected readonly color = computed(() => {
    const hash = [...this.name()].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return COLORS[hash % COLORS.length];
  });
}
