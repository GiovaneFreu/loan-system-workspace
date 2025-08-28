import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { LoanInterface } from '@loan-system-workspace/interfaces';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent  {
  private readonly http = inject(HttpClient);

  protected readonly title = 'Dashboard';

  protected totalClients = 0;
  protected totalLoans = 0;
  protected totalValue = 0;

  private loadDashboardData() {
    this.http.get<LoanInterface[]>('/api/loans').subscribe({
      next: (loans) => {
        this.totalLoans = loans.length;
        this.totalValue = loans.reduce((sum, loan) => sum + loan.purchaseValue, 0);
      },
      error: (error) => console.error('Error loading loans:', error)
    });

  }

}
