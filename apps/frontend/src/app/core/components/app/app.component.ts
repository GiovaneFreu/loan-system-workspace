import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-component',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false,
  host: {
    class: 'block h-full'
  }
})
export class AppComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
