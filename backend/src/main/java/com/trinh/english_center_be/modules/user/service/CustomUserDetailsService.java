package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.auth.security.AuthUserDetails;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.modules.user.entity.User;
import com.trinh.english_center_be.shared.enums.UserStatus;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.util.Set;
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
                .orElseThrow(() -> new UsernameNotFoundException(String.format(MessageConstant.ENTITY_NOT_FOUND_BY, Constant.USER, Constant.USERNAME_FIELD, username)));

        Role role = user.getRole();
        if (role == null || role.getCode() == null) {
            throw new UsernameNotFoundException("User has no roles assigned");
        }

        return new AuthUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getStatus() == null || user.getStatus() == UserStatus.ACTIVE,
                user.getStatus() != UserStatus.LOCKED,
                Set.of(new SimpleGrantedAuthority("ROLE_" + role.getCode().name())));
    }
}
