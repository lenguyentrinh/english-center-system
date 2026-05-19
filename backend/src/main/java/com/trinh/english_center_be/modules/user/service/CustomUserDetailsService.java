package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(StringUtil.ENTITY_NOT_FOUND_BY, StringUtil.USER,StringUtil.USERNAME_FIELD, username)));

        Role systemRole = user.getRole();
        if (systemRole == null || systemRole.getCode() == null) {
            throw new UsernameNotFoundException("User has no system role assigned");
        }

        Roles roleCode = systemRole.getCode();

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_" + roleCode.name()))
                .accountLocked(user.getStatus() != null && user.getStatus() == UserStatus.LOCKED)
                .disabled(user.getStatus() != null && user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
}
