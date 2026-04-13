package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.Notification;
import com.MediFlow.backend.enums.NotificationType;
import com.MediFlow.backend.repository.NotificationRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationService(NotificationRepository notificationRepository,
                               SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public List<Notification> getNotificationsForRole(String role) {
        return notificationRepository.findByTargetRole(role);
    }

    public List<Notification> getUnreadForRole(String role) {
        return notificationRepository.findUnreadByRole(role);
    }

    public long countUnreadForRole(String role) {
        return notificationRepository.countUnreadByRole(role);
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    public void markAllAsRead(String role) {
        List<Notification> unread = notificationRepository.findUnreadByRole(role);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    /**
     * Create and broadcast a notification via WebSocket.
     */
    public Notification sendNotification(String message, NotificationType type, String targetRoles) {
        Notification notification = Notification.builder()
                .message(message)
                .type(type)
                .targetRoles(targetRoles)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notification = notificationRepository.save(notification);

        // Broadcast to all connected WebSocket clients
        messagingTemplate.convertAndSend("/topic/notifications", notification);

        return notification;
    }
}
