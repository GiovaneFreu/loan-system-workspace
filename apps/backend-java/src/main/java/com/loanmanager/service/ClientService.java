package com.loanmanager.service;

import com.loanmanager.dto.ClientDto;
import com.loanmanager.entity.Client;
import com.loanmanager.repository.ClientRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.stream.Collectors;

@ApplicationScoped
public class ClientService {
    
    @Inject
    private ClientRepository clientRepository;
    
    public Client create(Client client) {
        return clientRepository.save(client);
    }
    
    public List<Client> findAll() {
        return clientRepository.findAll();
    }
    
    public List<ClientDto> findAllDto() {
        return clientRepository.findAll().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    
    private ClientDto convertToDto(Client client) {
        return new ClientDto(
                client.getId(),
                client.getName(),
                client.getBirthDate(),
                client.getCpfCnpj(),
                client.getMonthlyIncome()
        );
    }
    
    public Client findById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Client not found with id: " + id));
    }
    
    public Client update(Long id, Client clientDetails) {
        Client client = findById(id);
        client.setName(clientDetails.getName());
        client.setBirthDate(clientDetails.getBirthDate());
        client.setCpfCnpj(clientDetails.getCpfCnpj());
        client.setMonthlyIncome(clientDetails.getMonthlyIncome());
        return clientRepository.save(client);
    }
    
    public void deleteById(Long id) {
        if (!clientRepository.existsById(id)) {
            throw new NotFoundException("Client not found with id: " + id);
        }
        clientRepository.deleteById(id);
    }
}