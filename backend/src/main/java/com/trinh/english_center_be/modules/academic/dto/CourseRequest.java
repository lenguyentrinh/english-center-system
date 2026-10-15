package com.trinh.english_center_be.modules.academic.dto;

import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record CourseRequest(

        @NotBlank(message = MessageConstant.CODE_NOT_BLANK)
        @Size(max = Constant.CODE_MAX_LENGTH, message = MessageConstant.CODE_MAX_LENGTH)
        String code,

        @NotBlank(message = MessageConstant.NAME_NOT_BLANK)
        @Size(max = Constant.NAME_MAX_LENGTH, message = MessageConstant.NAME_MAX_LENGTH)
        String name,

        @NotNull(message = MessageConstant.START_DATE_NOT_NULL)
        LocalDate startDate,

        @NotNull(message = MessageConstant.END_DATE_NOT_NULL)
        LocalDate endDate,

        @NotNull(message = MessageConstant.MAX_STUDENT_NOT_NULL)
        @Min(value = Constant.MIN_STUDENT, message = MessageConstant.MAX_STUDENT_MIN)
        Integer maxStudent,

        @NotNull(message = MessageConstant.STATUS_NOT_NULL)
        CourseStatus status,

        @NotNull(message = MessageConstant.MINIMUM_AGE_NOT_NULL)
        Integer minimumAge,

        @NotBlank(message = MessageConstant.REQUIRED_ENTRY_LEVEL_NOT_BLANK)
        String requiredEntryLevel,

        @NotNull(message = MessageConstant.PREREQUISITES_REQUIRED_NOT_NULL)
        Boolean prerequisitesRequired,

        String teacherId,

        /** Legacy field: optional now and not used for teacher qualification (see categoryId). */
        Roles availableRoleTeacher,

        /** Optional admin-managed category; when set the assigned teacher must list it in their specialties. */
        String categoryId,

        String room,

        /** ISO weekdays 1 = Monday .. 7 = Sunday. */
        List<Integer> daysOfWeek,

        LocalTime startTime,

        LocalTime endTime,

        /** true = save even when the teacher has a schedule conflict (admin confirmed). */
        Boolean force
) {
    public boolean forced() {
        return Boolean.TRUE.equals(force);
    }

    public boolean hasSchedule() {
        return (daysOfWeek != null && !daysOfWeek.isEmpty()) || startTime != null || endTime != null;
    }
}
