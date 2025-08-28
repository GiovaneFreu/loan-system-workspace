import { Component, inject } from '@angular/core';
import { Notification, NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  private notificationService = inject(NotificationService);

  get notifications(): Notification[] {
    return this.notificationService.getNotifications();
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  getIconForType(type: string): string {
    switch (type) {
      case 'success':
        return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'error':
        return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning':
        return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'info':
        return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default:
        return '';
    }
  }

  getColorClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  }

  getIconColorClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-400';
      case 'error':
        return 'text-red-400';
      case 'warning':
        return 'text-yellow-400';
      case 'info':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  }

  getCloseButtonColorClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-green-500 hover:text-green-600 focus:ring-green-500';
      case 'error':
        return 'text-red-500 hover:text-red-600 focus:ring-red-500';
      case 'warning':
        return 'text-yellow-500 hover:text-yellow-600 focus:ring-yellow-500';
      case 'info':
        return 'text-blue-500 hover:text-blue-600 focus:ring-blue-500';
      default:
        return 'text-gray-500 hover:text-gray-600 focus:ring-gray-500';
    }
  }
}
