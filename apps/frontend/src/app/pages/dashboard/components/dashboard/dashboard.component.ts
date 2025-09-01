import { Component, inject, OnDestroy } from '@angular/core';
import { DashboardInterface } from '@loan-system-workspace/interfaces';
import { DashboardService } from '../../services';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements  OnDestroy {
  protected readonly title = 'Dashboard';

  private readonly dashboardService = inject(DashboardService);
  private readonly notificationService = inject(NotificationService);

  protected data:DashboardInterface | null = null;
  private readonly subscription = this.dashboardService.getDashboardData().subscribe({
    next: (data) => this.data = data,
    error: (error) => this.notificationService.showError('Não foi possível carregar os dados do dashboard', error?.message)
  })

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }
}
