import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { Announcement, CompanyEvent } from '../../core/models/dashboard.models';
import { NewsService } from '../../core/services/news.service';
import { AuthService } from '../../core/auth/auth.service';
import { apiErrorMessage } from '../../core/utils/api-error';
import { toDateKey } from '../../core/utils/date.utils';
import { AvatarComponent } from '../../shared/avatar.component';
import { IconComponent } from '../../shared/icon.component';

@Component({
  selector: 'app-news-events',
  standalone: true,
  imports: [DatePipe, NgTemplateOutlet, ReactiveFormsModule, AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-events.component.html',
  styleUrl: './news-events.component.scss',
})
export class NewsEventsComponent {
  private readonly news = inject(NewsService);
  private readonly auth = inject(AuthService);
  /** HR and admins post news and events; the API enforces the same rule. */
  protected readonly canManage = computed(() => !!this.auth.user() && this.auth.hasRole('ADMIN', 'HR'));
  private readonly fb = inject(FormBuilder).nonNullable;

  protected readonly today = toDateKey(new Date());

  protected readonly announcements = signal<Announcement[] | null>(null);
  protected readonly events = signal<CompanyEvent[] | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly showPostForm = signal(false);
  protected readonly showEventForm = signal(false);
  protected readonly saving = signal(false);

  protected readonly upcoming = computed(() => (this.events() ?? []).filter((e) => e.date >= this.today));
  protected readonly past = computed(() =>
    (this.events() ?? []).filter((e) => e.date < this.today).reverse(),
  );

  protected readonly postForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    summary: ['', [Validators.required, Validators.maxLength(2000)]],
  });

  protected readonly eventForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(150)]],
    date: [this.today, Validators.required],
    location: ['', Validators.maxLength(100)],
    description: ['', Validators.maxLength(2000)],
  });

  constructor() {
    this.news.announcements().subscribe({
      next: (rows) => this.announcements.set(rows),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
    this.news.events().subscribe({
      next: (rows) => this.events.set(rows),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected post(): void {
    if (this.postForm.invalid) {
      this.postForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.news.postAnnouncement(this.postForm.getRawValue()).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.error.set(null);
        this.announcements.update((rows) => [created, ...(rows ?? [])]);
        this.postForm.reset();
        this.showPostForm.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected addEvent(): void {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.news.createEvent(this.eventForm.getRawValue()).subscribe({
      next: (created) => {
        this.saving.set(false);
        this.error.set(null);
        this.events.update((rows) => [...(rows ?? []), created].sort((a, b) => a.date.localeCompare(b.date)));
        this.eventForm.reset({ title: '', date: this.today, location: '', description: '' });
        this.showEventForm.set(false);
      },
      error: (err) => {
        this.saving.set(false);
        this.error.set(apiErrorMessage(err));
      },
    });
  }

  protected deleteAnnouncement(item: Announcement): void {
    if (!confirm(`Delete the announcement "${item.title}"?`)) {
      return;
    }
    this.news.deleteAnnouncement(item.id).subscribe({
      next: () => this.announcements.update((rows) => (rows ?? []).filter((a) => a.id !== item.id)),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }

  protected deleteEvent(item: CompanyEvent): void {
    if (!confirm(`Delete the event "${item.title}"?`)) {
      return;
    }
    this.news.deleteEvent(item.id).subscribe({
      next: () => this.events.update((rows) => (rows ?? []).filter((e) => e.id !== item.id)),
      error: (err) => this.error.set(apiErrorMessage(err)),
    });
  }
}
