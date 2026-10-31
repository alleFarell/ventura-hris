package com.ventura.hris.payroll.repository;

import com.ventura.hris.payroll.entity.TaxConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TaxConfigurationRepository extends JpaRepository<TaxConfiguration, UUID> {
    List<TaxConfiguration> findByTaxYearOrderByBracketOrderAsc(Integer taxYear);
    List<TaxConfiguration> findAllByOrderByTaxYearDescBracketOrderAsc();
    Optional<TaxConfiguration> findByTaxYearAndBracketOrder(Integer taxYear, Integer bracketOrder);
}
