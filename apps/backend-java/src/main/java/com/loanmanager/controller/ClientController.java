package com.loanmanager.controller;

import com.loanmanager.dto.ClientDto;
import com.loanmanager.entity.Client;
import com.loanmanager.service.ClientService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/clients")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ClientController {
    
    @Inject
    private ClientService clientService;
    
    @POST
    public Response create(Client client) {
        Client createdClient = clientService.create(client);
        return Response.status(Response.Status.CREATED).entity(createdClient).build();
    }
    
    @GET
    public List<ClientDto> findAll() {
        return clientService.findAllDto();
    }
    
    @GET
    @Path("/{id}")
    public Client findById(@PathParam("id") Long id) {
        return clientService.findById(id);
    }
    
    @PUT
    @Path("/{id}")
    public Client update(@PathParam("id") Long id, Client client) {
        return clientService.update(id, client);
    }
    
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        clientService.deleteById(id);
        return Response.noContent().build();
    }
}