package com.MediFlow.backend.service;

import com.MediFlow.backend.dto.AuthResponse;
import com.MediFlow.backend.dto.LoginRequest;
import com.MediFlow.backend.entity.User;
import com.MediFlow.backend.repository.UserRepository;
import com.MediFlow.backend.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail();
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        User user = userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByUsername(identifier))
            .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (request.getRole() != user.getRole()) {
            throw new BadCredentialsException("Selected role does not match this account");
        }

        if (!user.isActive()) {
            throw new org.springframework.security.authentication.DisabledException("Account is deactivated");
        }

        String token = jwtUtil.generateToken(user.getUsername(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .username(user.getUsername())
                .role(user.getRole().name())
                .build();
    }
}
