import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { ClientInterface, CurrencyInterface, LoanInterface } from '@loan-system-workspace/interfaces';
import { CurrencyService, NotificationService } from '../../../../core/services';
import { formatDateForInput } from '../../../../helpers';
import { LoansService } from '../../services';
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

  protected  get avaliableCurrencies(){
    return this.currenciesService.avaliableCurrencies
  }

  protected get conversionRate(){
    return this.form.controls.conversionRate.value ?? 0
  }

  protected get monthsCount() {
    return this.form.controls.monthsCount.value
  }

  protected get totalValue() {
    return this.form.controls.finalAmount.value
  }

  protected get brlValue() {
    return (this.form.controls.finalAmount.value ?? 0) * this.conversionRate
  }

  ngOnInit() {
    if (this.loan) {
        this.form.patchValue({
          currencyId: this.loan.currency.symbol,
          purchaseDate: formatDateForInput(this.loan.purchaseDate),
          purchaseValue: this.loan.purchaseValue,
          interestRate: this.loan.interestRate,
          monthsCount: this.loan.monthsCount,
          finalAmount: this.loan.finalAmount,
          conversionRate: this.loan.conversionRate,
          dueDate: formatDateForInput(this.loan.dueDate),
          clientId: this.loan.client.id,
        });
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

  protected save() {
    if(this.form.invalid) return

      this.loadingSubmission = true;

      const value = this.form.getRawValue();
      if (!value.purchaseDate || !value.dueDate || !value.currencyId || value.clientId === null
        || value.conversionRate === null || value.purchaseValue === null || value.interestRate === null
        || value.monthsCount === null || value.finalAmount === null) {
        this.notificationService.showError('Erro ao salvar empréstimo.', 'Preencha todos os campos obrigatórios.');
        this.loadingSubmission = false;
        return;
      }

      const loanData:Omit<LoanInterface, 'id'> = {
        purchaseDate: new Date(value.purchaseDate),
        currency: {
          symbol: value.currencyId
        }  as CurrencyInterface,
        purchaseValue: value.purchaseValue,
        interestRate: value.interestRate,
        monthsCount:  value.monthsCount,
        finalAmount: value.finalAmount,
        conversionRate: value.conversionRate,
        dueDate: new Date(value.dueDate),
        client: {
          id: value.clientId
        } as ClientInterface
      };

      const request = this.loan
        ? this.loansService.update(this.loan.id, loanData)
        : this.loansService.create(loanData);

      request.subscribe({
        next: () => {
          this.notificationService.showSuccess('Empréstimo ' + (this.isEditing ? 'alterado' : 'criado') + ' com sucesso!')
          this.loadingSubmission = false;
          this.submitted.emit();
        },
        error: (error: unknown) => {
          const message = error && typeof error === 'object' && 'error' in error
            && error.error && typeof error.error === 'object' && 'message' in error.error
            ? String(error.error.message)
            : 'Erro desconhecido';
          this.notificationService.showError('Erro ao' + (this.isEditing ? 'alterar' : 'criar')+ 'empréstimo.', message)
          this.loadingSubmission = false;
        }
      });
  }

  protected onCancel() {
    this.cancelled.emit();
  }


}
