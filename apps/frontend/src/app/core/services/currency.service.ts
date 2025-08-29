import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Currency {
  name: string;
  symbol: string;
}

interface CentralBankCurrencyResponse {
  "@odata.context": string,
  "value": [
    {
      "simbolo": string,
      "nomeFormatado": string,
      "tipoMoeda": string
    }
  ]
}

@Injectable({providedIn:'root'})
export class CurrencyService {
  private readonly centralBankUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

  private readonly http = inject(HttpClient);

  private avaliableCurrencies: Currency[] = []

  constructor() {
    this.getAvaliableCurrencies()
  }

  getAvaliableCurrencies() {
    this.http.get<CentralBankCurrencyResponse>(`${this.centralBankUrl}/Moedas`).subscribe({
      next: (response) => {
        this.avaliableCurrencies = response.value.map(currency => ({
          name: currency.nomeFormatado,
          symbol: currency.simbolo
        }))
        alert(this.avaliableCurrencies.length)
      },
      error: (error: any) => console.error('Erro ao buscar moedas', error)
    })
  }
}
