import { notificationRepository } from '../repositories/notificationRepository';

export class NotificationService {
  async getUserNotifications(userId: string) {
    return notificationRepository.findByUserId(userId);
  }

  async markAsRead(id: string, userId: string) {
    return notificationRepository.markAsRead(id, userId);
  }
}

export const notificationService = new NotificationService();
