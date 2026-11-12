package com.trinh.english_center_be.modules.user.service;

import com.trinh.english_center_be.modules.user.dto.RoleResponse;
import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;
import java.util.List;

/** Roles are defined by the system (see {@link Roles}); they can be listed and looked up, not created by users. */
public interface RoleService {
    /** @throws com.trinh.english_center_be.shared.exception.ResourceNotFoundException if the role is not seeded */
    Role getByCode(Roles code);

    List<RoleResponse> findAll();
}
