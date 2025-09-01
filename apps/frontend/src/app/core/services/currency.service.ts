import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyInerface } from '@loan-system-workspace/interfaces';

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

  private _avaliableCurrencies: CurrencyInerface[] = []

  constructor() {
    this.getAvaliableCurrencies()
  }

  get avaliableCurrencies(){
    return this._avaliableCurrencies
  }

  private getAvaliableCurrencies() {
    this.http.get<CentralBankCurrencyResponse>(`${this.centralBankUrl}/Moedas`).subscribe({
      next: (response) => {
        this._avaliableCurrencies = response.value.map(currency => ({
          name: currency.nomeFormatado,
          symbol: currency.simbolo,
          icon:''
        }))
        alert(this._avaliableCurrencies.length)
      },
      error: (error: any) => console.error('Erro ao buscar moedas', error)
    })
  }
}
