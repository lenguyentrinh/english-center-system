package com.trinh.english_center_be.modules.user.util;

import com.trinh.english_center_be.modules.user.entity.Role;
import com.trinh.english_center_be.shared.enums.Roles;

import java.util.ArrayList;
import java.util.List;

public final class RoleUtils {
    private RoleUtils() {}

    public static List<Roles> parseRolesCsv(String csv) {
        List<Roles> res = new ArrayList<>();
        if (csv == null || csv.isBlank()) return res;
        String[] tokens = csv.split(",");
        for (String t : tokens) {
            try {
                res.add(Roles.valueOf(t.trim()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException(String.format("Invalid role: %s", t.trim()));
            }
        }
        return res;
    }

    /** @param roles roles of a business role, typically loaded via RoleRepository.findByBusinessRole */
    public static List<Roles> getTeacherRoleCodes(List<Role> roles) {
        List<Roles> res = new ArrayList<>();
        if (roles == null) return res;
        for (Role r : roles) {
            if (r == null || r.getCode() == null) continue;
            if (r.getCode().name().startsWith("TEACHER")) res.add(r.getCode());
        }
        return res;
    }
}
