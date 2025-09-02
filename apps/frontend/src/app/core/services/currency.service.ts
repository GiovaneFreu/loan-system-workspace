import { inject, Injectable, OnDestroy, Signal, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CurrencyInterface } from '@loan-system-workspace/interfaces';
import { map, Subscription } from 'rxjs';
import { NotificationService } from './notification.service';

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

interface CentralBackCurrencyQuoteResponse {
  "@odata.context": string,
  value: [
  {
    paridadeCompra: number,
    paridadeVenda: number,
    cotacaoCompra: number,
    cotacaoVenda: number,
    dataHoraCotacao: string,
    tipoBoletim: string
  }
]
}

@Injectable({providedIn:'root'})
export class CurrencyService implements OnDestroy{
  private readonly notificationService = inject(NotificationService);
  private readonly centralBankUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

  private readonly http = inject(HttpClient);

  private _avaliableCurrencies: Signal<CurrencyInterface[]> = signal([])
  private subscription!:Subscription;

  //FIXME - AJUSTAR TIPAGEM
  private _errors: any;

  get errors(){
    return this._errors
  }

  get avaliableCurrencies(){
    return this._avaliableCurrencies
  }

  ngOnDestroy(): void {
      this.subscription?.unsubscribe();
  }

  getCurrencyQuote(currencySymbol: CurrencyInterface['symbol'], date: string) {
    const url = `${this.centralBankUrl}/CotacaoMoedaDia(moeda=@moeda,dataCotacao=@dataCotacao)?@moeda='${currencySymbol}'&@dataCotacao='${date.split('-').reverse().join('-')}'`
    return this.http.get<CentralBackCurrencyQuoteResponse>(url).pipe(
      map(response => response.value.length > 0 ? response.value[response.value.length -1] : null)
    )
  }

  loadCurrencies() {
    this.subscription = this.http.get<CentralBankCurrencyResponse>(`${this.centralBankUrl}/Moedas`).subscribe({
      next: (response) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        this._avaliableCurrencies.set(response.value.map(currency => ({
          name: currency.nomeFormatado,
          symbol: currency.simbolo,
        })))
      },
      error: (error: any) => this.notificationService.showError('Erro ao carregar moedas', error?.message || 'Erro desconhecido')
    })
  }
}
