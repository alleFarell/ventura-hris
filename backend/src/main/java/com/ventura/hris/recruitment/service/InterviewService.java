package com.ventura.hris.recruitment.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.recruitment.dto.*;
import com.ventura.hris.recruitment.entity.InterviewEvaluation;
import com.ventura.hris.recruitment.entity.InterviewSchedule;
import com.ventura.hris.recruitment.entity.JobApplication;
import com.ventura.hris.recruitment.repository.InterviewEvaluationRepository;
import com.ventura.hris.recruitment.repository.InterviewScheduleRepository;
import com.ventura.hris.recruitment.repository.JobApplicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class InterviewService {

    private final InterviewScheduleRepository scheduleRepository;
    private final InterviewEvaluationRepository evaluationRepository;
    private final JobApplicationRepository applicationRepository;
    private final EmployeeRepository employeeRepository;

    public InterviewService(InterviewScheduleRepository scheduleRepository,
                            InterviewEvaluationRepository evaluationRepository,
                            JobApplicationRepository applicationRepository,
                            EmployeeRepository employeeRepository) {
        this.scheduleRepository = scheduleRepository;
        this.evaluationRepository = evaluationRepository;
        this.applicationRepository = applicationRepository;
        this.employeeRepository = employeeRepository;
    }

    public InterviewScheduleResponse scheduleInterview(InterviewScheduleRequest request) {
        JobApplication app = applicationRepository.findById(request.applicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Job application not found: " + request.applicationId()));

        Employee interviewer = null;
        if (request.interviewerId() != null) {
            interviewer = employeeRepository.findById(request.interviewerId()).orElse(null);
        }

        InterviewSchedule schedule = new InterviewSchedule();
        schedule.setApplication(app);
        schedule.setRoundName(request.roundName());
        schedule.setScheduledTime(request.scheduledTime());
        schedule.setDurationMinutes(request.durationMinutes() != null ? request.durationMinutes() : 60);
        schedule.setInterviewer(interviewer);
        schedule.setLocationUrl(request.locationUrl());
        schedule.setStatus("SCHEDULED");
        schedule.setNotes(request.notes());

        // Update application stage to INTERVIEW
        app.setCurrentStage("INTERVIEW");
        applicationRepository.save(app);

        InterviewSchedule saved = scheduleRepository.save(schedule);
        return mapScheduleToResponse(saved);
    }

    public List<InterviewScheduleResponse> getInterviews(UUID applicationId, String status) {
        List<InterviewSchedule> list;
        if (applicationId != null) {
            list = scheduleRepository.findByApplicationId(applicationId);
        } else if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            list = scheduleRepository.findByStatus(status);
        } else {
            list = scheduleRepository.findAll();
        }
        return list.stream().map(this::mapScheduleToResponse).collect(Collectors.toList());
    }

    public InterviewScheduleResponse getInterview(UUID id) {
        InterviewSchedule schedule = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Interview schedule not found: " + id));
        return mapScheduleToResponse(schedule);
    }

    public InterviewEvaluationResponse submitEvaluation(UUID interviewId, InterviewEvaluationRequest request) {
        InterviewSchedule schedule = scheduleRepository.findById(interviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Interview schedule not found: " + interviewId));

        Employee interviewer = null;
        if (request.interviewerId() != null) {
            interviewer = employeeRepository.findById(request.interviewerId()).orElse(null);
        } else if (schedule.getInterviewer() != null) {
            interviewer = schedule.getInterviewer();
        }

        InterviewEvaluation eval = new InterviewEvaluation();
        eval.setInterview(schedule);
        eval.setInterviewer(interviewer);
        eval.setScore(request.score());
        eval.setVerdict(request.verdict());
        eval.setFeedbackNotes(request.feedbackNotes());
        eval.setSubmittedAt(Instant.now());

        // Mark interview completed
        schedule.setStatus("COMPLETED");
        scheduleRepository.save(schedule);

        // Update application rating
        JobApplication app = schedule.getApplication();
        if (app != null) {
            app.setRating(request.score());
            applicationRepository.save(app);
        }

        InterviewEvaluation saved = evaluationRepository.save(eval);
        return mapEvaluationToResponse(saved);
    }

    public List<InterviewEvaluationResponse> getEvaluations(UUID interviewId) {
        return evaluationRepository.findByInterviewId(interviewId).stream()
                .map(this::mapEvaluationToResponse)
                .collect(Collectors.toList());
    }

    private InterviewScheduleResponse mapScheduleToResponse(InterviewSchedule s) {
        String candName = s.getApplication() != null && s.getApplication().getCandidate() != null
                ? s.getApplication().getCandidate().getFullName() : "";
        String jobTitle = s.getApplication() != null && s.getApplication().getJobPosting() != null
                ? s.getApplication().getJobPosting().getPostingTitle() : "";
        String appNum = s.getApplication() != null ? s.getApplication().getApplicationNumber() : "";
        String intName = s.getInterviewer() != null
                ? s.getInterviewer().getFirstName() + " " + (s.getInterviewer().getLastName() != null ? s.getInterviewer().getLastName() : "") : null;

        return new InterviewScheduleResponse(
                s.getId(),
                s.getApplication() != null ? s.getApplication().getId() : null,
                appNum,
                candName,
                jobTitle,
                s.getRoundName(),
                s.getScheduledTime(),
                s.getDurationMinutes(),
                s.getInterviewer() != null ? s.getInterviewer().getId() : null,
                intName != null ? intName.trim() : null,
                s.getLocationUrl(),
                s.getStatus(),
                s.getNotes(),
                s.getCreatedAt()
        );
    }

    private InterviewEvaluationResponse mapEvaluationToResponse(InterviewEvaluation e) {
        String intName = e.getInterviewer() != null
                ? e.getInterviewer().getFirstName() + " " + (e.getInterviewer().getLastName() != null ? e.getInterviewer().getLastName() : "") : null;

        return new InterviewEvaluationResponse(
                e.getId(),
                e.getInterview() != null ? e.getInterview().getId() : null,
                e.getInterviewer() != null ? e.getInterviewer().getId() : null,
                intName != null ? intName.trim() : null,
                e.getScore(),
                e.getVerdict(),
                e.getFeedbackNotes(),
                e.getSubmittedAt(),
                e.getCreatedAt()
        );
    }
}
