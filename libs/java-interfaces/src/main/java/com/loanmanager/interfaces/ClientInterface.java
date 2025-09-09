package com.loanmanager.interfaces;

import java.time.LocalDate;
import java.util.List;

public interface ClientInterface {
    Long getId();
    void setId(Long id);
    
    String getName();
    void setName(String name);
    
    LocalDate getBirthDate();
    void setBirthDate(LocalDate birthDate);
    
    String getCpfCnpj();
    void setCpfCnpj(String cpfCnpj);
    
    Double getMonthlyIncome();
    void setMonthlyIncome(Double monthlyIncome);
    
    List<? extends LoanInterface> getLoans();
}