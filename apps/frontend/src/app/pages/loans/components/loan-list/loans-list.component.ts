import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, OnDestroy, model, computed } from '@angular/core';
import { ClientInterface, CurrencyType, LoanInterface } from '@loan-system-workspace/interfaces';
import { forkJoin, Subscription } from 'rxjs';
import { LoansService } from '../services';
import { NotificationService } from '../../../../core/services';
import { ClientsService } from '../../../clients/services';

@Component({
  selector: 'app-loans-list',
  standalone: false,
  templateUrl: './loans-list.component.html',
  styleUrl: './loans-list.component.css'
})
export class LoansListComponent implements OnInit, OnDestroy {
  private readonly loansService = inject(LoansService);
  private readonly clientsService = inject(ClientsService);
  private readonly notificationService = inject(NotificationService);

  protected readonly title = 'Gerenciar Empréstimos';

  private loans: LoanInterface[] = [];
  private clients: ClientInterface[] = [];
  protected loading = false;
  protected showForm = false;
  protected editingLoan: LoanInterface | null = null;

  private subscription!:Subscription;

  ngOnInit() {
    this.loading = true;
    this.subscription = forkJoin([
      this.loadLoans(),
      this.loadClients()
    ]).subscribe({
      next:()=>this.loading = false,
      error:()=> this.loading = false
    })
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  protected readonly searchTerm = model('')
  protected readonly filteredLoans = computed(()=> {
    const searchTerm = this.searchTerm()
    if (!searchTerm) return this.loans
    return this.loans.filter(loan =>
      loan.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.currencyType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan?.id.toString().includes(searchTerm)
    );
  })

  protected loadLoans() {
    return this.loansService.findAll().subscribe({
      next: (loans) =>this.loans = loans,
      error: (error) => this.notificationService.showError('Erro ao carregar a lista de empréstimos', error?.message || 'Erro desconhecido')
    });
  }

  protected loadClients() {
    return this.clientsService.findAll().subscribe({
      next: (clients) => this.clients = clients,
      error: (error) => this.notificationService.showError('Erro ao carregar clientes', error?.message || 'Erro desconhecido')
    });
  }

  //TODO - redundante com clients, ver para usar herança
  protected openAddForm() {
    this.showForm = true;
    this.editingLoan = null;
  }

  //TODO - redundante com clients, ver para usar hernça
  protected openEditForm(loan: LoanInterface) {
    this.showForm = true;
    this.editingLoan = { ...loan };
  }

  //TODO - redundante com clients, ver para usar herança
  protected closeForm() {
    this.showForm = false;
    this.editingLoan = null;
  }

  //TODO - redundante com clients, ver para usar herança
  protected onFormSubmitted() {
    this.closeForm();
    this.loadLoans();
  }

  protected deleteLoan(loan: LoanInterface) {
    // TODO - melhorar para modal dialog
    if (confirm(`Tem certeza que deseja excluir o empréstimo #${loan.id}?`)) {
      this.subscription = this.loansService.deleteById(loan.id).subscribe({
        next: () => this.loadLoans(),
        error: (error) => this.notificationService.showError('Erro ao excluir cliente', error?.message || 'Erro desconhecido')
      })
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



  //FIXME - Implementar
  getConvertedValue(loan: LoanInterface): number {
    return 0
   // return this.calculationsService.convertCurrency(loan.purchaseValue, loan.currencyType, this.exchangeRates);
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
