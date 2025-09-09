package com.loanmanager.dto;

import java.time.LocalDate;

public class ClientDto {
    
    private Long id;
    private String name;
    private LocalDate birthDate;
    private String cpfCnpj;
    private Double monthlyIncome;
    
    public ClientDto() {}
    
    public ClientDto(Long id, String name, LocalDate birthDate, String cpfCnpj, Double monthlyIncome) {
        this.id = id;
        this.name = name;
        this.birthDate = birthDate;
        this.cpfCnpj = cpfCnpj;
        this.monthlyIncome = monthlyIncome;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public LocalDate getBirthDate() {
        return birthDate;
    }
    
    public void setBirthDate(LocalDate birthDate) {
        this.birthDate = birthDate;
    }
    
    public String getCpfCnpj() {
        return cpfCnpj;
    }
    
    public void setCpfCnpj(String cpfCnpj) {
        this.cpfCnpj = cpfCnpj;
    }
    
    public Double getMonthlyIncome() {
        return monthlyIncome;
    }
    
    public void setMonthlyIncome(Double monthlyIncome) {
        this.monthlyIncome = monthlyIncome;
    }
}