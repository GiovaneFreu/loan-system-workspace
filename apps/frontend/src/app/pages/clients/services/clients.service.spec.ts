import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ClientsService } from './clients.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ClientsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ClientsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests clients list', () => {
    service.findAll().subscribe();

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a client', () => {
    const payload = { name: 'Ana', cpf_cnpj: '123', birthDate: '1990-01-01', monthlyIncome: 1000 };
    service.create(payload as never).subscribe();

    const req = httpMock.expectOne('/api/clients');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('updates a client', () => {
    const payload = { name: 'Ana Maria', cpf_cnpj: '123', birthDate: '1990-01-01', monthlyIncome: 1000 };
    service.update(2, payload as never).subscribe();

    const req = httpMock.expectOne('/api/clients/2');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('deletes a client', () => {
    service.deleteById(3).subscribe();

    const req = httpMock.expectOne('/api/clients/3');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
