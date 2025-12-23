import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { CurrencyService } from './currency.service';
import { NotificationService } from './notification.service';

describe('CurrencyService', () => {
  let service: CurrencyService;
  let httpMock: HttpTestingController;
  let notificationService: { showError: jest.Mock };

  beforeEach(() => {
    notificationService = {
      showError: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        CurrencyService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notificationService },
      ],
    });

    service = TestBed.inject(CurrencyService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads currencies and maps to symbols', () => {
    service.loadCurrencies();

    const req = httpMock.expectOne(
      'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas'
    );
    req.flush({
      '@odata.context': 'mock',
      value: [
        { simbolo: 'USD', nomeFormatado: 'Dolar', tipoMoeda: 'A' },
        { simbolo: 'EUR', nomeFormatado: 'Euro', tipoMoeda: 'A' },
      ],
    });

    expect(service.avaliableCurrencies()).toEqual([
      { name: 'Dolar', symbol: 'USD' },
      { name: 'Euro', symbol: 'EUR' },
    ]);
  });

  it('notifies when loading currencies fails', () => {
    service.loadCurrencies();

    const req = httpMock.expectOne(
      'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/Moedas'
    );
    req.flush('Boom', { status: 500, statusText: 'Server Error' });

    expect(notificationService.showError).toHaveBeenCalledWith(
      'Erro ao carregar moedas',
      'Boom'
    );
  });

  it('returns the latest currency quote', async () => {
    const response = {
      '@odata.context': 'mock',
      value: [
        {
          paridadeCompra: 1,
          paridadeVenda: 1,
          cotacaoCompra: 4.9,
          cotacaoVenda: 5.0,
          dataHoraCotacao: '2024-01-01T00:00:00Z',
          tipoBoletim: 'Fechamento',
        },
        {
          paridadeCompra: 1,
          paridadeVenda: 1,
          cotacaoCompra: 5.1,
          cotacaoVenda: 5.2,
          dataHoraCotacao: '2024-01-02T00:00:00Z',
          tipoBoletim: 'Fechamento',
        },
      ],
    };

    const resultPromise = firstValueFrom(service.getCurrencyQuote('USD', '2024-01-02'));

    const req = httpMock.expectOne((request) =>
      request.url.startsWith(
        'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoMoedaDia'
      )
    );
    req.flush(response);

    await expect(resultPromise).resolves.toEqual(response.value[1]);
  });
});
