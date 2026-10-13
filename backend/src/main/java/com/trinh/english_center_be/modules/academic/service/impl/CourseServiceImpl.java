package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.mapper.CourseMapper;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    @Override
    public List<CourseResponse> findAll() {
        return courseRepository.findAll().stream().map(CourseMapper::toResponse).toList();
    }

    @Override
    public CourseResponse findById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        return CourseMapper.toResponse(course);
    }

    @Override
    public CourseResponse create(CourseRequest request) {
        Course course = Course.builder()
                .code(request.code())
                .name(request.name())
                .startDate(request.startDate())
                .endDate(request.endDate())
                .maxStudent(request.maxStudent())
                .status(request.status())
                .minimumAge(request.minimumAge())
                .requiredEntryLevel(request.requiredEntryLevel())
                .prerequisitesRequired(request.prerequisitesRequired())
                .availableRoleTeacher(request.availableRoleTeacher())
                .build();

        if (request.teacherId() != null) {
            course.setTeacher(findTeacherOrThrow(request.teacherId()));
        }

        return CourseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse update(String id, CourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setCode(request.code());
        course.setName(request.name());
        course.setStartDate(request.startDate());
        course.setEndDate(request.endDate());
        course.setMaxStudent(request.maxStudent());
        course.setStatus(request.status());
        course.setMinimumAge(request.minimumAge());
        course.setRequiredEntryLevel(request.requiredEntryLevel());
        course.setPrerequisitesRequired(request.prerequisitesRequired());
        course.setAvailableRoleTeacher(request.availableRoleTeacher());

        if (request.teacherId() != null) {
            course.setTeacher(findTeacherOrThrow(request.teacherId()));
        } else {
            course.setTeacher(null);
        }

        return CourseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public void softDeleteById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setActive(false);
        courseRepository.save(course);
    }

    @Override
    public CourseResponse assignTeacher(String courseId, String teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, courseId)));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.TEACHER, teacherId)));

        course.setTeacher(teacher);
        return CourseMapper.toResponse(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> findByTeacherUserId(String userId) {
        return findTeacherByUserId(userId)
                .map(teacher -> courseRepository.findByTeacher(teacher).stream().map(CourseMapper::toResponse).toList())
                .orElse(List.of());
    }

    @Override
    public List<CourseResponse> findByTeacherUserIdAndAvailableRoles(String userId, List<Roles> roles) {
        if (roles == null || roles.isEmpty()) return List.of();
        return findTeacherByUserId(userId)
                .map(teacher -> courseRepository.findByTeacherAndAvailableRoleTeacherIn(teacher, roles).stream()
                        .map(CourseMapper::toResponse)
                        .toList())
                .orElse(List.of());
    }

    private Teacher findTeacherOrThrow(String teacherId) {
        return teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));
    }

    /** Course -> Teacher is a DBRef, so course lookups by user go user -> teacher -> courses. */
    private Optional<Teacher> findTeacherByUserId(String userId) {
        return userRepository.findById(userId).flatMap(teacherRepository::findByUser);
    }
}
