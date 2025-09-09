package com.loanmanager.dto;

import java.time.LocalDate;

public class LoanDto {
    
    private Long id;
    private LocalDate purchaseDate;
    private String currencyType;
    private Double purchaseValue;
    private Double conversionRate;
    private Double finalAmount;
    private Double interestRate;
    private LocalDate dueDate;
    private Integer monthsCount;
    private Long clientId;
    private String clientName;
    
    public LoanDto() {}
    
    public LoanDto(Long id, LocalDate purchaseDate, String currencyType, Double purchaseValue,
                   Double conversionRate, Double finalAmount, Double interestRate,
                   LocalDate dueDate, Integer monthsCount, Long clientId, String clientName) {
        this.id = id;
        this.purchaseDate = purchaseDate;
        this.currencyType = currencyType;
        this.purchaseValue = purchaseValue;
        this.conversionRate = conversionRate;
        this.finalAmount = finalAmount;
        this.interestRate = interestRate;
        this.dueDate = dueDate;
        this.monthsCount = monthsCount;
        this.clientId = clientId;
        this.clientName = clientName;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }
    
    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
    
    public String getCurrencyType() {
        return currencyType;
    }
    
    public void setCurrencyType(String currencyType) {
        this.currencyType = currencyType;
    }
    
    public Double getPurchaseValue() {
        return purchaseValue;
    }
    
    public void setPurchaseValue(Double purchaseValue) {
        this.purchaseValue = purchaseValue;
    }
    
    public Double getConversionRate() {
        return conversionRate;
    }
    
    public void setConversionRate(Double conversionRate) {
        this.conversionRate = conversionRate;
    }
    
    public Double getFinalAmount() {
        return finalAmount;
    }
    
    public void setFinalAmount(Double finalAmount) {
        this.finalAmount = finalAmount;
    }
    
    public Double getInterestRate() {
        return interestRate;
    }
    
    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }
    
    public LocalDate getDueDate() {
        return dueDate;
    }
    
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }
    
    public Integer getMonthsCount() {
        return monthsCount;
    }
    
    public void setMonthsCount(Integer monthsCount) {
        this.monthsCount = monthsCount;
    }
    
    public Long getClientId() {
        return clientId;
    }
    
    public void setClientId(Long clientId) {
        this.clientId = clientId;
    }
    
    public String getClientName() {
        return clientName;
    }
    
    public void setClientName(String clientName) {
        this.clientName = clientName;
    }
}