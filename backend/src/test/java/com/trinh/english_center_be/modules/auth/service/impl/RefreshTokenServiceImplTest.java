package com.trinh.english_center_be.modules.auth.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.auth.entity.RefreshToken;
import com.trinh.english_center_be.modules.auth.repository.RefreshTokenRepository;
import com.trinh.english_center_be.modules.auth.service.RefreshTokenService;
import com.trinh.english_center_be.modules.user.service.UserService;
import com.trinh.english_center_be.shared.exception.UnauthorizedException;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceImplTest {

    @Mock RefreshTokenRepository repository;
    @Mock MongoTemplate mongoTemplate;
    @Mock UserService userService;

    RefreshTokenServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenServiceImpl(repository, mongoTemplate, userService);
        ReflectionTestUtils.setField(service, "refreshExpirationMs", 60_000L);
    }

    /** Issues a token through the service, capturing the stored row so later calls can find it again. */
    private String issueAndCapture(String userId, RefreshToken[] stored) {
        when(repository.save(any(RefreshToken.class))).thenAnswer(inv -> {
            stored[0] = inv.getArgument(0);
            return stored[0];
        });
        return service.issue(userId);
    }

    @Test
    void issueStoresOnlyAHashOfTheSecret() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);

        String secret = raw.substring(raw.indexOf('.') + 1);
        assertThat(raw).startsWith(stored[0].getId() + ".");
        assertThat(stored[0].getTokenHash()).isNotEqualTo(secret).hasSize(64);
    }

    @Test
    void rotateRevokesOldTokenAndIssuesNewOne() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));
        when(userService.isUserActive("u1")).thenReturn(true);
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(stored[0]);

        RefreshTokenService.Rotated rotated = service.rotate(raw);

        assertThat(rotated.userId()).isEqualTo("u1");
        assertThat(rotated.newRawToken()).isNotEqualTo(raw);
        ArgumentCaptor<RefreshToken> saved = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository, org.mockito.Mockito.times(2)).save(saved.capture());
        assertThat(saved.getAllValues().get(1).isRevoked()).isFalse();
    }

    @Test
    void rotateRejectsWrongSecret() {
        RefreshToken[] stored = new RefreshToken[1];
        issueAndCapture("u1", stored);
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));

        assertThatThrownBy(() -> service.rotate(stored[0].getId() + ".not-the-secret"))
                .isInstanceOf(UnauthorizedException.class);
        verify(mongoTemplate, never()).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void rotateRejectsMalformedInput() {
        assertThatThrownBy(() -> service.rotate(null)).isInstanceOf(UnauthorizedException.class);
        assertThatThrownBy(() -> service.rotate("nodot")).isInstanceOf(UnauthorizedException.class);
        assertThatThrownBy(() -> service.rotate("zzz.secret")).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void reuseOutsideGraceWindowRevokesEverySessionOfTheUser() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        stored[0].setRevoked(true);
        stored[0].setRevokedAt(Instant.now().minus(Duration.ofMinutes(5)));
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));

        assertThatThrownBy(() -> service.rotate(raw)).isInstanceOf(UnauthorizedException.class);

        verify(mongoTemplate).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void reuseInsideGraceWindowIsTreatedAsARaceNotAnAttack() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        stored[0].setRevoked(true);
        stored[0].setRevokedAt(Instant.now().minusSeconds(2));
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));

        assertThatThrownBy(() -> service.rotate(raw)).isInstanceOf(UnauthorizedException.class);

        verify(mongoTemplate, never()).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void losingTheConcurrentClaimDoesNotIssueASecondToken() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));
        when(userService.isUserActive("u1")).thenReturn(true);
        when(mongoTemplate.findAndModify(any(Query.class), any(Update.class), any(FindAndModifyOptions.class),
                eq(RefreshToken.class))).thenReturn(null);

        assertThatThrownBy(() -> service.rotate(raw)).isInstanceOf(UnauthorizedException.class);

        verify(repository, org.mockito.Mockito.times(1)).save(any(RefreshToken.class)); // only the original issue
    }

    @Test
    void expiredTokenIsRejected() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        stored[0].setExpiresAt(Instant.now().minusSeconds(1));
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));

        assertThatThrownBy(() -> service.rotate(raw)).isInstanceOf(UnauthorizedException.class);
    }

    @Test
    void lockedUserCannotRefreshAndLosesAllSessions() {
        RefreshToken[] stored = new RefreshToken[1];
        String raw = issueAndCapture("u1", stored);
        when(repository.findById(stored[0].getId())).thenReturn(Optional.of(stored[0]));
        when(userService.isUserActive("u1")).thenReturn(false);

        assertThatThrownBy(() -> service.rotate(raw)).isInstanceOf(UnauthorizedException.class);

        verify(mongoTemplate).updateMulti(any(Query.class), any(Update.class), eq(RefreshToken.class));
    }

    @Test
    void revokeNeverThrowsForGarbage() {
        service.revoke("garbage");
        service.revoke(null);
    }
}
