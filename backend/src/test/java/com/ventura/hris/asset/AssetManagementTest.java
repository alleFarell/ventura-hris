package com.ventura.hris.asset;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ventura.hris.asset.dto.*;
import com.ventura.hris.employee.entity.Employee;
import com.ventura.hris.employee.entity.EmploymentStatus;
import com.ventura.hris.employee.repository.EmployeeRepository;
import com.ventura.hris.organization.entity.Department;
import com.ventura.hris.organization.entity.Position;
import com.ventura.hris.organization.repository.DepartmentRepository;
import com.ventura.hris.organization.repository.PositionRepository;
import com.ventura.hris.setup.entity.Branch;
import com.ventura.hris.setup.entity.Company;
import com.ventura.hris.setup.repository.BranchRepository;
import com.ventura.hris.setup.repository.CompanyRepository;
import com.ventura.hris.util.TestDatabaseCleaner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AssetManagementTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TestDatabaseCleaner cleaner;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private BranchRepository branchRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    private Company company;
    private Employee employee1;
    private Employee employee2;

    @BeforeEach
    void setUp() {
        cleaner.clean();

        company = new Company(
                "CMP-AST", "Asset Co", "PT Asset Ventura",
                "01.234.567.8-999.000", "id-ID", "Asia/Jakarta", "IDR", "YYYY-MM-DD",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        company = companyRepository.save(company);

        Branch branch = new Branch(
                company, "BR-AST", "HQ Asset", "Jl. Asset 1", null,
                "Jakarta", "DKI Jakarta", "12190", "ID",
                com.ventura.hris.setup.entity.RecordStatus.ACTIVE
        );
        branch = branchRepository.save(branch);

        Department dept = new Department();
        dept.setCompany(company);
        dept.setCode("IT");
        dept.setName("Information Technology");
        dept = departmentRepository.save(dept);

        Position pos = new Position();
        pos.setCompany(company);
        pos.setDepartment(dept);
        pos.setCode("IT-01");
        pos.setName("Systems Specialist");
        pos = positionRepository.save(pos);

        employee1 = new Employee();
        employee1.setCompany(company);
        employee1.setBranch(branch);
        employee1.setDepartment(dept);
        employee1.setPosition(pos);
        employee1.setEmployeeNumber("EMP-AST01");
        employee1.setFirstName("Charlie");
        employee1.setLastName("Brown");
        employee1.setWorkEmail("charlie.brown@asset.com");
        employee1.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee1.setHireDate(LocalDate.of(2023, 1, 1));
        employee1 = employeeRepository.save(employee1);

        employee2 = new Employee();
        employee2.setCompany(company);
        employee2.setBranch(branch);
        employee2.setDepartment(dept);
        employee2.setPosition(pos);
        employee2.setEmployeeNumber("EMP-AST02");
        employee2.setFirstName("Diana");
        employee2.setLastName("Prince");
        employee2.setWorkEmail("diana.prince@asset.com");
        employee2.setEmploymentStatus(EmploymentStatus.ACTIVE);
        employee2.setHireDate(LocalDate.of(2023, 6, 1));
        employee2 = employeeRepository.save(employee2);
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldManageAssetCategoriesAndAssets() throws Exception {
        // 1. Create Category
        AssetCategoryRequest catReq = new AssetCategoryRequest(
                company.getId(),
                "HW-LAPTOP",
                "Laptops & Notebooks",
                "Company workstation laptops"
        );

        String catResp = mockMvc.perform(post("/api/v1/assets/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.code").value("HW-LAPTOP"))
                .andReturn().getResponse().getContentAsString();

        UUID categoryId = UUID.fromString(objectMapper.readTree(catResp).path("data").path("id").asText());

        // 2. Create Asset
        CompanyAssetRequest assetReq = new CompanyAssetRequest(
                company.getId(),
                categoryId,
                "AST-MBP-01",
                "MacBook Pro 16-inch M3 Max",
                "Apple MacBook Pro 2024",
                "SN-C02XYZ1234",
                LocalDate.of(2024, 2, 1),
                BigDecimal.valueOf(42000000.0),
                "AVAILABLE",
                "EXCELLENT",
                "Brand new executive unit"
        );

        mockMvc.perform(post("/api/v1/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assetReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.assetTag").value("AST-MBP-01"))
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"));

        // 3. Duplicate asset tag should fail (400)
        mockMvc.perform(post("/api/v1/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assetReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("DUPLICATE_ASSET_TAG"));

        // 4. Retrieve assets list
        mockMvc.perform(get("/api/v1/assets")
                        .param("companyId", company.getId().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].assetTag").value("AST-MBP-01"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldHandleAllocationAndReturnLifecycle() throws Exception {
        // 1. Setup Category and Asset
        AssetCategoryRequest catReq = new AssetCategoryRequest(
                company.getId(),
                "HW-PHONE",
                "Mobile Phones",
                "Company operational smartphones"
        );
        String catResp = mockMvc.perform(post("/api/v1/assets/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(catReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID categoryId = UUID.fromString(objectMapper.readTree(catResp).path("data").path("id").asText());

        CompanyAssetRequest assetReq = new CompanyAssetRequest(
                company.getId(),
                categoryId,
                "AST-IPHONE-01",
                "iPhone 15 Pro Max 256GB",
                "Apple iPhone 15",
                "SN-IPH-998877",
                LocalDate.of(2024, 3, 1),
                BigDecimal.valueOf(22000000.0),
                "AVAILABLE",
                "EXCELLENT",
                "Assigned with case and charger"
        );
        String assetResp = mockMvc.perform(post("/api/v1/assets")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assetReq)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        UUID assetId = UUID.fromString(objectMapper.readTree(assetResp).path("data").path("id").asText());

        // 2. Allocate to employee1 -> Success
        AssetAllocationRequest allocReq = new AssetAllocationRequest(
                assetId,
                employee1.getId(),
                LocalDate.of(2024, 3, 5),
                "Handed over in mint condition with original accessories"
        );

        String allocResp = mockMvc.perform(post("/api/v1/assets/allocations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(allocReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.assetTag").value("AST-IPHONE-01"))
                .andReturn().getResponse().getContentAsString();

        UUID allocationId = UUID.fromString(objectMapper.readTree(allocResp).path("data").path("id").asText());

        // Verify asset is now ALLOCATED
        mockMvc.perform(get("/api/v1/assets/" + assetId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ALLOCATED"))
                .andExpect(jsonPath("$.data.assignedToEmployeeName").value("Charlie Brown"));

        // 3. Trying to allocate the same asset to employee2 -> Should fail (400)
        AssetAllocationRequest allocReq2 = new AssetAllocationRequest(
                assetId,
                employee2.getId(),
                LocalDate.of(2024, 3, 10),
                "Second handover attempt"
        );
        mockMvc.perform(post("/api/v1/assets/allocations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(allocReq2)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("ASSET_NOT_AVAILABLE"));

        // 4. Return asset
        AssetReturnRequest returnReq = new AssetReturnRequest(
                LocalDate.of(2024, 6, 1),
                "Returned upon project completion, minor screen scratch",
                "GOOD"
        );

        mockMvc.perform(put("/api/v1/assets/allocations/" + allocationId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("RETURNED"))
                .andExpect(jsonPath("$.data.returnNotes").value("Returned upon project completion, minor screen scratch"));

        // 5. Verify asset is back to AVAILABLE with updated condition
        mockMvc.perform(get("/api/v1/assets/" + assetId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.data.conditionGrade").value("GOOD"));

        // 6. Returning an already returned allocation should fail (400)
        mockMvc.perform(put("/api/v1/assets/allocations/" + allocationId + "/return")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(returnReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("ALREADY_RETURNED"));
    }
}
