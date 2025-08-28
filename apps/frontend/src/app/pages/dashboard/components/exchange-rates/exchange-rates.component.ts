import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { CurrencyType } from '@loan-system-workspace/interfaces';

@Component({
  selector: 'app-exchange-rates',
  standalone: false,
  templateUrl: './exchange-rates.component.html',
  styleUrl: './exchange-rates.component.css'
})
export class ExchangeRatesComponent implements OnInit {
  exchangeRates: Record<string, number> = {};
  loading = false;
  lastUpdate: Date | null = null;

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadExchangeRates();
  }

  loadExchangeRates() {
    this.loading = true;
    this.http.get<Record<string, number>>('/api/loans/exchange-rates').subscribe({
      next: (rates) => {
        this.exchangeRates = rates;
        this.lastUpdate = new Date();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading exchange rates:', error);
        this.loading = false;
      }
    });
  }

  refreshRates() {
    this.loadExchangeRates();
  }

  getCurrencyName(currency: string): string {
    const names: Record<string, string> = {
      [CurrencyType.BRL]: 'Real Brasileiro',
      [CurrencyType.USD]: 'Dólar Americano',
      [CurrencyType.EUR]: 'Euro',
      [CurrencyType.GBP]: 'Libra Esterlina',
      [CurrencyType.JPY]: 'Iene Japonês',
      [CurrencyType.CHF]: 'Franco Suíço',
      [CurrencyType.CAD]: 'Dólar Canadense',
      [CurrencyType.AUD]: 'Dólar Australiano',
      [CurrencyType.CNY]: 'Yuan Chinês',
      [CurrencyType.ARS]: 'Peso Argentino'
    };

    return names[currency as CurrencyType] || currency;
  }

  getCurrencySymbol(currency: string): string {
    const symbols: Record<string, string> = {
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

    return symbols[currency as CurrencyType] || currency;
  }

  formatRate(rate: number): string {
    return rate.toLocaleString('pt-BR', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4
    });
  }

  formatLastUpdate(): string {
    if (!this.lastUpdate) return '';
    return this.lastUpdate.toLocaleString('pt-BR');
  }

  getRateVariation(currency: string): 'up' | 'down' | 'neutral' {
    const mockVariations: Record<string, 'up' | 'down' | 'neutral'> = {
      [CurrencyType.USD]: 'up',
      [CurrencyType.EUR]: 'down',
      [CurrencyType.GBP]: 'up',
      [CurrencyType.JPY]: 'neutral',
      [CurrencyType.CHF]: 'down',
      [CurrencyType.CAD]: 'up',
      [CurrencyType.AUD]: 'neutral',
      [CurrencyType.CNY]: 'up',
      [CurrencyType.ARS]: 'down'
    };

    return mockVariations[currency as CurrencyType] || 'neutral';
  }

  getCurrencies(): string[] {
    return Object.keys(this.exchangeRates).filter(currency => currency !== CurrencyType.BRL);
  }
}
