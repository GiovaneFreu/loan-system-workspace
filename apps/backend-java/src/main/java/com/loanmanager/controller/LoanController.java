package com.loanmanager.controller;

import com.loanmanager.dto.LoanDto;
import com.loanmanager.entity.Loan;
import com.loanmanager.service.LoanService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/loans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LoanController {
    
    @Inject
    private LoanService loanService;
    
    @POST
    public Response create(Loan loan) {
        Loan createdLoan = loanService.create(loan);
        return Response.status(Response.Status.CREATED).entity(createdLoan).build();
    }
    
    @GET
    public List<LoanDto> findAll() {
        return loanService.findAllDto();
    }
    
    @GET
    @Path("/{id}")
    public Loan findById(@PathParam("id") Long id) {
        return loanService.findById(id);
    }
    
    @GET
    @Path("/client/{clientId}")
    public List<LoanDto> findByClientId(@PathParam("clientId") Long clientId) {
        return loanService.findByClientIdDto(clientId);
    }
    
    @PUT
    @Path("/{id}")
    public Loan update(@PathParam("id") Long id, Loan loan) {
        return loanService.update(id, loan);
    }
    
    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        loanService.deleteById(id);
        return Response.noContent().build();
    }
}