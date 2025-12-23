import { inject, Injectable, OnDestroy, Signal, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CurrencyInterface } from '@loan-system-workspace/interfaces';
import { map, Subscription } from 'rxjs';
import { NotificationService } from './notification.service';

interface CentralBankCurrencyResponse {
  '@odata.context': string;
  value: Array<{
    simbolo: string;
    nomeFormatado: string;
    tipoMoeda: string;
  }>;
}

interface CentralBackCurrencyQuoteResponse {
  '@odata.context': string;
  value: Array<{
    paridadeCompra: number;
    paridadeVenda: number;
    cotacaoCompra: number;
    cotacaoVenda: number;
    dataHoraCotacao: string;
    tipoBoletim: string;
  }>;
}

@Injectable({providedIn:'root'})
export class CurrencyService implements OnDestroy{
  private readonly notificationService = inject(NotificationService);
  private readonly centralBankUrl = 'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

  private readonly http = inject(HttpClient);

  private _avaliableCurrencies: Signal<CurrencyInterface[]> = signal([]);
  private subscription!:Subscription;

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
    );
  }

  loadCurrencies() {
    this.subscription = this.http.get<CentralBankCurrencyResponse>(`${this.centralBankUrl}/Moedas`).subscribe({
      next: (response) => {
        this._avaliableCurrencies.set(response.value.map(currency => ({
          name: currency.nomeFormatado,
          symbol: currency.simbolo,
        })));
      },
      error: (error: unknown) => {
        const message = error instanceof HttpErrorResponse
          ? (typeof error.error === 'string'
            ? error.error
            : (error.error as { message?: string } | null)?.message) ?? error.message
          : error instanceof Error
            ? error.message
            : 'Erro desconhecido';
        this.notificationService.showError('Erro ao carregar moedas', message);
      }
    });
  }
}
