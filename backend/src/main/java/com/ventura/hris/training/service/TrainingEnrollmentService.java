package com.ventura.hris.training.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.training.dto.EnrollmentStatusUpdateRequest;
import com.ventura.hris.training.dto.TrainingEnrollmentRequest;
import com.ventura.hris.training.dto.TrainingEnrollmentResponse;
import com.ventura.hris.training.entity.TrainingEnrollment;
import com.ventura.hris.training.entity.TrainingSession;
import com.ventura.hris.training.repository.TrainingEnrollmentRepository;
import com.ventura.hris.training.repository.TrainingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingEnrollmentService {

    private static final List<String> ACTIVE_STATUSES = List.of("REQUESTED", "APPROVED", "ATTENDED", "COMPLETED");

    private final TrainingEnrollmentRepository enrollmentRepository;
    private final TrainingSessionRepository sessionRepository;
    private final EmployeeRepository employeeRepository;

    public TrainingEnrollmentService(TrainingEnrollmentRepository enrollmentRepository,
                                   TrainingSessionRepository sessionRepository,
                                   EmployeeRepository employeeRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.sessionRepository = sessionRepository;
        this.employeeRepository = employeeRepository;
    }

    public TrainingEnrollmentResponse enrollEmployee(TrainingEnrollmentRequest request) {
        TrainingSession session = sessionRepository.findById(request.sessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Training session not found: " + request.sessionId()));

        Employee employee = employeeRepository.findById(request.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found: " + request.employeeId()));

        if (enrollmentRepository.findBySessionIdAndEmployeeId(session.getId(), employee.getId()).isPresent()) {
            throw new DomainException("ALREADY_ENROLLED", "Employee is already enrolled in this training session");
        }

        long activeCount = enrollmentRepository.countBySessionIdAndStatusIn(session.getId(), ACTIVE_STATUSES);
        if (activeCount >= session.getCapacity()) {
            throw new DomainException("SESSION_CAPACITY_EXCEEDED", "Session capacity limit of " + session.getCapacity() + " attendees has been reached");
        }

        TrainingEnrollment enrollment = new TrainingEnrollment();
        enrollment.setSession(session);
        enrollment.setEmployee(employee);
        enrollment.setStatus(request.status() != null && !request.status().isBlank() ? request.status().trim().toUpperCase() : "REQUESTED");

        TrainingEnrollment saved = enrollmentRepository.save(enrollment);
        return mapToResponse(saved);
    }

    public TrainingEnrollmentResponse updateEnrollmentStatus(UUID enrollmentId, EnrollmentStatusUpdateRequest request) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + enrollmentId));

        enrollment.setStatus(request.status().trim().toUpperCase());
        if (request.score() != null) {
            enrollment.setScore(request.score());
        }
        if (request.certificateUrl() != null) {
            enrollment.setCertificateUrl(request.certificateUrl().trim());
        }

        TrainingEnrollment updated = enrollmentRepository.save(enrollment);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<TrainingEnrollmentResponse> getEnrollments(UUID sessionId, UUID employeeId) {
        List<TrainingEnrollment> list;
        if (sessionId != null) {
            list = enrollmentRepository.findBySessionId(sessionId);
        } else if (employeeId != null) {
            list = enrollmentRepository.findByEmployeeId(employeeId);
        } else {
            list = enrollmentRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingEnrollmentResponse getEnrollmentById(UUID id) {
        TrainingEnrollment enrollment = enrollmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found: " + id));
        return mapToResponse(enrollment);
    }

    private TrainingEnrollmentResponse mapToResponse(TrainingEnrollment e) {
        String employeeName = "";
        String employeeNumber = "";
        if (e.getEmployee() != null) {
            employeeName = e.getEmployee().getFirstName() + " " + (e.getEmployee().getLastName() != null ? e.getEmployee().getLastName() : "");
            employeeNumber = e.getEmployee().getEmployeeNumber();
        }

        String sessionName = e.getSession() != null ? e.getSession().getSessionName() : "";
        String courseTitle = (e.getSession() != null && e.getSession().getCourse() != null) ? e.getSession().getCourse().getTitle() : "";

        return new TrainingEnrollmentResponse(
                e.getId(),
                e.getSession() != null ? e.getSession().getId() : null,
                sessionName,
                courseTitle,
                e.getEmployee() != null ? e.getEmployee().getId() : null,
                employeeName.trim(),
                employeeNumber,
                e.getStatus(),
                e.getScore(),
                e.getCertificateUrl(),
                e.getCreatedAt(),
                e.getUpdatedAt()
        );
    }
}
