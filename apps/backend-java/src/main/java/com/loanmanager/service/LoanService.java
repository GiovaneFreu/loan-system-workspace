package com.loanmanager.service;

import com.loanmanager.dto.LoanDto;
import com.loanmanager.entity.Loan;
import com.loanmanager.repository.LoanRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class LoanService {
    
    @Inject
    private LoanRepository loanRepository;
    
    @Inject
    private ClientService clientService;
    
    public Loan create(Loan loan) {
        // Ensure client exists
        if (loan.getClient() != null && loan.getClient().getId() != null) {
            loan.setClient(clientService.findById(loan.getClient().getId()));
        }
        return loanRepository.save(loan);
    }
    
    public List<Loan> findAll() {
        return loanRepository.findAll();
    }
    
    public List<LoanDto> findAllDto() {
        return loanRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    public Loan findById(Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Loan not found with id: " + id));
    }
    
    public List<Loan> findByClientId(Long clientId) {
        // Verify client exists
        clientService.findById(clientId);
        return loanRepository.findByClientId(clientId);
    }
    
    public List<LoanDto> findByClientIdDto(Long clientId) {
        // Verify client exists
        clientService.findById(clientId);
        return loanRepository.findByClientId(clientId).stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private LoanDto convertToDto(Loan loan) {
        return new LoanDto(
                loan.getId(),
                loan.getPurchaseDate(),
                loan.getCurrencyType(),
                loan.getPurchaseValue(),
                loan.getConversionRate(),
                loan.getFinalAmount(),
                loan.getInterestRate(),
                loan.getDueDate(),
                loan.getMonthsCount(),
                loan.getClient() != null ? loan.getClient().getId() : null,
                loan.getClient() != null ? loan.getClient().getName() : null
        );
    }
    
    public Loan update(Long id, Loan loanDetails) {
        Loan loan = findById(id);
        loan.setPurchaseDate(loanDetails.getPurchaseDate());
        loan.setCurrencyType(loanDetails.getCurrencyType());
        loan.setPurchaseValue(loanDetails.getPurchaseValue());
        loan.setConversionRate(loanDetails.getConversionRate());
        loan.setFinalAmount(loanDetails.getFinalAmount());
        loan.setInterestRate(loanDetails.getInterestRate());
        loan.setDueDate(loanDetails.getDueDate());
        loan.setMonthsCount(loanDetails.getMonthsCount());
        
        if (loanDetails.getClient() != null && loanDetails.getClient().getId() != null) {
            loan.setClient(clientService.findById(loanDetails.getClient().getId()));
        }
        
        return loanRepository.save(loan);
    }
    
    public void deleteById(Long id) {
        if (!loanRepository.existsById(id)) {
            throw new NotFoundException("Loan not found with id: " + id);
        }
        loanRepository.deleteById(id);
    }
}