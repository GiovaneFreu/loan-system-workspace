import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LoanFormState } from './loan-form.state';
import { CurrencyService, NotificationService } from '../../../../core/services';

describe('LoanFormState', () => {
  let state: LoanFormState;
  let currencyService: { getCurrencyQuote: jest.Mock };
  let notificationService: { showWarning: jest.Mock; showError: jest.Mock };

  beforeEach(() => {
    currencyService = {
      getCurrencyQuote: jest.fn(),
    };
    notificationService = {
      showWarning: jest.fn(),
      showError: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      providers: [
        LoanFormState,
        { provide: CurrencyService, useValue: currencyService },
        { provide: NotificationService, useValue: notificationService },
      ],
    });

    state = TestBed.inject(LoanFormState);
  });

  it('calculates months count and final amount', () => {
    state.form.controls.purchaseValue.setValue(1000);
    state.form.controls.interestRate.setValue(1);
    state.form.controls.purchaseDate.setValue('2024-01-01');
    state.form.controls.dueDate.setValue('2024-04-01');

    expect(state.form.controls.monthsCount.value).toBe(3);
    expect(state.form.controls.finalAmount.value).toBeCloseTo(1030.301, 2);
  });

  it('resets values when dates are missing', () => {
    state.form.controls.purchaseValue.setValue(500);
    state.form.controls.interestRate.setValue(5);
    state.form.controls.purchaseDate.setValue('');
    state.form.controls.dueDate.setValue('');

    expect(state.form.controls.monthsCount.value).toBe(0);
    expect(state.form.controls.finalAmount.value).toBe(500);
  });

  it('notifies when conversion quote is unavailable', () => {
    currencyService.getCurrencyQuote.mockReturnValue(of(null));

    state.form.controls.currencyId.setValue('USD');
    state.form.controls.purchaseDate.setValue('2024-01-01');

    expect(notificationService.showWarning).toHaveBeenCalled();
    expect(state.form.controls.conversionRate.value).toBeNull();
    expect(state.loadingConversionRate()).toBe(false);
  });

  it('notifies when conversion quote fails', () => {
    currencyService.getCurrencyQuote.mockReturnValue(throwError(() => new Error('Falha')));

    state.form.controls.currencyId.setValue('USD');
    state.form.controls.purchaseDate.setValue('2024-01-01');

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Não foi possível buscar a cotação.',
      'Falha'
    );
    expect(state.loadingConversionRate()).toBe(false);
  });
});
