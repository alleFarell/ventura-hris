package com.ventura.hris.payroll.service;

import com.ventura.hris.common.exception.ResourceNotFoundException;
import com.ventura.hris.payroll.dto.*;
import com.ventura.hris.payroll.entity.PtkpConfiguration;
import com.ventura.hris.payroll.entity.TaxConfiguration;
import com.ventura.hris.payroll.repository.PtkpConfigurationRepository;
import com.ventura.hris.payroll.repository.TaxConfigurationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TaxConfigurationService {

    private final TaxConfigurationRepository taxRepository;
    private final PtkpConfigurationRepository ptkpRepository;

    public TaxConfigurationService(TaxConfigurationRepository taxRepository, PtkpConfigurationRepository ptkpRepository) {
        this.taxRepository = taxRepository;
        this.ptkpRepository = ptkpRepository;
    }

    @Transactional(readOnly = true)
    public List<TaxConfigurationResponse> getTaxBrackets(Integer year) {
        int targetYear = year != null ? year : 2026;
        List<TaxConfiguration> list = taxRepository.findByTaxYearOrderByBracketOrderAsc(targetYear);
        if (list.isEmpty()) {
            list = getDefaultBrackets(targetYear);
        }
        return list.stream().map(this::mapBracketToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PtkpConfigurationResponse> getAllPtkp() {
        List<PtkpConfiguration> list = ptkpRepository.findAll();
        if (list.isEmpty()) {
            return getDefaultPtkpList();
        }
        return list.stream()
                .map(p -> new PtkpConfigurationResponse(p.getId(), p.getTaxStatus(), p.getAnnualNonTaxableAmount(), p.getDescription()))
                .collect(Collectors.toList());
    }

    @Transactional
    public TaxConfigurationResponse saveTaxBracket(TaxConfigurationRequest req) {
        TaxConfiguration config = taxRepository.findByTaxYearAndBracketOrder(req.getTaxYear(), req.getBracketOrder())
                .orElseGet(() -> {
                    TaxConfiguration c = new TaxConfiguration();
                    c.setTaxYear(req.getTaxYear());
                    c.setBracketOrder(req.getBracketOrder());
                    return c;
                });

        config.setMinTaxableIncome(req.getMinTaxableIncome());
        config.setMaxTaxableIncome(req.getMaxTaxableIncome());
        config.setTaxRatePercent(req.getTaxRatePercent());

        TaxConfiguration saved = taxRepository.save(config);
        return mapBracketToResponse(saved);
    }

    @Transactional(readOnly = true)
    public TaxCalculationResponse calculateProgressiveTax(TaxCalculationRequest req) {
        BigDecimal gross = req.getAnnualGrossIncome() != null ? req.getAnnualGrossIncome() : BigDecimal.ZERO;
        String status = req.getTaxStatus() != null ? req.getTaxStatus().trim().toUpperCase() : "TK/0";
        Integer year = req.getTaxYear() != null ? req.getTaxYear() : 2026;

        BigDecimal ptkpAmount = ptkpRepository.findByTaxStatusIgnoreCase(status)
                .map(PtkpConfiguration::getAnnualNonTaxableAmount)
                .orElseGet(() -> getDefaultPtkp(status));

        BigDecimal taxableIncome = gross.subtract(ptkpAmount);
        if (taxableIncome.compareTo(BigDecimal.ZERO) < 0) {
            taxableIncome = BigDecimal.ZERO;
        }

        List<TaxConfiguration> brackets = taxRepository.findByTaxYearOrderByBracketOrderAsc(year);
        if (brackets.isEmpty()) {
            brackets = getDefaultBrackets(year);
        }

        BigDecimal totalTax = BigDecimal.ZERO;
        List<TaxBracketCalculationItem> breakdown = new ArrayList<>();

        for (TaxConfiguration b : brackets) {
            BigDecimal min = b.getMinTaxableIncome();
            BigDecimal max = b.getMaxTaxableIncome();
            BigDecimal rate = b.getTaxRatePercent();

            if (taxableIncome.compareTo(min) <= 0) {
                breakdown.add(new TaxBracketCalculationItem(b.getBracketOrder(), min, max, rate, BigDecimal.ZERO, BigDecimal.ZERO));
                continue;
            }

            BigDecimal upperLimit = (max != null && taxableIncome.compareTo(max) > 0) ? max : taxableIncome;
            BigDecimal taxableInBracket = upperLimit.subtract(min);
            BigDecimal taxInBracket = taxableInBracket.multiply(rate)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

            totalTax = totalTax.add(taxInBracket);
            breakdown.add(new TaxBracketCalculationItem(b.getBracketOrder(), min, max, rate, taxableInBracket, taxInBracket));
        }

        BigDecimal monthlyTax = totalTax.divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
        BigDecimal effectiveRate = gross.compareTo(BigDecimal.ZERO) > 0
                ? totalTax.multiply(BigDecimal.valueOf(100)).divide(gross, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        TaxCalculationResponse res = new TaxCalculationResponse();
        res.setAnnualGrossIncome(gross);
        res.setPtkpAmount(ptkpAmount);
        res.setAnnualTaxableIncome(taxableIncome);
        res.setAnnualTaxAmount(totalTax);
        res.setMonthlyTaxAmount(monthlyTax);
        res.setEffectiveTaxRatePercent(effectiveRate);
        res.setBreakdown(breakdown);
        return res;
    }

    private List<TaxConfiguration> getDefaultBrackets(int year) {
        return List.of(
                new TaxConfiguration(year, 1, BigDecimal.ZERO, new BigDecimal("60000000.00"), new BigDecimal("5.00")),
                new TaxConfiguration(year, 2, new BigDecimal("60000000.00"), new BigDecimal("250000000.00"), new BigDecimal("15.00")),
                new TaxConfiguration(year, 3, new BigDecimal("250000000.00"), new BigDecimal("500000000.00"), new BigDecimal("25.00")),
                new TaxConfiguration(year, 4, new BigDecimal("500000000.00"), new BigDecimal("5000000000.00"), new BigDecimal("30.00")),
                new TaxConfiguration(year, 5, new BigDecimal("5000000000.00"), null, new BigDecimal("35.00"))
        );
    }

    private BigDecimal getDefaultPtkp(String status) {
        if (status == null) return new BigDecimal("54000000.00");
        return switch (status.toUpperCase()) {
            case "TK/1", "K/0" -> new BigDecimal("58500000.00");
            case "TK/2", "K/1" -> new BigDecimal("63000000.00");
            case "TK/3", "K/2" -> new BigDecimal("67500000.00");
            case "K/3" -> new BigDecimal("72000000.00");
            default -> new BigDecimal("54000000.00");
        };
    }

    private List<PtkpConfigurationResponse> getDefaultPtkpList() {
        return List.of(
                new PtkpConfigurationResponse(UUID.randomUUID(), "TK/0", new BigDecimal("54000000.00"), "Single, no dependents"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "TK/1", new BigDecimal("58500000.00"), "Single, 1 dependent"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "TK/2", new BigDecimal("63000000.00"), "Single, 2 dependents"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "TK/3", new BigDecimal("67500000.00"), "Single, 3 dependents"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "K/0", new BigDecimal("58500000.00"), "Married, no dependents"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "K/1", new BigDecimal("63000000.00"), "Married, 1 dependent"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "K/2", new BigDecimal("67500000.00"), "Married, 2 dependents"),
                new PtkpConfigurationResponse(UUID.randomUUID(), "K/3", new BigDecimal("72000000.00"), "Married, 3 dependents")
        );
    }

    private TaxConfigurationResponse mapBracketToResponse(TaxConfiguration b) {
        TaxConfigurationResponse res = new TaxConfigurationResponse();
        res.setId(b.getId());
        res.setTaxYear(b.getTaxYear());
        res.setBracketOrder(b.getBracketOrder());
        res.setMinTaxableIncome(b.getMinTaxableIncome());
        res.setMaxTaxableIncome(b.getMaxTaxableIncome());
        res.setTaxRatePercent(b.getTaxRatePercent());
        res.setCreatedAt(b.getCreatedAt());
        res.setUpdatedAt(b.getUpdatedAt());
        return res;
    }
}
