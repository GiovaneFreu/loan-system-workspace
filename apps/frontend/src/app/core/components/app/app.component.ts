import { Component, inject, OnInit } from '@angular/core';
import { CurrencyService } from '../../services';

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
  private readonly currencyService = inject(CurrencyService);
  ngOnInit(): void {
    this.currencyService.loadCurrencies();
  }
}
