import { inject, Injectable } from '@angular/core';
import { DashboardInterface } from '@loan-system-workspace/interfaces';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly  dashboardApiUrl = '/api/dashboard';
  private readonly http = inject(HttpClient);

  getDashboardData() {
    return this.http.get<DashboardInterface>(this.dashboardApiUrl);
  }
}
