import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppComponent, NotificationsComponent, SidebarComponent } from './components';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
],
  declarations: [
    AppComponent,
    NotificationsComponent,
    SidebarComponent,
  ],
  exports:[
    AppComponent
  ],
  providers: [
  ],
})
export class CoreModule { }
