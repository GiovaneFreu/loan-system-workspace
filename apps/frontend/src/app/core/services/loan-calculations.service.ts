import { Injectable } from '@angular/core';
import { LoanInterface, CurrencyType } from '@loan-system-workspace/interfaces';

@Injectable({
  providedIn: 'root'
})
export class LoanCalculationsService {

  calculateMonthsDifference(startDate: Date | string, endDate: Date | string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);

    let months = (end.getFullYear() - start.getFullYear()) * 12;
    months += end.getMonth() - start.getMonth();

    return months > 0 ? months : 0;
  }

  calculateCompoundInterest(
    principal: number,
    annualRate: number,
    months: number,
    compoundingFrequency: number = 12
  ): number {
    if (months === 0) return principal;

    const rate = annualRate / 100;
    const n = compoundingFrequency;
    const t = months / 12;

    return principal * Math.pow(1 + rate / n, n * t);
  }

  calculateFinalAmount(
    purchaseValue: number,
    conversionRate: number,
    months: number,
    interestRate: number = 5
  ): number {
    const valueInBRL = purchaseValue * conversionRate;
    return this.calculateCompoundInterest(valueInBRL, interestRate, months);
  }

  convertCurrency(value: number, fromCurrency: CurrencyType, exchangeRates: Record<string, number>): number {
    if (fromCurrency === CurrencyType.BRL) {
      return value;
    }

    const rate = exchangeRates[fromCurrency] || 1;
    return value * rate;
  }

  formatCurrency(value: number, currency: CurrencyType = CurrencyType.BRL): string {
    const locale = currency === CurrencyType.BRL ? 'pt-BR' : 'en-US';
    const currencyCode = currency === CurrencyType.BRL ? 'BRL' : currency;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode
    }).format(value);
  }

  formatPercentage(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value / 100);
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

  calculateLoanSummary(
    loan: LoanInterface,
    exchangeRates: Record<string, number>,
    interestRate: number = 5
  ) {
    const months = this.calculateMonthsDifference(loan.purchaseDate, loan.dueDate);
    const conversionRate = exchangeRates[loan.currencyType] || 1;
    const valueInBRL = this.convertCurrency(loan.purchaseValue, loan.currencyType, exchangeRates);
    const finalAmount = this.calculateFinalAmount(loan.purchaseValue, conversionRate, months, interestRate);
    const totalInterest = finalAmount - valueInBRL;
    const monthlyRate = interestRate / 12 / 100;

    return {
      originalValue: loan.purchaseValue,
      originalCurrency: loan.currencyType,
      conversionRate,
      valueInBRL,
      months,
      interestRate,
      monthlyRate,
      finalAmount,
      totalInterest,
      effectiveAnnualRate: this.calculateEffectiveRate(interestRate, 12),
      monthlyPayment: months > 0 ? finalAmount / months : finalAmount
    };
  }

  private calculateEffectiveRate(nominalRate: number, compoundingFrequency: number): number {
    const rate = nominalRate / 100;
    return (Math.pow(1 + rate / compoundingFrequency, compoundingFrequency) - 1) * 100;
  }

  findAll() {

  }
}
