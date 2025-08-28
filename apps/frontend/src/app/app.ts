import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { CoreModule } from './core/core.module';

@Component({
  imports: [
    CommonModule,
    CoreModule,
  ],
  selector: 'app-root',
  template: `<app-component class="bg-red-500"></app-component>`,
})
export class App {}
