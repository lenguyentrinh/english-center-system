package com.trinh.english_center_be.modules.auth.security;

import java.util.Collection;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

/**
 * Principal that also carries the user's document id, so method-security expressions such as
 * {@code #id == authentication.principal.id} and controllers can identify the caller without
 * trusting any client-supplied id.
 */
@Getter
public class AuthUserDetails extends User {

    private final String id;

    public AuthUserDetails(
            String id,
            String username,
            String password,
            boolean enabled,
            boolean accountNonLocked,
            Collection<? extends GrantedAuthority> authorities
    ) {
        super(username, password, enabled, true, true, accountNonLocked, authorities);
        this.id = id;
    }
}
