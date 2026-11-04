import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { Contact } from '../../../../core/models/dashboard.models';
import { AvatarComponent } from '../../../../shared/avatar.component';
import { IconComponent } from '../../../../shared/icon.component';

@Component({
  selector: 'app-contacts-widget',
  standalone: true,
  imports: [AvatarComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contacts-widget.component.html',
  styleUrl: './contacts-widget.component.scss',
})
export class ContactsWidgetComponent {
  readonly contacts = input.required<Contact[]>();

  protected readonly query = signal('');
  protected readonly filtered = computed(() => {
    const query = this.query().trim().toLowerCase();
    return this.contacts().filter(
      (contact) => contact.name.toLowerCase().includes(query) || contact.email.toLowerCase().includes(query),
    );
  });
}
