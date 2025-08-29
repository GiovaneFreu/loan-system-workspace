import { Component, OnInit, inject, OnDestroy, model, computed } from '@angular/core';
import { ClientInterface, CurrencyType, LoanInterface } from '@loan-system-workspace/interfaces';
import { forkJoin, Subscription, map, catchError } from 'rxjs';
import { LoansService } from '../services';
import { ClientsService } from '../../../clients/services';
import { NotificationService } from '../../../../core/services';

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
  protected clients: ClientInterface[] = [];
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
    return this.loansService.findAll().pipe(
      map(loans =>this.loans = loans),
      catchError((error)=> {
        this.notificationService.showError('Erro ao carregar a lista de empréstimos', error?.message || 'Erro desconhecido')
          throw  error;
        })
    );
  }

  protected loadClients() {
    return this.clientsService.findAll().pipe(
      map(clients => this.clients = clients),
      catchError(error => {
        this.notificationService.showError('Erro ao carregar clientes', error?.message || 'Erro desconhecido');
        throw error;
      })
    )
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

  //FIXME - Implementar
  getConvertedValue(loan: LoanInterface): number {
    return 0
   // return this.calculationsService.convertCurrency(loan.purchaseValue, loan.currencyType, this.exchangeRates);
  }

  //FIXME - Implementar
  calculateMonthsDifference(startDate: Date | string, endDate: Date | string): number {
    return 0
    //return this.calculationsService.calculateMonthsDifference(startDate, endDate);
  }

  //FIXME - Implementar
  calculateFinalAmount(loan: LoanInterface, interestRate = 5): number {
    return 0
    // const months = this.calculateMonthsDifference(loan.purchaseDate, loan.dueDate);
    // const conversionRate = this.exchangeRates[loan.currencyType] || 1;
    // return this.calculationsService.calculateFinalAmount(loan.purchaseValue, conversionRate, months, interestRate);
  }

  // FIXME - Implementar
  getCurrencySymbol(currency: CurrencyType): string {
    return 'R$'
    //return this.calculationsService.getCurrencySymbol(currency);
  }
}
