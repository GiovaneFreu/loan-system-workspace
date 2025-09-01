import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ClientInterface, CurrencyInerface, LoanInterface } from '@loan-system-workspace/interfaces';
import { CurrencyService, NotificationService } from '../../../../core/services';
import { formatDateForInput } from '../../../../helpers';
import { LoansService } from '../services';

interface FormData {
  purchaseDate: string;
  currency: CurrencyInerface | null;
  purchaseValue: number;
  dueDate: string;
  client : Pick<ClientInterface,'id' | 'name'> | null
}

@Component({
  selector: 'app-loan-form',
  standalone: false,
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
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

  formData: FormData = {
    purchaseDate: '',
    currency: null,
    purchaseValue: 0,
    dueDate: '',
    client: null
  };

  loading = false;
  errors: any = {};

  protected  get avaliableCurrencies(){
    return this.currenciesService.avaliableCurrencies
  }

  //FIXME - IMPLEMENTAR
  protected  get monthsDifference(){
    return 1
  }

  ngOnInit() {
    if (this.loan) {
      this.formData = {
        purchaseDate: formatDateForInput(this.loan.purchaseDate),
        currency: null,
        purchaseValue: this.loan.purchaseValue,
        dueDate: formatDateForInput(this.loan.dueDate),
        client: this.loan.client
      };
    }
  }

  protected  get isEditing(): boolean {
    return this.loan !== null;
  }

  protected get title(): string {
    return this.isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo';
  }

  onSubmit() {
    if (this.validateForm()) {
      this.loading = true;
      this.errors = {};

      const loanData:Omit<LoanInterface, 'id'> = {
        purchaseDate: new Date(this.formData.purchaseDate),
        currency: this.formData.currency as CurrencyInerface,
        purchaseValue: this.formData.purchaseValue,
        dueDate: new Date(this.formData.dueDate),
        client: this.formData.client as ClientInterface,
        //TODO - AJUSTAR FUNCAO,
        interestRate:1,
        conversionRate:1,
        finalAmount: 1,
        monthsCount:1
      };

      const request = this.isEditing
        ? this.loansService.update((this.loan as LoanInterface).id, loanData)
        : this.loansService.create(loanData);

      request.subscribe({
        next: () => {
          this.notificationService.showSuccess('Empréstimo ' + (this.isEditing ? 'alterado' : 'criado') + ' com sucesso!')
          this.loading = false;
          this.submitted.emit();
        },
        error: (error: { error: { message: 'string'; }; }) => {
          this.notificationService.showError('Erro ao' + (this.isEditing ? 'alterar' : 'criar')+ 'empréstimo.', (error.error?.message || 'Erro desconhecido'))
          this.loading = false;
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

    if (!this.formData.purchaseDate) {
      this.errors.purchaseDate = 'Data do empréstimo é obrigatória';
      isValid = false;
    }

    if (!this.formData.dueDate) {
      this.errors.dueDate = 'Data de vencimento é obrigatória';
      isValid = false;
    }

    if (this.formData.purchaseDate && this.formData.dueDate) {
      const purchaseDate = new Date(this.formData.purchaseDate);
      const dueDate = new Date(this.formData.dueDate);

      if (dueDate <= purchaseDate) {
        this.errors.dueDate = 'Data de vencimento deve ser posterior à data do empréstimo';
        isValid = false;
      }
    }

    if (this.formData.purchaseValue <= 0) {
      this.errors.purchaseValue = 'Valor deve ser maior que zero';
      isValid = false;
    }

    if (!this.formData.client?.id) {
      this.errors.clientId = 'Cliente é obrigatório';
      isValid = false;
    }

    return isValid;
  }
}
