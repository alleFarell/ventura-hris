package com.ventura.hris.payroll.dto;

import java.math.BigDecimal;

public class TaxBracketCalculationItem {

    private Integer bracketOrder;
    private BigDecimal minTaxableIncome;
    private BigDecimal maxTaxableIncome;
    private BigDecimal taxRatePercent;
    private BigDecimal taxableAmountInBracket;
    private BigDecimal taxAmountInBracket;

    public TaxBracketCalculationItem() {}

    public TaxBracketCalculationItem(Integer bracketOrder, BigDecimal minTaxableIncome, BigDecimal maxTaxableIncome,
                                     BigDecimal taxRatePercent, BigDecimal taxableAmountInBracket, BigDecimal taxAmountInBracket) {
        this.bracketOrder = bracketOrder;
        this.minTaxableIncome = minTaxableIncome;
        this.maxTaxableIncome = maxTaxableIncome;
        this.taxRatePercent = taxRatePercent;
        this.taxableAmountInBracket = taxableAmountInBracket;
        this.taxAmountInBracket = taxAmountInBracket;
    }

    public Integer getBracketOrder() { return bracketOrder; }
    public void setBracketOrder(Integer bracketOrder) { this.bracketOrder = bracketOrder; }

    public BigDecimal getMinTaxableIncome() { return minTaxableIncome; }
    public void setMinTaxableIncome(BigDecimal minTaxableIncome) { this.minTaxableIncome = minTaxableIncome; }

    public BigDecimal getMaxTaxableIncome() { return maxTaxableIncome; }
    public void setMaxTaxableIncome(BigDecimal maxTaxableIncome) { this.maxTaxableIncome = maxTaxableIncome; }

    public BigDecimal getTaxRatePercent() { return taxRatePercent; }
    public void setTaxRatePercent(BigDecimal taxRatePercent) { this.taxRatePercent = taxRatePercent; }

    public BigDecimal getTaxableAmountInBracket() { return taxableAmountInBracket; }
    public void setTaxableAmountInBracket(BigDecimal taxableAmountInBracket) { this.taxableAmountInBracket = taxableAmountInBracket; }

    public BigDecimal getTaxAmountInBracket() { return taxAmountInBracket; }
    public void setTaxAmountInBracket(BigDecimal taxAmountInBracket) { this.taxAmountInBracket = taxAmountInBracket; }
}
