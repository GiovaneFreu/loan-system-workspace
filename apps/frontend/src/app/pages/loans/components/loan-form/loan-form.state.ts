import { inject, Injectable, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ClientInterface,CurrencyInterface } from '@loan-system-workspace/interfaces';

@Injectable()
export class LoanFormState {

  private readonly fb = inject(FormBuilder);

  readonly form= this.fb.group({
    purchaseDate: this.fb.control('', Validators.required),
    currency: this.fb.control<CurrencyInterface | null>(null, Validators.required),
    purchaseValue: this.fb.control(0, Validators.required),
    interestRate: this.fb.control(0, Validators.required),
    dueDate: this.fb.control('', Validators.required),
    client: this.fb.control<ClientInterface | null>(null, Validators.required),
    conversionRate: this.fb.control(null, Validators.required),
    finalAmount: this.fb.control(null, Validators.required),
  })

}
