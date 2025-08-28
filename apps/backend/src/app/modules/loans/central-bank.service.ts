import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CurrencyType } from '@loan-system-workspace/interfaces';

export interface ExchangeRate {
  currency: string;
  rate: number;
  date: string;
}

@Injectable()
export class CentralBankService {
  private readonly logger = new Logger(CentralBankService.name);
  private readonly BCB_API_URL = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';
  private exchangeRatesCache = new Map<string, { rate: number; timestamp: number }>();
  private readonly CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

  private getCurrencyCode(currency: CurrencyType): string {
    const currencyMap: Record<CurrencyType, string> = {
      [CurrencyType.USD]: 'USD',
      [CurrencyType.EUR]: 'EUR',
      [CurrencyType.GBP]: 'GBP',
      [CurrencyType.JPY]: 'JPY',
      [CurrencyType.CHF]: 'CHF',
      [CurrencyType.CAD]: 'CAD',
      [CurrencyType.AUD]: 'AUD',
      [CurrencyType.CNY]: 'CNY',
      [CurrencyType.ARS]: 'ARS',
      [CurrencyType.BRL]: 'BRL',
    };
    return currencyMap[currency];
  }

  async getExchangeRate(currency: CurrencyType): Promise<number> {
    if (currency === CurrencyType.BRL) {
      return 1; // BRL to BRL is always 1
    }

    const currencyCode = this.getCurrencyCode(currency);
    const cacheKey = `${currencyCode}_BRL`;
    
    // Check cache first
    const cached = this.exchangeRatesCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const url = `${this.BCB_API_URL}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@moeda='${currencyCode}'&@dataInicial='${today}'&@dataFinalCotacao='${today}'&$format=json`;
      
      const response = await axios.get(url, {
        timeout: 10000,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'LoanSystemApp/1.0'
        }
      });

      if (response.data?.value?.length > 0) {
        const rate = response.data.value[0].cotacaoVenda || response.data.value[0].cotacaoCompra;
        
        // Cache the result
        this.exchangeRatesCache.set(cacheKey, {
          rate,
          timestamp: Date.now()
        });
        
        return rate;
      }

      // Fallback to mock rates if BCB API fails
      return this.getMockExchangeRate(currency);
      
    } catch (error) {
      this.logger.warn(`Failed to fetch exchange rate for ${currencyCode}: ${error.message}`);
      return this.getMockExchangeRate(currency);
    }
  }

  private getMockExchangeRate(currency: CurrencyType): number {
    // Fallback mock rates (approximate values)
    const mockRates: Record<CurrencyType, number> = {
      [CurrencyType.BRL]: 1,
      [CurrencyType.USD]: 5.20,
      [CurrencyType.EUR]: 5.60,
      [CurrencyType.GBP]: 6.50,
      [CurrencyType.JPY]: 0.035,
      [CurrencyType.CHF]: 5.80,
      [CurrencyType.CAD]: 3.80,
      [CurrencyType.AUD]: 3.50,
      [CurrencyType.CNY]: 0.75,
      [CurrencyType.ARS]: 0.0055,
    };
    
    return mockRates[currency] || 1;
  }

  async getAllExchangeRates(): Promise<Record<CurrencyType, number>> {
    const rates: Partial<Record<CurrencyType, number>> = {};
    
    for (const currency of Object.values(CurrencyType)) {
      rates[currency] = await this.getExchangeRate(currency);
    }
    
    return rates as Record<CurrencyType, number>;
  }

  clearCache(): void {
    this.exchangeRatesCache.clear();
  }
}