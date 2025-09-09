package com.loanmanager.repository;

import com.loanmanager.entity.Client;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
@Transactional
public class ClientRepository {
    
    @PersistenceContext(unitName = "loan-manager")
    private EntityManager entityManager;
    
    public Client save(Client client) {
        if (client.getId() == null) {
            entityManager.persist(client);
            return client;
        } else {
            return entityManager.merge(client);
        }
    }
    
    public Optional<Client> findById(Long id) {
        Client client = entityManager.find(Client.class, id);
        return Optional.ofNullable(client);
    }
    
    public List<Client> findAll() {
        return entityManager.createQuery("SELECT c FROM Client c", Client.class)
                .getResultList();
    }
    
    public void delete(Client client) {
        if (entityManager.contains(client)) {
            entityManager.remove(client);
        } else {
            entityManager.remove(entityManager.merge(client));
        }
    }
    
    public void deleteById(Long id) {
        findById(id).ifPresent(this::delete);
    }
    
    public boolean existsById(Long id) {
        return findById(id).isPresent();
    }
}