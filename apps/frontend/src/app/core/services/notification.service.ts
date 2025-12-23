import { Injectable } from '@angular/core';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: Notification[] = [];
  private notificationId = 0;

  getNotifications(): Notification[] {
    return this.notifications;
  }

  showSuccess(title: string, message?: string, duration = 5000): void {
    this.addNotification('success', title, message, duration);
  }

  showError(title: string, message?: string, duration = 8000): void {
    this.addNotification('error', title, message, duration);
  }

  showWarning(title: string, message?: string, duration = 6000): void {
    this.addNotification('warning', title, message, duration);
  }

  showInfo(title: string, message?: string, duration = 5000): void {
    this.addNotification('info', title, message, duration);
  }

  removeNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clearAll(): void {
    this.notifications = [];
  }

  private addNotification(type: NotificationType, title: string, message?: string, duration?: number): void {
    const id = `notification-${++this.notificationId}`;
    const notification: Notification = {
      id,
      type,
      title,
      message,
      duration
    };

    this.notifications.push(notification);

    if (duration && duration > 0) {
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }
  }
}
