import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { DashboardComponent, ExchangeRatesComponent } from './components';

const routes:Route[] = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DashboardComponent,
    ExchangeRatesComponent
  ],
  providers:[
    provideRouter(routes)
  ]
})
export class DashboardModule { }
