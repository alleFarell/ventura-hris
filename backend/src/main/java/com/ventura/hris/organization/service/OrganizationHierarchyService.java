package com.ventura.hris.organization.service;

import com.ventura.hris.common.exception.DomainException;
import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.organization.dto.MoveOrganizationUnitRequest;
import com.ventura.hris.organization.dto.OrganizationTreeNodeResponse;
import com.ventura.hris.organization.dto.OrganizationUnitResponse;
import com.ventura.hris.organization.dto.StructureHistoryResponse;
import com.ventura.hris.organization.entity.OrganizationStructureHistory;
import com.ventura.hris.organization.entity.OrganizationUnit;
import com.ventura.hris.organization.repository.OrganizationStructureHistoryRepository;
import com.ventura.hris.organization.repository.OrganizationUnitRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrganizationHierarchyService {

    private final OrganizationUnitRepository organizationUnitRepository;
    private final OrganizationStructureHistoryRepository historyRepository;

    public OrganizationHierarchyService(
            OrganizationUnitRepository organizationUnitRepository,
            OrganizationStructureHistoryRepository historyRepository
    ) {
        this.organizationUnitRepository = organizationUnitRepository;
        this.historyRepository = historyRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationUnitResponse> listUnits(UUID companyId) {
        return organizationUnitRepository.findAllActiveByCompanyId(companyId)
                .stream()
                .map(this::toUnitResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrganizationUnitResponse getUnit(UUID id) {
        return toUnitResponse(findUnitById(id));
    }

    @Transactional(readOnly = true)
    public List<OrganizationTreeNodeResponse> getHierarchyTree(UUID companyId) {
        List<OrganizationUnit> allUnits = organizationUnitRepository.findAllActiveByCompanyId(companyId);

        // Group units by parentUnitId (null means root)
        Map<UUID, List<OrganizationUnit>> childrenByParent = allUnits.stream()
                .filter(u -> u.getParentUnit() != null)
                .collect(Collectors.groupingBy(u -> u.getParentUnit().getId()));

        List<OrganizationUnit> rootUnits = allUnits.stream()
                .filter(u -> u.getParentUnit() == null)
                .toList();

        return rootUnits.stream()
                .map(root -> buildNode(root, childrenByParent))
                .toList();
    }

    private OrganizationTreeNodeResponse buildNode(
            OrganizationUnit unit,
            Map<UUID, List<OrganizationUnit>> childrenByParent
    ) {
        List<OrganizationUnit> childrenUnits = childrenByParent.getOrDefault(unit.getId(), Collections.emptyList());
        List<OrganizationTreeNodeResponse> childNodes = childrenUnits.stream()
                .map(child -> buildNode(child, childrenByParent))
                .toList();

        return new OrganizationTreeNodeResponse(
                unit.getId(),
                unit.getCompany().getId(),
                unit.getParentUnit() != null ? unit.getParentUnit().getId() : null,
                unit.getDepartment() != null ? unit.getDepartment().getId() : null,
                unit.getDivision() != null ? unit.getDivision().getId() : null,
                unit.getPosition() != null ? unit.getPosition().getId() : null,
                unit.getCode(),
                unit.getName(),
                unit.getUnitType(),
                unit.getStatus(),
                childNodes
        );
    }

    @Transactional
    public OrganizationUnitResponse moveParent(UUID unitId, MoveOrganizationUnitRequest request) {
        OrganizationUnit movingUnit = findUnitById(unitId);
        OrganizationUnit oldParent = movingUnit.getParentUnit();
        OrganizationUnit newParent = null;

        if (request.newParentUnitId() != null) {
            if (request.newParentUnitId().equals(unitId)) {
                throw new DomainException("ORG_HIERARCHY_CYCLE", "A unit cannot be its own parent", HttpStatus.BAD_REQUEST);
            }

            newParent = findUnitById(request.newParentUnitId());
            if (!newParent.getCompany().getId().equals(movingUnit.getCompany().getId())) {
                throw new DomainException("INVALID_PARENT_UNIT", "New parent unit belongs to another company", HttpStatus.BAD_REQUEST);
            }

            // Detect cycle: check if movingUnit is an ancestor of newParent
            OrganizationUnit current = newParent;
            Set<UUID> visited = new HashSet<>();
            while (current != null) {
                if (current.getId().equals(movingUnit.getId())) {
                    throw new DomainException("ORG_HIERARCHY_CYCLE", "Cannot move unit under its own descendant subtree", HttpStatus.BAD_REQUEST);
                }
                if (!visited.add(current.getId())) {
                    throw new DomainException("ORG_HIERARCHY_CYCLE", "Hierarchy loop detected", HttpStatus.BAD_REQUEST);
                }
                current = current.getParentUnit();
            }
        }

        // Record history log
        OrganizationStructureHistory history = new OrganizationStructureHistory(
                movingUnit,
                oldParent,
                newParent,
                request.effectiveDate(),
                request.reason()
        );
        historyRepository.save(history);

        // Update parent
        movingUnit.setParentUnit(newParent);

        return toUnitResponse(movingUnit);
    }

    @Transactional(readOnly = true)
    public List<StructureHistoryResponse> getUnitHistory(UUID unitId) {
        // Validate unit exists
        findUnitById(unitId);

        return historyRepository.findHistoryByUnitId(unitId)
                .stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    public OrganizationUnit findUnitById(UUID id) {
        return organizationUnitRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("OrganizationUnit"));
    }

    private OrganizationUnitResponse toUnitResponse(OrganizationUnit unit) {
        return new OrganizationUnitResponse(
                unit.getId(),
                unit.getCompany().getId(),
                unit.getParentUnit() != null ? unit.getParentUnit().getId() : null,
                unit.getParentUnit() != null ? unit.getParentUnit().getName() : null,
                unit.getDepartment() != null ? unit.getDepartment().getId() : null,
                unit.getDivision() != null ? unit.getDivision().getId() : null,
                unit.getPosition() != null ? unit.getPosition().getId() : null,
                unit.getCode(),
                unit.getName(),
                unit.getUnitType(),
                unit.getStatus(),
                unit.getCreatedAt(),
                unit.getUpdatedAt(),
                unit.getVersion()
        );
    }

    private StructureHistoryResponse toHistoryResponse(OrganizationStructureHistory history) {
        return new StructureHistoryResponse(
                history.getId(),
                history.getOrganizationUnit().getId(),
                history.getOrganizationUnit().getName(),
                history.getOldParentUnit() != null ? history.getOldParentUnit().getId() : null,
                history.getOldParentUnit() != null ? history.getOldParentUnit().getName() : null,
                history.getNewParentUnit() != null ? history.getNewParentUnit().getId() : null,
                history.getNewParentUnit() != null ? history.getNewParentUnit().getName() : null,
                history.getEffectiveDate(),
                history.getReason(),
                history.getCreatedAt()
        );
    }
}
