import { Component, EventEmitter, Input, Output, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { LoanInterface, ClientInterface, CurrencyType } from '@loan-system-workspace/interfaces';

@Component({
  selector: 'app-loan-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './loan-form.component.html',
  styleUrl: './loan-form.component.css'
})
export class LoanFormComponent implements OnInit {
  @Input() loan: LoanInterface | null = null;
  @Input() clients: ClientInterface[] = [];
  @Input() exchangeRates: Record<string, number> = {};
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  formData = {
    purchaseDate: '',
    currencyType: CurrencyType.BRL,
    purchaseValue: 0,
    dueDate: '',
    clientId: 0
  };

  loading = false;
  errors: any = {};
  currencies = Object.values(CurrencyType);
  
  private http = inject(HttpClient);

  ngOnInit() {
    if (this.loan) {
      this.formData = {
        purchaseDate: this.formatDateForInput(this.loan.purchaseDate),
        currencyType: this.loan.currencyType,
        purchaseValue: this.loan.purchaseValue,
        dueDate: this.formatDateForInput(this.loan.dueDate),
        clientId: this.loan.client?.id || 0
      };
    }
  }

  get isEditing(): boolean {
    return this.loan !== null;
  }

  get title(): string {
    return this.isEditing ? 'Editar Empréstimo' : 'Novo Empréstimo';
  }

  get convertedValue(): number {
    if (this.formData.currencyType === CurrencyType.BRL) {
      return this.formData.purchaseValue;
    }
    
    const rate = this.exchangeRates[this.formData.currencyType] || 1;
    return this.formData.purchaseValue * rate;
  }

  get monthsDifference(): number {
    if (!this.formData.purchaseDate || !this.formData.dueDate) {
      return 0;
    }

    const start = new Date(this.formData.purchaseDate);
    const end = new Date(this.formData.dueDate);
    
    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();
    
    return months > 0 ? months : 0;
  }

  get finalAmount(): number {
    const months = this.monthsDifference;
    const valueInBRL = this.convertedValue;
    const interestRate = 5; // 5% a.a.
    const rate = interestRate / 100;
    
    if (months === 0) return valueInBRL;
    
    return valueInBRL * Math.pow(1 + rate / 12, months);
  }

  onSubmit() {
    if (this.validateForm()) {
      this.loading = true;
      this.errors = {};

      const loanData = {
        purchaseDate: new Date(this.formData.purchaseDate).toISOString(),
        currencyType: this.formData.currencyType,
        purchaseValue: this.formData.purchaseValue,
        dueDate: new Date(this.formData.dueDate).toISOString(),
        clientId: this.formData.clientId
      };

      const request = this.isEditing 
        ? this.http.put(`/api/loans/${this.loan!.id}`, loanData)
        : this.http.post('/api/loans', loanData);

      request.subscribe({
        next: () => {
          this.loading = false;
          this.submitted.emit();
        },
        error: (error) => {
          console.error('Error saving loan:', error);
          this.loading = false;
          
          if (error.error?.message) {
            this.errors.general = error.error.message;
          } else {
            this.errors.general = 'Erro ao salvar empréstimo. Tente novamente.';
          }
        }
      });
    }
  }

  onCancel() {
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

    if (!this.formData.clientId) {
      this.errors.clientId = 'Cliente é obrigatório';
      isValid = false;
    }

    return isValid;
  }

  private formatDateForInput(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  getCurrencySymbol(currency: CurrencyType): string {
    const symbols: Record<CurrencyType, string> = {
      [CurrencyType.BRL]: 'R$',
      [CurrencyType.USD]: '$',
      [CurrencyType.EUR]: '€',
      [CurrencyType.GBP]: '£',
      [CurrencyType.JPY]: '¥',
      [CurrencyType.CHF]: 'CHF',
      [CurrencyType.CAD]: 'C$',
      [CurrencyType.AUD]: 'A$',
      [CurrencyType.CNY]: '¥',
      [CurrencyType.ARS]: '$'
    };
    
    return symbols[currency] || currency;
  }
}