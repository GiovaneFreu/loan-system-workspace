import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: 'loans', loadChildren: () => import('./pages/loans/loans.module').then(m => m.LoansModule) },
  { path: 'clients', loadChildren: () => import('./pages/clients/clients.module').then(m => m.ClientsModule) },
  { path: 'dashboard', loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: '**', redirectTo: 'dashboard' }
];
