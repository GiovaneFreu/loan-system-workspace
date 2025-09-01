import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LoanInterface } from '@loan-system-workspace/interfaces';

@Injectable({providedIn: 'root'})
export class LoansService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = '/api/loans';

  findAll() {
    return this.http.get<LoanInterface[]>(this.apiUrl);
  }

  deleteById(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  create(loanData: Omit<LoanInterface, 'id'>) {
    return this.http.post<void>(this.apiUrl, loanData);
  }

  update(id: number, loanData: Omit<LoanInterface, 'id'>) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, loanData);
  }

}
