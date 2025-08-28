import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ClientInterface, LoanInterface } from '@loan-system-workspace/interfaces';
import { ClientsListComponent } from './components/clients/clients-list.component';
import { LoansListComponent } from './components/loans/loans-list.component';
import { ExchangeRatesComponent } from './components/exchange-rates/exchange-rates.component';
import { NotificationsComponent } from './components/shared/notifications.component';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    ClientsListComponent,
    LoansListComponent,
    ExchangeRatesComponent,
    NotificationsComponent
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  protected title = 'LoanSystem';
  protected activeSection: string = 'dashboard';
  protected totalClients: number = 0;
  protected totalLoans: number = 0;
  protected totalValue: number = 0;

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadDashboardData();
  }

  getCurrentPageTitle(): string {
    switch (this.activeSection) {
      case 'clients': return 'Gerenciar Clientes';
      case 'loans': return 'Gerenciar Empréstimos';
      case 'rates': return 'Cotações de Moedas';
      default: return 'Dashboard';
    }
  }

  getAddButtonText(): string {
    switch (this.activeSection) {
      case 'clients': return 'Cliente';
      case 'loans': return 'Empréstimo';
      default: return '';
    }
  }

  openAddModal() {
    // TODO: Implementar modal de adição
    console.log('Opening add modal for:', this.activeSection);
  }

  private loadDashboardData() {
    // Load clients
    this.http.get<ClientInterface[]>('/api/clients').subscribe({
      next: (clients) => {
        this.totalClients = clients.length;
      },
      error: (error) => console.error('Error loading clients:', error)
    });

    // Load loans
    this.http.get<LoanInterface[]>('/api/loans').subscribe({
      next: (loans) => {
        this.totalLoans = loans.length;
        this.totalValue = loans.reduce((sum, loan) => sum + loan.purchaseValue, 0);
      },
      error: (error) => console.error('Error loading loans:', error)
    });
  }
}
