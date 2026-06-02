package com.trinh.english_center_be.modules.academic.service;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import java.util.List;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public List<CourseResponse> findAll() {
        return courseRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Override
    public CourseResponse findById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        return toResponse(course);
    }

    @Override
    @Transactional
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
            Teacher teacher = teacherRepository.findById(request.teacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + request.teacherId()));
            course.setTeacher(teacher);
        }

        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public CourseResponse update(Long id, CourseRequest request) {
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
            Teacher teacher = teacherRepository.findById(request.teacherId())
                    .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + request.teacherId()));
            course.setTeacher(teacher);
        } else {
            course.setTeacher(null);
        }

        return toResponse(courseRepository.save(course));
    }

    @Override
    @Transactional
    public void softDeleteById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setActive(false);
        courseRepository.save(course);
    }

    @Override
    @Transactional
    public CourseResponse assignTeacher(Long courseId, Long teacherId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, courseId)));

        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.TEACHER, teacherId)));

        course.setTeacher(teacher);
        return toResponse(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> findByTeacherUserId(Long userId) {
        List<Course> courses = courseRepository.findByTeacherUserId(userId);
        return courses.stream().map(this::toResponse).toList();
    }

    @Override
    public List<CourseResponse> findByTeacherUserIdAndAvailableRoles(Long userId, List<com.trinh.english_center_be.shared.enums.Roles> roles) {
        if (roles == null || roles.isEmpty()) return List.of();
        List<Course> courses = courseRepository.findByTeacherUserIdAndAvailableRoleTeacherIn(userId, roles);
        return courses.stream().map(this::toResponse).toList();
    }

    private CourseResponse toResponse(Course course) {
        return new CourseResponse(
                course.getId(),
                course.getCode(),
                course.getName(),
                course.getStartDate(),
                course.getEndDate(),
                course.getMaxStudent(),
                course.getStatus(),
                course.getMinimumAge(),
                course.getRequiredEntryLevel(),
                course.getPrerequisitesRequired(),
                course.getTeacher() != null ? course.getTeacher().getId() : null,
                course.getTeacher() != null && course.getTeacher().getUser() != null ? course.getTeacher().getUser().getFullName() : null,
                course.getAvailableRoleTeacher()
        );
    }
}