import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter, Route } from '@angular/router';
import { LoanFormComponent, LoansListComponent } from './components';
import { CalcPreview } from './components/calc-preview/calc-preview.component';

const routes:Route[] = [
  {    path: '',    redirectTo:'list', pathMatch: 'full'  },
  {    path: 'list',    component: LoansListComponent  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    LoansListComponent,
    LoanFormComponent,
    CalcPreview
  ],
  providers:[
    provideRouter(routes)
  ]
})
export class LoansModule { }
