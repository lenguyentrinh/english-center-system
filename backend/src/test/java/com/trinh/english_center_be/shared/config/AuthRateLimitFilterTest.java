package com.trinh.english_center_be.shared.config;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

class AuthRateLimitFilterTest {

    AuthRateLimitFilter filter;

    @BeforeEach
    void setUp() {
        filter = new AuthRateLimitFilter();
        ReflectionTestUtils.setField(filter, "maxRequests", 3);
        ReflectionTestUtils.setField(filter, "windowSeconds", 60L);
    }

    private int post(String path, String ip) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api" + path);
        request.setServletPath(path);
        request.setRemoteAddr(ip);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain chain = (req, res) -> ((MockHttpServletResponse) res).setStatus(200);
        filter.doFilter(request, response, chain);
        return response.getStatus();
    }

    @Test
    void blocksAfterTheLimitWithinTheWindow() throws Exception {
        assertThat(post("/auth/login", "1.1.1.1")).isEqualTo(200);
        assertThat(post("/auth/login", "1.1.1.1")).isEqualTo(200);
        assertThat(post("/auth/login", "1.1.1.1")).isEqualTo(200);
        assertThat(post("/auth/login", "1.1.1.1")).isEqualTo(429);
    }

    @Test
    void limitsAreTrackedPerIpAndPerEndpoint() throws Exception {
        for (int i = 0; i < 3; i++) post("/auth/login", "1.1.1.1");

        assertThat(post("/auth/login", "2.2.2.2")).isEqualTo(200);
        assertThat(post("/auth/forgot-password", "1.1.1.1")).isEqualTo(200);
    }

    @Test
    void endpointsOutsideTheCredentialSetAreNotLimited() throws Exception {
        for (int i = 0; i < 10; i++) {
            assertThat(post("/auth/refresh", "1.1.1.1")).isEqualTo(200);
        }
    }
}
