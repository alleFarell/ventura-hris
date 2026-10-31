package com.ventura.hris.payroll.controller;

import com.ventura.hris.common.api.ApiResponse;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.service.TaxConfigurationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payroll/tax-config")
public class TaxConfigController {

    private final TaxConfigurationService taxService;

    public TaxConfigController(TaxConfigurationService taxService) {
        this.taxService = taxService;
    }

    @GetMapping("/brackets")
    public ApiResponse<List<TaxConfigurationResponse>> getTaxBrackets(@RequestParam(required = false) Integer year) {
        List<TaxConfigurationResponse> list = taxService.getTaxBrackets(year);
        return ApiResponse.success(list, "Tax brackets retrieved");
    }

    @PostMapping("/brackets")
    public ApiResponse<TaxConfigurationResponse> saveTaxBracket(@Valid @RequestBody TaxConfigurationRequest req) {
        TaxConfigurationResponse res = taxService.saveTaxBracket(req);
        return ApiResponse.success(res, "Tax bracket saved successfully");
    }

    @GetMapping("/ptkp")
    public ApiResponse<List<PtkpConfigurationResponse>> getPtkpList() {
        List<PtkpConfigurationResponse> list = taxService.getAllPtkp();
        return ApiResponse.success(list, "PTKP configurations retrieved");
    }

    @PostMapping("/calculate")
    public ApiResponse<TaxCalculationResponse> calculateTax(@Valid @RequestBody TaxCalculationRequest req) {
        TaxCalculationResponse res = taxService.calculateProgressiveTax(req);
        return ApiResponse.success(res, "Progressive tax calculated successfully");
    }
}
