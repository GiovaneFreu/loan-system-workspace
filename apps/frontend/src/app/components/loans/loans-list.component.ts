import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ClientInterface, CurrencyType, LoanInterface } from '@loan-system-workspace/interfaces';
import { LoanCalculationsService } from '../../services/loan-calculations.service';
import { LoanFormComponent } from './loan-form.component';

@Component({
  selector: 'app-loans-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LoanFormComponent],
  templateUrl: './loans-list.component.html',
  styleUrl: './loans-list.component.css'
})
export class LoansListComponent implements OnInit {
  loans: LoanInterface[] = [];
  filteredLoans: LoanInterface[] = [];
  clients: ClientInterface[] = [];
  exchangeRates: Record<string, number> = {};
  loading = false;
  searchTerm = '';
  showForm = false;
  editingLoan: LoanInterface | null = null;

  private http = inject(HttpClient);
  private calculationsService = inject(LoanCalculationsService);

  ngOnInit() {
    this.loadLoans();
    this.loadClients();
    this.loadExchangeRates();
  }

  loadLoans() {
    this.loading = true;
    this.http.get<LoanInterface[]>('/api/loans').subscribe({
      next: (loans) => {
        this.loans = loans;
        this.filteredLoans = loans;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading loans:', error);
        this.loading = false;
      }
    });
  }

  loadClients() {
    this.http.get<ClientInterface[]>('/api/clients').subscribe({
      next: (clients) => {
        this.clients = clients;
      },
      error: (error) => console.error('Error loading clients:', error)
    });
  }

  loadExchangeRates() {
    this.http.get<Record<string, number>>('/api/loans/exchange-rates').subscribe({
      next: (rates) => {
        this.exchangeRates = rates;
      },
      error: (error) => console.error('Error loading exchange rates:', error)
    });
  }

  filterLoans() {
    if (!this.searchTerm) {
      this.filteredLoans = this.loans;
    } else {
      this.filteredLoans = this.loans.filter(loan =>
        loan.client?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loan.currencyType.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        loan.id.toString().includes(this.searchTerm)
      );
    }
  }

  openAddForm() {
    this.showForm = true;
    this.editingLoan = null;
  }

  openEditForm(loan: LoanInterface) {
    this.showForm = true;
    this.editingLoan = { ...loan };
  }

  closeForm() {
    this.showForm = false;
    this.editingLoan = null;
  }

  onFormSubmitted() {
    this.closeForm();
    this.loadLoans();
  }

  deleteLoan(loan: LoanInterface) {
    if (confirm(`Tem certeza que deseja excluir o empréstimo #${loan.id}?`)) {
      this.http.delete(`/api/loans/${loan.id}`).subscribe({
        next: () => {
          this.loadLoans();
        },
        error: (error) => {
          console.error('Error deleting loan:', error);
          alert('Erro ao excluir empréstimo');
        }
      });
    }
  }

  calculateLoanDetails(loan: LoanInterface) {
    const summary = this.calculationsService.calculateLoanSummary(loan, this.exchangeRates);

    // Show detailed calculation in console for now
    console.log('Loan calculation summary:', summary);

    // TODO: Show details in a modal
    alert(`Resumo do Empréstimo #${loan.id}:\n` +
          `Valor original: ${this.calculationsService.getCurrencySymbol(loan.currencyType)} ${loan.purchaseValue.toFixed(2)}\n` +
          `Valor em R$: ${this.calculationsService.formatCurrency(summary.valueInBRL)}\n` +
          `Prazo: ${summary.months} meses\n` +
          `Juros: ${summary.interestRate}% a.a.\n` +
          `Valor final: ${this.calculationsService.formatCurrency(summary.finalAmount)}\n` +
          `Total de juros: ${this.calculationsService.formatCurrency(summary.totalInterest)}`);
  }

  formatCurrency(value: number, currency: CurrencyType = CurrencyType.BRL): string {
    return this.calculationsService.formatCurrency(value, currency);
  }

  formatDate(dateString: string | Date): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  getConvertedValue(loan: LoanInterface): number {
    return this.calculationsService.convertCurrency(loan.purchaseValue, loan.currencyType, this.exchangeRates);
  }

  calculateMonthsDifference(startDate: Date | string, endDate: Date | string): number {
    return this.calculationsService.calculateMonthsDifference(startDate, endDate);
  }

  calculateFinalAmount(loan: LoanInterface, interestRate = 5): number {
    const months = this.calculateMonthsDifference(loan.purchaseDate, loan.dueDate);
    const conversionRate = this.exchangeRates[loan.currencyType] || 1;
    return this.calculationsService.calculateFinalAmount(loan.purchaseValue, conversionRate, months, interestRate);
  }

  getCurrencySymbol(currency: CurrencyType): string {
    return this.calculationsService.getCurrencySymbol(currency);
  }
}
