import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { LoansService } from './loans.service';

describe('LoansService', () => {
  let service: LoansService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoansService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(LoansService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests loans list', () => {
    service.findAll().subscribe();

    const req = httpMock.expectOne('/api/loans');
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('creates a loan', () => {
    const payload = { purchaseValue: 1000 };
    service.create(payload as never).subscribe();

    const req = httpMock.expectOne('/api/loans');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('updates a loan', () => {
    const payload = { purchaseValue: 2000 };
    service.update(4, payload as never).subscribe();

    const req = httpMock.expectOne('/api/loans/4');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('deletes a loan', () => {
    service.deleteById(5).subscribe();

    const req = httpMock.expectOne('/api/loans/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
