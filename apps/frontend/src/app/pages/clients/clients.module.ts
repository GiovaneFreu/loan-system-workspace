import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideRouter, Route } from '@angular/router';
import { ClientFormComponent, ClientsListComponent } from './components';

const routes: Route[] = [
  { path: '',  pathMatch: 'full', redirectTo: 'list' },
  { path: 'list', component: ClientsListComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule
  ],
  declarations: [
    ClientsListComponent,
    ClientFormComponent
  ],
  providers: [
    provideRouter(routes)
  ],
})
export class ClientsModule { }
