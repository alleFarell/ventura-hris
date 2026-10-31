package com.ventura.hris.setup.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateBranchRequest(
        @NotBlank @Size(max = 150) String name,
        @Size(max = 200) String addressLine1,
        @Size(max = 200) String addressLine2,
        @Size(max = 100) String city,
        @Size(max = 100) String province,
        @Size(max = 30) String postalCode,
        @Size(min = 2, max = 2) String countryCode,
        String status
) {
}
