package com.loanmanager.config;

import com.loanmanager.controller.ClientController;
import com.loanmanager.controller.LoanController;
import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;

import java.util.Set;

@ApplicationPath("/api")
public class JaxRsConfiguration extends Application {
    
    @Override
    public Set<Class<?>> getClasses() {
        return Set.of(
            ClientController.class,
            LoanController.class
        );
    }
}