package com.loanmanager.interfaces;

import java.time.LocalDate;

public interface LoanInterface {
    Long getId();
    void setId(Long id);
    
    LocalDate getPurchaseDate();
    void setPurchaseDate(LocalDate purchaseDate);
    
    String getCurrencyType();
    void setCurrencyType(String currencyType);
    
    Double getPurchaseValue();
    void setPurchaseValue(Double purchaseValue);
    
    Double getConversionRate();
    void setConversionRate(Double conversionRate);
    
    Double getFinalAmount();
    void setFinalAmount(Double finalAmount);
    
    Double getInterestRate();
    void setInterestRate(Double interestRate);
    
    LocalDate getDueDate();
    void setDueDate(LocalDate dueDate);
    
    Integer getMonthsCount();
    void setMonthsCount(Integer monthsCount);
    
    ClientInterface getClient();
    void setClient(ClientInterface client);
}