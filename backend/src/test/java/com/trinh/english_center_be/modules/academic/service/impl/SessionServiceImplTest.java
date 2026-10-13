package com.trinh.english_center_be.modules.academic.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.trinh.english_center_be.modules.academic.dto.SessionRequest;
import com.trinh.english_center_be.modules.academic.entity.Course;
import com.trinh.english_center_be.modules.academic.repository.CourseRepository;
import com.trinh.english_center_be.modules.academic.repository.CourseSessionRepository;
import com.trinh.english_center_be.shared.exception.ResourceNotFoundException;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class SessionServiceImplTest {

    @Mock
    private CourseSessionRepository courseSessionRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private SessionServiceImpl sessionService;

    @Test
    void findByCourseIdReturnsEmptyWhenCourseDoesNotExist() {
        when(courseRepository.findById("missing")).thenReturn(Optional.empty());

        assertThat(sessionService.findByCourseId("missing")).isEmpty();
        verify(courseSessionRepository, never()).findByCourseOrderBySessionNoAsc(any());
    }

    @Test
    void updateFailsWhenSessionBelongsToAnotherCourse() {
        Course course = Course.builder().id("c1").build();
        when(courseRepository.findById("c1")).thenReturn(Optional.of(course));
        when(courseSessionRepository.findByIdAndCourse("s9", course)).thenReturn(Optional.empty());

        SessionRequest request = new SessionRequest(1, "Title", null, null, null, "Topic");

        assertThatThrownBy(() -> sessionService.update("c1", "s9", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
