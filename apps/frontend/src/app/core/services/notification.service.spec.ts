import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    service = new NotificationService();
  });

  it('adds notifications with correct type', () => {
    service.showSuccess('OK', 'Tudo certo', 0);

    const [notification] = service.getNotifications();
    expect(notification).toEqual(
      expect.objectContaining({
        type: 'success',
        title: 'OK',
        message: 'Tudo certo',
      })
    );
  });

  it('removes a notification by id', () => {
    service.showError('Erro', 'Falhou', 0);
    const [notification] = service.getNotifications();

    service.removeNotification(notification.id);

    expect(service.getNotifications()).toEqual([]);
  });

  it('clears all notifications', () => {
    service.showInfo('Info', 'Mensagem', 0);
    service.showWarning('Warn', 'Atencao', 0);

    service.clearAll();

    expect(service.getNotifications()).toEqual([]);
  });

  it('auto-removes notification after duration', () => {
    jest.useFakeTimers();
    service.showSuccess('Auto', 'Remove', 1000);

    expect(service.getNotifications().length).toBe(1);

    jest.advanceTimersByTime(1000);

    expect(service.getNotifications().length).toBe(0);
    jest.useRealTimers();
  });
});
