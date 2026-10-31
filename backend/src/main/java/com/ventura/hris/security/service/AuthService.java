package com.ventura.hris.security.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.security.dto.LoginRequest;
import com.ventura.hris.security.dto.RefreshTokenRequest;
import com.ventura.hris.security.dto.TokenResponse;
import com.ventura.hris.security.dto.UserProfileResponse;
import com.ventura.hris.security.dto.UserSummaryResponse;
import com.ventura.hris.security.entity.RefreshToken;
import com.ventura.hris.security.entity.Role;
import com.ventura.hris.security.entity.User;
import com.ventura.hris.security.jwt.JwtTokenProvider;
import com.ventura.hris.security.repository.RefreshTokenRepository;
import com.ventura.hris.security.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthService(
            AuthenticationManager authenticationManager,
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public TokenResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
            );

            CustomUserPrincipal principal = (CustomUserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            List<String> roleCodes = user.getRoles().stream()
                    .map(Role::getCode)
                    .toList();

            String accessToken = jwtTokenProvider.generateAccessToken(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    roleCodes
            );

            String rawRefreshToken = jwtTokenProvider.generateRefreshToken();
            Instant refreshExpiresAt = Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs());

            RefreshToken refreshTokenEntity = new RefreshToken(user, rawRefreshToken, refreshExpiresAt);
            refreshTokenRepository.save(refreshTokenEntity);

            UserSummaryResponse summary = new UserSummaryResponse(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getFullName(),
                    roleCodes
            );

            return TokenResponse.of(accessToken, rawRefreshToken, jwtTokenProvider.getExpirationMs() / 1000, summary);
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("Invalid username, email, or password");
        }
    }

    @Transactional
    public TokenResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken tokenEntity = refreshTokenRepository.findByTokenHash(request.refreshToken())
                .orElseThrow(() -> new DomainException("INVALID_REFRESH_TOKEN", "Invalid refresh token", HttpStatus.UNAUTHORIZED));

        if (tokenEntity.isRevoked() || tokenEntity.isExpired()) {
            throw new DomainException("EXPIRED_REFRESH_TOKEN", "Refresh token has expired or been revoked", HttpStatus.UNAUTHORIZED);
        }

        User user = tokenEntity.getUser();
        if (!user.isEnabled()) {
            throw new DomainException("USER_INACTIVE", "User account is disabled or locked", HttpStatus.FORBIDDEN);
        }

        List<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .toList();

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                roleCodes
        );

        UserSummaryResponse summary = new UserSummaryResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                roleCodes
        );

        return TokenResponse.of(newAccessToken, tokenEntity.getTokenHash(), jwtTokenProvider.getExpirationMs() / 1000, summary);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof CustomUserPrincipal principal)) {
            throw new DomainException("UNAUTHORIZED", "No authenticated user in current session", HttpStatus.UNAUTHORIZED);
        }

        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .toList();

        return new UserProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getStatus(),
                roleCodes
        );
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenRepository.findByTokenHash(refreshToken).ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        }
    }
}
