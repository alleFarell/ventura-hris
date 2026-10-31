package com.ventura.hris.training.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.training.dto.TrainingSessionRequest;
import com.ventura.hris.training.dto.TrainingSessionResponse;
import com.ventura.hris.training.entity.TrainingCourse;
import com.ventura.hris.training.entity.TrainingSession;
import com.ventura.hris.training.repository.TrainingCourseRepository;
import com.ventura.hris.training.repository.TrainingEnrollmentRepository;
import com.ventura.hris.training.repository.TrainingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingSessionService {

    private static final List<String> ACTIVE_STATUSES = List.of("REQUESTED", "APPROVED", "ATTENDED", "COMPLETED");

    private final TrainingSessionRepository sessionRepository;
    private final TrainingCourseRepository courseRepository;
    private final TrainingEnrollmentRepository enrollmentRepository;

    public TrainingSessionService(TrainingSessionRepository sessionRepository,
                                  TrainingCourseRepository courseRepository,
                                  TrainingEnrollmentRepository enrollmentRepository) {
        this.sessionRepository = sessionRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    public TrainingSessionResponse createSession(TrainingSessionRequest request) {
        TrainingCourse course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResourceNotFoundException("Training course not found: " + request.courseId()));

        if (request.endTime().isBefore(request.startTime())) {
            throw new DomainException("INVALID_TIME_RANGE", "Session end time must be after start time");
        }

        TrainingSession session = new TrainingSession();
        session.setCourse(course);
        session.setSessionName(request.sessionName().trim());
        session.setStartTime(request.startTime());
        session.setEndTime(request.endTime());
        session.setLocation(request.location());
        session.setCapacity(request.capacity() != null && request.capacity() > 0 ? request.capacity() : 20);
        session.setStatus(request.status() != null && !request.status().isBlank() ? request.status().trim().toUpperCase() : "SCHEDULED");
        session.setInstructorName(request.instructorName());

        TrainingSession saved = sessionRepository.save(session);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TrainingSessionResponse> getSessions(UUID courseId, String status) {
        List<TrainingSession> list;
        if (courseId != null) {
            list = sessionRepository.findByCourseId(courseId);
        } else if (status != null && !status.isBlank()) {
            list = sessionRepository.findByStatus(status.trim().toUpperCase());
        } else {
            list = sessionRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingSessionResponse getSessionById(UUID id) {
        TrainingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found: " + id));
        return mapToResponse(session);
    }

    public TrainingSessionResponse updateStatus(UUID id, String status) {
        TrainingSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found: " + id));
        session.setStatus(status.trim().toUpperCase());
        return mapToResponse(sessionRepository.save(session));
    }

    private TrainingSessionResponse mapToResponse(TrainingSession s) {
        long count = enrollmentRepository.countBySessionIdAndStatusIn(s.getId(), ACTIVE_STATUSES);
        return new TrainingSessionResponse(
                s.getId(),
                s.getCourse() != null ? s.getCourse().getId() : null,
                s.getCourse() != null ? s.getCourse().getCode() : null,
                s.getCourse() != null ? s.getCourse().getTitle() : null,
                s.getSessionName(),
                s.getStartTime(),
                s.getEndTime(),
                s.getLocation(),
                s.getCapacity(),
                count,
                s.getStatus(),
                s.getInstructorName(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
