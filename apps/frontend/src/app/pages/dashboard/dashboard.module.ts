import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { provideRouter, Route } from '@angular/router';
import { DashboardComponent } from './components';

const routes:Route[] = [
  { path: '', component: DashboardComponent }
];

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    DashboardComponent,
  ],
  providers:[
    provideRouter(routes)
  ]
})
export class DashboardModule { }
