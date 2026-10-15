package com.trinh.english_center_be.modules.academic.service.impl;

import com.trinh.english_center_be.modules.academic.dto.CourseRequest;
import com.trinh.english_center_be.modules.academic.dto.CourseResponse;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.entity.Enrollment;
import com.trinh.english_center_be.modules.academic.mapper.CourseMapper;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.EnrollmentRepository;
import com.trinh.english_center_be.modules.academic.service.CourseService;
import com.trinh.english_center_be.modules.academic.service.ScheduleRules;
import com.trinh.english_center_be.modules.category.entity.Category;
import com.trinh.english_center_be.modules.category.repository.CategoryRepository;
import com.trinh.english_center_be.modules.category.service.CategoryService;
import com.trinh.english_center_be.modules.teacher.entity.Teacher;
import com.trinh.english_center_be.modules.teacher.repository.TeacherRepository;
import com.trinh.english_center_be.modules.user.Repository.UserRepository;
import com.trinh.english_center_be.shared.enums.CourseStatus;
import com.trinh.english_center_be.shared.enums.Roles;
import com.trinh.english_center_be.shared.exception.BusinessException;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import com.trinh.english_center_be.shared.util.Constant;
import com.trinh.english_center_be.shared.util.MessageConstant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final CategoryService categoryService;
    private final CategoryRepository categoryRepository;
    private final EnrollmentRepository enrollmentRepository;

    /** Soft-deleted courses (active=false) must disappear from every read. */
    private static boolean isLive(Course course) {
        return !Boolean.FALSE.equals(course.getActive());
    }

    @Override
    public List<CourseResponse> findAll() {
        List<Course> live = courseRepository.findAll().stream().filter(CourseServiceImpl::isLive).toList();
        Map<String, Category> categories = categoriesById(live);
        return live.stream().map(c -> toResponse(c, c.getCategoryId() == null ? null : categories.get(c.getCategoryId()))).toList();
    }

    @Override
    public CourseResponse findById(String id) {
        return toResponse(requireLive(id));
    }

    @Override
    public CourseResponse create(CourseRequest request) {
        // A new course cannot start in the past; editing a running course must stay possible, so this is not on the DTO.
        if (request.startDate().isBefore(LocalDate.now())) {
            throw new BusinessException(MessageConstant.START_DATE_FUTURE_OR_PRESENT, HttpStatus.BAD_REQUEST);
        }
        validate(request);

        Course course = Course.builder().build();
        apply(course, request);
        assignAndCheck(course, request.teacherId(), request.forced());
        return toResponse(courseRepository.save(course));
    }

    @Override
    public CourseResponse update(String id, CourseRequest request) {
        Course course = requireLive(id);
        validate(request);
        long enrolled = enrollmentRepository.countByCourseAndStatus(course, Enrollment.ACTIVE);
        if (request.maxStudent() != null && request.maxStudent() < enrolled) {
            throw new BusinessException("Max students cannot be lower than the " + enrolled + " students already enrolled", HttpStatus.CONFLICT);
        }

        apply(course, request);
        assignAndCheck(course, request.teacherId(), request.forced());
        return toResponse(courseRepository.save(course));
    }

    @Override
    public void softDeleteById(String id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));

        course.setActive(false);
        // The code index is unique: free the code so a new course can reuse it.
        if (course.getCode() != null && !course.getCode().contains("~deleted~")) {
            course.setCode(course.getCode() + "~deleted~" + course.getId());
        }
        courseRepository.save(course);
    }

    @Override
    public CourseResponse assignTeacher(String courseId, String teacherId) {
        return assignTeacher(courseId, teacherId, false);
    }

    @Override
    public CourseResponse assignTeacher(String courseId, String teacherId, boolean force) {
        Course course = requireLive(courseId);
        assignAndCheck(course, teacherId, force);
        return toResponse(courseRepository.save(course));
    }

    @Override
    public List<CourseResponse> findByTeacherUserId(String userId) {
        return findTeacherByUserId(userId)
                .map(teacher -> courseRepository.findByTeacher(teacher).stream().filter(CourseServiceImpl::isLive).map(this::toResponse).toList())
                .orElse(List.of());
    }

    @Override
    public List<CourseResponse> findByTeacherUserIdAndAvailableRoles(String userId, List<Roles> roles) {
        if (roles == null || roles.isEmpty()) return List.of();
        return findTeacherByUserId(userId)
                .map(teacher -> courseRepository.findByTeacherAndAvailableRoleTeacherIn(teacher, roles).stream()
                        .filter(CourseServiceImpl::isLive)
                        .map(this::toResponse)
                        .toList())
                .orElse(List.of());
    }

    // ---- internals -------------------------------------------------------------------------------------------

    private Course requireLive(String id) {
        return courseRepository.findById(id)
                .filter(CourseServiceImpl::isLive)
                .orElseThrow(() -> new ResourceNotFoundException(String.format(MessageConstant.NOT_FOUND_BY_ID, Constant.COURSE, id)));
    }

    private CourseResponse toResponse(Course course) {
        Category category = course.getCategoryId() == null ? null : categoryRepository.findById(course.getCategoryId()).orElse(null);
        return toResponse(course, category);
    }

    private CourseResponse toResponse(Course course, Category category) {
        long enrolled = course.getId() == null ? 0 : enrollmentRepository.countByCourseAndStatus(course, Enrollment.ACTIVE);
        return CourseMapper.toResponse(course, category, enrolled);
    }

    private Map<String, Category> categoriesById(List<Course> courses) {
        List<String> ids = courses.stream().map(Course::getCategoryId).filter(java.util.Objects::nonNull).distinct().toList();
        if (ids.isEmpty()) return Map.of();
        return categoryRepository.findAllById(ids).stream().collect(Collectors.toMap(Category::getId, c -> c));
    }

    private static void validate(CourseRequest request) {
        if (request.endDate().isBefore(request.startDate())) {
            throw new BusinessException("End date must not be before start date", HttpStatus.BAD_REQUEST);
        }
        ScheduleRules.validate(request.daysOfWeek(), request.startTime(), request.endTime());
    }

    /** Copies request fields onto the course (teacher is handled separately by {@link #assignAndCheck}). */
    private void apply(Course course, CourseRequest request) {
        if (request.categoryId() != null) categoryService.requireActive(request.categoryId());

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
        course.setCategoryId(request.categoryId());
        course.setRoom(request.room());
        course.setDaysOfWeek(request.daysOfWeek() == null || request.daysOfWeek().isEmpty() ? null : request.daysOfWeek().stream().distinct().sorted().toList());
        course.setStartTime(request.startTime());
        course.setEndTime(request.endTime());
    }

    /** Sets (or clears) the teacher after the qualification and time-conflict checks. */
    private void assignAndCheck(Course course, String teacherId, boolean force) {
        if (teacherId == null) {
            course.setTeacher(null);
            return;
        }
        Teacher teacher = findQualifiedTeacher(teacherId, course.getCategoryId());
        if (!force) rejectConflicts(course, teacher);
        course.setTeacher(teacher);
    }

    /** 409 naming the colliding course codes; admin retries with force=true to confirm. */
    private void rejectConflicts(Course course, Teacher teacher) {
        List<Course> clashes = ScheduleRules.conflicts(course, courseRepository.findByTeacher(teacher));
        if (!clashes.isEmpty()) {
            String codes = clashes.stream().map(Course::getCode).collect(Collectors.joining(", "));
            throw new BusinessException("Teacher has a schedule conflict with: " + codes, HttpStatus.CONFLICT);
        }
    }

    /**
     * Category-based qualification: a course with a category needs a teacher whose specialties include it;
     * a course without a category accepts any teacher. (Roles.availableRoleTeacher is legacy and ignored.)
     */
    private Teacher findQualifiedTeacher(String teacherId, String categoryId) {
        Teacher teacher = teacherRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher not found: " + teacherId));
        if (categoryId != null && (teacher.getCategoryIds() == null || !teacher.getCategoryIds().contains(categoryId))) {
            throw new BusinessException("Teacher is not specialised in this course category", HttpStatus.BAD_REQUEST);
        }
        return teacher;
    }

    /** Course -> Teacher is a DBRef, so course lookups by user go user -> teacher -> courses. */
    private Optional<Teacher> findTeacherByUserId(String userId) {
        return userRepository.findById(userId).flatMap(teacherRepository::findByUser);
    }

    /** Used by schedule and enrollment services to skip closed courses. */
    static boolean isOpenForWork(Course c) {
        return isLive(c) && c.getStatus() != CourseStatus.CLOSE;
    }
}
