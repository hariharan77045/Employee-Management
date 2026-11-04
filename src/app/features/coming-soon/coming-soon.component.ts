import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Temporary page for sections that haven't been built yet. */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="card empty">
      <h1>{{ label }}</h1>
      <p>This page hasn't been built yet.</p>
      <a class="link" routerLink="/home">Back to home</a>
    </section>
  `,
  styles: `
    .empty { padding: 48px 20px; text-align: center; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    p { margin: 0 0 16px; color: var(--muted); }
  `,
})
export class ComingSoonComponent {
  protected readonly label: string = inject(ActivatedRoute).snapshot.data['label'];
}
