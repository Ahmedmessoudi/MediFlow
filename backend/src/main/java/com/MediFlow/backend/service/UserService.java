package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.RegisterRequest;
import com.MediFlow.backend.dto.UserUpdateRequest;
import com.MediFlow.backend.entity.User;
import com.MediFlow.backend.enums.UserRole;
import com.MediFlow.backend.exception.ResourceNotFoundException;
import com.MediFlow.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

    public User findById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    public User create(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username is already taken!");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered!");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.valueOf(request.getRole().toUpperCase()))
                .active(true)
                .build();

        return userRepository.save(user);
    }

    public User update(Long id, UserUpdateRequest request) {
        User user = findById(id);

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already in use by another account!");
        }

        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return userRepository.save(user);
    }

    public User toggleActive(Long id) {
        User user = findById(id);
        if (user.getRole() == UserRole.ADMIN && userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.ADMIN && u.getId() != id).count() == 0) {
            throw new IllegalArgumentException("Cannot deactivate the last admin account.");
        }
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    public void delete(Long id) {
        User user = findById(id);
        if (user.getRole() == UserRole.ADMIN && userRepository.findAll().stream().filter(u -> u.getRole() == UserRole.ADMIN && u.getId() != id).count() == 0) {
            throw new IllegalArgumentException("Cannot delete the last admin account.");
        }
        userRepository.delete(user);
    }
}
