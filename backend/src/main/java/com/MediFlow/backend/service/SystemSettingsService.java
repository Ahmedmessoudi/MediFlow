package com.MediFlow.backend.service;

import com.MediFlow.backend.entity.SystemSettings;
import com.MediFlow.backend.repository.SystemSettingsRepository;
import org.springframework.stereotype.Service;

@Service
public class SystemSettingsService {

    private final SystemSettingsRepository settingsRepository;

    public SystemSettingsService(SystemSettingsRepository settingsRepository) {
        this.settingsRepository = settingsRepository;
    }

    public SystemSettings getSettings() {
        return settingsRepository.findAll().stream().findFirst()
                .orElseGet(() -> settingsRepository.save(SystemSettings.builder().build()));
    }

    public SystemSettings updateSettings(SystemSettings updated) {
        SystemSettings settings = getSettings();
        settings.setMaxUsers(updated.getMaxUsers());
        settings.setMaxBeds(updated.getMaxBeds());
        settings.setAllowOverbooking(updated.getAllowOverbooking());
        settings.setAlertThreshold(updated.getAlertThreshold());
        return settingsRepository.save(settings);
    }
}
