import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CurrencyInterface } from '@loan-system-workspace/interfaces';
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
    currencyId: this.fb.control<CurrencyInterface['symbol'] | null>(null, Validators.required),
    purchaseValue: this.fb.control(0, [Validators.required, Validators.min(0.01)]),
    interestRate: this.fb.control(0, Validators.required),
    dueDate: this.fb.control('', Validators.required),
    clientId: this.fb.control<number | null>(null, Validators.required),
    conversionRate: this.fb.control<number |null>(null, Validators.required),
    finalAmount: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    monthsCount: this.fb.control(0, [Validators.required, Validators.min(1)]),
  })

  constructor() {
   const s1=   this.form.controls.currencyId.valueChanges.subscribe(()=> this.loadConversionRate());
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
    const currencyId = this.form.controls.currencyId.value
    const purchaseDate = this.form.controls.purchaseDate.value
    if (!currencyId || !purchaseDate) return;
    this.loadingConversionRate.set(true)
    this.conversionRateSubscription?.unsubscribe();
    this.conversionRateSubscription = this.currencyService.getCurrencyQuote(currencyId,purchaseDate).subscribe({
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
      error:(error: unknown)=>{
        const message = error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Erro desconhecido';
        this.notificationService.showError('Não foi possível buscar a cotação.', message)
        this.loadingConversionRate.set(false)
      }
    })
  }

  private calcValues() {
    const principal = this.form.controls.purchaseValue.value ?? 0
    const monthTax = this.form.controls.interestRate.value ? this.form.controls.interestRate.value / 100 : 0
    const startDate = this.form.controls.purchaseDate.value
    const endDate = this.form.controls.dueDate.value
    if (!startDate || !endDate) {
      this.form.controls.monthsCount.patchValue(0)
      this.form.controls.finalAmount.patchValue(principal)
      return
    }
    const period = differenceInMonths(new Date(endDate), new Date(startDate));
    this.form.controls.monthsCount.patchValue(period)
    const valorFinal =  principal * Math.pow(1 + monthTax, period)
    this.form.controls.finalAmount.patchValue(valorFinal)
  }
}
