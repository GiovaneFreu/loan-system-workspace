import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ClientInterface,CurrencyInterface } from '@loan-system-workspace/interfaces';
import { Subscription } from 'rxjs';
import { CurrencyService, NotificationService } from '../../../../core/services';
import { differenceInMonths } from 'date-fns';

@Injectable()
export class LoanFormState implements OnDestroy{
  private readonly currencyService = inject(CurrencyService);
  private readonly notificationService = inject(NotificationService);

  private readonly fb = inject(FormBuilder);
  private readonly subscription:Subscription[] = []

  readonly loadingConversionRate = signal(false)
  private conversionRateSubscription!:Subscription

  readonly form= this.fb.group({
    purchaseDate: this.fb.control('', Validators.required),
    currency: this.fb.control<CurrencyInterface | null>(null, Validators.required),
    purchaseValue: this.fb.control(0, Validators.required),
    interestRate: this.fb.control(0, Validators.required),
    dueDate: this.fb.control('', Validators.required),
    client: this.fb.control<ClientInterface | null>(null, Validators.required),
    conversionRate: this.fb.control<number |null>(null, Validators.required),
    finalAmount: this.fb.control<number>(0, Validators.required),
    monthsCount: this.fb.control(0, Validators.required),
  })

  constructor() {
   const s1=   this.form.controls.currency.valueChanges.subscribe(()=> this.loadConversionRate());
   const s2 =   this.form.controls.purchaseValue.valueChanges.subscribe(()=> this.calcValues());
   const s3 =   this.form.controls.interestRate.valueChanges.subscribe(()=> this.calcValues());
   const s4 =   this.form.controls.dueDate.valueChanges.subscribe(()=> this.calcValues());
   const s5 =   this.form.controls.purchaseDate.valueChanges.subscribe(()=> this.loadConversionRate());
   this.subscription = [s1,s2,s3,s4,s5]
  }

  ngOnDestroy(): void {
    this.conversionRateSubscription?.unsubscribe();
    for (const s of this.subscription) {
      s.unsubscribe();
    }
  }

  private loadConversionRate() {
    const currency = this.form.controls.currency.value
    const purchaseDate = this.form.controls.purchaseDate.value
    if (!currency || !purchaseDate) return;
    this.loadingConversionRate.set(true)
    this.conversionRateSubscription?.unsubscribe();
    this.conversionRateSubscription = this.currencyService.getCurrencyQuote(currency,purchaseDate).subscribe({
      next:(value) => {
        if (!value) {
          this.notificationService.showWarning('Cotação não disponível para a data selecionada.', 'Deve ser selecionado um dia útil.')
          this.form.controls.conversionRate.patchValue(null)
          this.calcValues()
          this.loadingConversionRate.set(false)
          return;
        }
        this.form.controls.conversionRate.patchValue(value.cotacaoCompra)
        this.calcValues()
        this.loadingConversionRate.set(false)
      },
      error:(error)=>{
        this.notificationService.showError('Não foi possível buscar a cotação.', error?.message ??'Erro desconhecido')
        this.loadingConversionRate.set(false)
      }
    })
  }

  private  setMonthsDiference(){
    const startDate = this.form.value.purchaseDate
    if(!startDate) return 0
    const endDate = this.form.value.dueDate
    if(!endDate) return 0
    const months = differenceInMonths(new Date(endDate), new Date(startDate));
    return isNaN(months) ? 0 : months;
  }

  private calcValues() {
    // private
  }

  // private validateForm(): boolean {
  //   let isValid = true;
  //
  //   if (!this.form.value.purchaseDate) {
  //     this.errors.purchaseDate = 'Data do empréstimo é obrigatória';
  //     isValid = false;
  //   }
  //
  //   if (!this.form.value.dueDate) {
  //     this.errors.dueDate = 'Data de vencimento é obrigatória';
  //     isValid = false;
  //   }
  //
  //   if (this.form.value.purchaseDate && this.form.value.dueDate) {
  //     const purchaseDate = new Date(this.form.value.purchaseDate);
  //     const dueDate = new Date(this.form.value.dueDate);
  //
  //     if (dueDate <= purchaseDate) {
  //       this.errors.dueDate = 'Data de vencimento deve ser posterior à data do empréstimo';
  //       isValid = false;
  //     }
  //   }
  //
  //   if (!this.form.value.purchaseValue || this.form.value.purchaseValue <= 0) {
  //     this.errors.purchaseValue = 'Valor deve ser maior que zero';
  //     isValid = false;
  //   }
  //
  //   if (!this.form.value.client?.id) {
  //     this.errors.clientId = 'Cliente é obrigatório';
  //     isValid = false;
  //   }
  //
  //   return isValid;
  // }

}
