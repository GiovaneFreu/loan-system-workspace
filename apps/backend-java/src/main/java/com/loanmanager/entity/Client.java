package com.loanmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "client")
public class Client {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotNull
    @Size(max = 200)
    @Column(name = "name", length = 200, nullable = false)
    private String name;
    
    @NotNull
    @Column(name = "birthDate", nullable = false)
    private LocalDate birthDate;
    
    @NotNull
    @Size(max = 14)
    @Column(name = "cpf_cnpj", length = 14, nullable = false)
    private String cpfCnpj;
    
    @NotNull
    @Column(name = "monthlyIncome", nullable = false)
    private Double monthlyIncome;
    
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Loan> loans;
    
    // Constructors
    public Client() {}
    
    public Client(String name, LocalDate birthDate, String cpfCnpj, Double monthlyIncome) {
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
    
    public List<Loan> getLoans() {
        return loans;
    }
    
    public void setLoans(List<Loan> loans) {
        this.loans = loans;
    }
}