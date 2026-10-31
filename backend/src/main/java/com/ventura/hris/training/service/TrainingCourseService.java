package com.ventura.hris.training.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.CompanyRepository;
import com.ventura.hris.training.dto.TrainingCourseRequest;
import com.ventura.hris.training.dto.TrainingCourseResponse;
import com.ventura.hris.training.entity.TrainingCourse;
import com.ventura.hris.training.repository.TrainingCourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class TrainingCourseService {

    private final TrainingCourseRepository courseRepository;
    private final CompanyRepository companyRepository;

    public TrainingCourseService(TrainingCourseRepository courseRepository,
                                 CompanyRepository companyRepository) {
        this.courseRepository = courseRepository;
        this.companyRepository = companyRepository;
    }

    public TrainingCourseResponse createCourse(TrainingCourseRequest request) {
        Company company = companyRepository.findById(request.companyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found: " + request.companyId()));

        if (courseRepository.findByCompanyIdAndCode(company.getId(), request.code().trim().toUpperCase()).isPresent()) {
            throw new DomainException("DUPLICATE_CODE", "Training course with code " + request.code() + " already exists for this company");
        }

        TrainingCourse course = new TrainingCourse();
        course.setCompany(company);
        course.setCode(request.code().trim().toUpperCase());
        course.setTitle(request.title().trim());
        course.setCategory(request.category() != null && !request.category().isBlank() ? request.category().trim().toUpperCase() : "TECHNICAL");
        course.setProviderName(request.providerName());
        course.setDurationHours(request.durationHours() != null ? request.durationHours() : BigDecimal.valueOf(8.00));
        course.setCost(request.cost() != null ? request.cost() : BigDecimal.ZERO);
        course.setIsActive(request.isActive() != null ? request.isActive() : true);
        course.setDescription(request.description());

        TrainingCourse saved = courseRepository.save(course);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TrainingCourseResponse> getCourses(UUID companyId) {
        List<TrainingCourse> list;
        if (companyId != null) {
            list = courseRepository.findByCompanyId(companyId);
        } else {
            list = courseRepository.findAll();
        }
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TrainingCourseResponse getCourseById(UUID id) {
        TrainingCourse course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Training course not found: " + id));
        return mapToResponse(course);
    }

    private TrainingCourseResponse mapToResponse(TrainingCourse course) {
        return new TrainingCourseResponse(
                course.getId(),
                course.getCompany() != null ? course.getCompany().getId() : null,
                course.getCompany() != null ? course.getCompany().getName() : null,
                course.getCode(),
                course.getTitle(),
                course.getCategory(),
                course.getProviderName(),
                course.getDurationHours(),
                course.getCost(),
                course.getIsActive(),
                course.getDescription(),
                course.getCreatedAt(),
                course.getUpdatedAt()
        );
    }
}
