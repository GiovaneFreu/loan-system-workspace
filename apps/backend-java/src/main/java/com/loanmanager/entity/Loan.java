package com.loanmanager.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

@Entity
@Table(name = "loan")
public class Loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "purchaseDate", nullable = false)
    private LocalDate purchaseDate;

    @NotNull
    @Size(max = 3)
    @Column(name = "currencyType", length = 3, nullable = false)
    private String currencyType;

    @NotNull
    @Column(name = "purchaseValue", nullable = false)
    private Double purchaseValue;

    @NotNull
    @Column(name = "conversionRate", nullable = false)
    private Double conversionRate;

    @NotNull
    @Column(name = "finalAmount", nullable = false)
    private Double finalAmount;

    @NotNull
    @Column(name = "interestRate", nullable = false)
    private Double interestRate;

    @NotNull
    @Column(name = "dueDate", nullable = false)
    private LocalDate dueDate;

    @NotNull
    @Column(name = "monthsCount", nullable = false)
    private Integer monthsCount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    // Constructors
    public Loan() {}

    public Loan(LocalDate purchaseDate, String currencyType, Double purchaseValue,
                Double conversionRate, Double finalAmount, Double interestRate,
                LocalDate dueDate, Integer monthsCount, Client client) {
        this.purchaseDate = purchaseDate;
        this.currencyType = currencyType;
        this.purchaseValue = purchaseValue;
        this.conversionRate = conversionRate;
        this.finalAmount = finalAmount;
        this.interestRate = interestRate;
        this.dueDate = dueDate;
        this.monthsCount = monthsCount;
        this.client = client;
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

    public Client getClient() {
        return client;
    }

    public void setClient(Client client) {
        this.client = client;
    }
}
