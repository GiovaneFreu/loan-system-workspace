import { Component, EventEmitter, inject, Input, OnInit, Output, Signal, signal } from '@angular/core';
import { ClientInterface, CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';
import { CurrencyService, NotificationService } from '../../../../core/services';
import { formatDateForInput } from '../../../../helpers';
import { LoansService } from '../../services';
import { differenceInMonths } from 'date-fns';
import { LoanFormState } from './loan-form.state';

@Component({
  selector: 'app-loan-form',
  standalone: false,
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css',
  providers: [LoanFormState]
})
export class LoanFormComponent implements OnInit {
  private readonly currenciesService = inject(CurrencyService)
  private readonly loansService = inject(LoansService);
  private readonly notificationService = inject(NotificationService);

  @Input() loan: LoanInterface | null = null;
  @Input() clients: ClientInterface[] = [];
  @Input() exchangeRates: Record<string, number> = {};
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected readonly form = inject(LoanFormState).form

  protected loadingSubmission = false;
  protected loadingQuote = false;
  protected errors: any = {};

  protected currencyQuote = 0

  protected  get avaliableCurrencies(){
    return this.currenciesService.avaliableCurrencies
  }

  ngOnInit() {
    if (this.loan) {
        const { purchaseDate, dueDate, purchaseValue, currency, client } = this.loan;
        this.form.patchValue({
          dueDate: formatDateForInput(dueDate),
          purchaseDate: formatDateForInput(purchaseDate),
          purchaseValue,
          currency,
          client
        })
      }
    }

  protected getCurrencyQuote(){
    this.loadingQuote = true
  }

  protected  get isEditing(): boolean {
    return this.loan !== null;
  }

  protected get title(): string {
    return this.isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo';
  }

  onSubmit() {
    if (this.validateForm()) {
      this.loadingSubmission = true;
      this.errors = {};

      const value = this.form.value

      const loanData:Omit<LoanInterface, 'id'> = {
        purchaseDate: new Date(value.purchaseDate!),
        currency: value.currency as CurrencyInterface,
        purchaseValue: value.purchaseValue!,
        dueDate: new Date(value.dueDate!),
        client: value.client as ClientInterface,
      };

      const request = this.isEditing
        ? this.loansService.update((this.loan as LoanInterface).id, loanData)
        : this.loansService.create(loanData);

      request.subscribe({
        next: () => {
          this.notificationService.showSuccess('Empréstimo ' + (this.isEditing ? 'alterado' : 'criado') + ' com sucesso!')
          this.loadingSubmission = false;
          this.submitted.emit();
        },
        error: (error: { error: { message: 'string'; }; }) => {
          this.notificationService.showError('Erro ao' + (this.isEditing ? 'alterar' : 'criar')+ 'empréstimo.', (error.error?.message || 'Erro desconhecido'))
          this.loadingSubmission = false;
        }
      });
    }
  }

  protected onCancel() {
    this.cancelled.emit();
  }

  private validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.form.value.purchaseDate) {
      this.errors.purchaseDate = 'Data do empréstimo é obrigatória';
      isValid = false;
    }

    if (!this.form.value.dueDate) {
      this.errors.dueDate = 'Data de vencimento é obrigatória';
      isValid = false;
    }

    if (this.form.value.purchaseDate && this.form.value.dueDate) {
      const purchaseDate = new Date(this.form.value.purchaseDate);
      const dueDate = new Date(this.form.value.dueDate);

      if (dueDate <= purchaseDate) {
        this.errors.dueDate = 'Data de vencimento deve ser posterior à data do empréstimo';
        isValid = false;
      }
    }

    if (!this.form.value.purchaseValue || this.form.value.purchaseValue <= 0) {
      this.errors.purchaseValue = 'Valor deve ser maior que zero';
      isValid = false;
    }

    if (!this.form.value.client?.id) {
      this.errors.clientId = 'Cliente é obrigatório';
      isValid = false;
    }

    return isValid;
  }

  protected  monthsDifference(){
    const startDate = this.form.value.purchaseDate
    if(!startDate) return 0
    const endDate = this.form.value.dueDate
    if(!endDate) return 0
    const months = differenceInMonths(new Date(endDate), new Date(startDate));
    return isNaN(months) ? 0 : months;
  }
}
