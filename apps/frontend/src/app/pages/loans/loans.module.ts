import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Route } from '@angular/router';
import { LoanFormComponent, LoansListComponent } from './components';

const routes:Route[] = [
  {    path: '',    redirectTo:'list', pathMatch: 'full'  },
  {    path: 'list',    component: LoansListComponent  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    LoansListComponent,
    LoanFormComponent,
  ],
  providers:[
    provideRouter(routes)
  ]
})
export class LoansModule { }
