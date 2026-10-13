package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.modules.user.Repository.RoleRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRoleRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.modules.user.entity.UserRole;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
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
    private final RoleRepository roleRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(String.format(MessageConstant.ENTITY_NOT_FOUND_BY, Constant.USER, Constant.USERNAME_FIELD, username)));

        List<String> roleIds = userRoleRepository.findByUserId(user.getId()).stream()
                .map(UserRole::getRoleId)
                .toList();
        if (roleIds.isEmpty()) {
            throw new UsernameNotFoundException("User has no roles assigned");
        }

        Set<SimpleGrantedAuthority> authorities = roleRepository.findAllById(roleIds).stream()
                .filter(Objects::nonNull)
                .map(Role::getCode)
                .filter(Objects::nonNull)
                .map(code -> new SimpleGrantedAuthority("ROLE_" + code.name()))
                .collect(Collectors.toSet());

        return new AuthUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getStatus() == null || user.getStatus() == UserStatus.ACTIVE,
                user.getStatus() != UserStatus.LOCKED,
                authorities);
    }
}
