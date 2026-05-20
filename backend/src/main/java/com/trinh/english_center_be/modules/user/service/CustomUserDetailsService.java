package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.StringUtil;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
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
    private final UserRoleRepository userRoleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(StringUtil.ENTITY_NOT_FOUND_BY, StringUtil.USER,StringUtil.USERNAME_FIELD, username)));

        List<UserRole> userRoles = userRoleRepository.findByUserIdWithRole(user.getId());
        if (userRoles.isEmpty()) {
            throw new UsernameNotFoundException("User has no roles assigned");
        }

        Set<SimpleGrantedAuthority> authorities = userRoles.stream()
                .map(UserRole::getRole)
                .filter(Objects::nonNull)
                .map(Role::getCode)
                .filter(Objects::nonNull)
                .map(code -> new SimpleGrantedAuthority("ROLE_" + code.name()))
                .collect(Collectors.toSet());

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(authorities)
                .accountLocked(user.getStatus() != null && user.getStatus() == UserStatus.LOCKED)
                .disabled(user.getStatus() != null && user.getStatus() != UserStatus.ACTIVE)
                .build();
    }
}
