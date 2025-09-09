package com.loanmanager.repository;

import com.loanmanager.entity.Loan;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
@Transactional
public class LoanRepository {
    
    @PersistenceContext(unitName = "loan-manager")
    private EntityManager entityManager;
    
    public Loan save(Loan loan) {
        if (loan.getId() == null) {
            entityManager.persist(loan);
            return loan;
        } else {
            return entityManager.merge(loan);
        }
    }
    
    public Optional<Loan> findById(Long id) {
        Loan loan = entityManager.find(Loan.class, id);
        return Optional.ofNullable(loan);
    }
    
    public List<Loan> findAll() {
        return entityManager.createQuery(
                "SELECT l FROM Loan l LEFT JOIN FETCH l.client", Loan.class)
                .getResultList();
    }
    
    public List<Loan> findByClientId(Long clientId) {
        return entityManager.createQuery(
                "SELECT l FROM Loan l WHERE l.client.id = :clientId", Loan.class)
                .setParameter("clientId", clientId)
                .getResultList();
    }
    
    public void delete(Loan loan) {
        if (entityManager.contains(loan)) {
            entityManager.remove(loan);
        } else {
            entityManager.remove(entityManager.merge(loan));
        }
    }
    
    public void deleteById(Long id) {
        findById(id).ifPresent(this::delete);
    }
    
    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }
}