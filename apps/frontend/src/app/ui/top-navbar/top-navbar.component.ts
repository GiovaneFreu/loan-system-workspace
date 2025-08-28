import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-top-navbar',
  templateUrl: './top-navbar.component.html',
  styleUrls: ['./top-navbar.component.css']
})
export class TopNavbarComponent  {

  @Input({required: true}) currentPageTitle!: string;
  @Output() openAddModal = new EventEmitter<void>();
}
