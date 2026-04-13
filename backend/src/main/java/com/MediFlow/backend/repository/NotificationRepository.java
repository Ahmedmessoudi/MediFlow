package com.MediFlow.backend.repository;

import com.MediFlow.backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    @Query("SELECT n FROM Notification n WHERE n.targetRoles = 'ALL' OR n.targetRoles LIKE %:role% ORDER BY n.createdAt DESC")
    List<Notification> findByTargetRole(@Param("role") String role);

    @Query("SELECT n FROM Notification n WHERE (n.targetRoles = 'ALL' OR n.targetRoles LIKE %:role%) AND n.read = false ORDER BY n.createdAt DESC")
    List<Notification> findUnreadByRole(@Param("role") String role);

    @Query("SELECT COUNT(n) FROM Notification n WHERE (n.targetRoles = 'ALL' OR n.targetRoles LIKE %:role%) AND n.read = false")
    long countUnreadByRole(@Param("role") String role);
}
