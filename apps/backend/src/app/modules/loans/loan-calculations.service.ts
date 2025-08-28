import { Injectable } from '@nestjs/common';

@Injectable()
export class LoanCalculationsService {
  
  calculateMonthsDifference(startDate: Date, endDate: Date): number {
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
}