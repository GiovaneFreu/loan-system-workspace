import { AsyncPipe, JsonPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Message } from '@loan-system-workspace/interfaces';

@Component({
  imports: [
    AsyncPipe,
    JsonPipe,
    RouterModule
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'frontend';

  protected hello$ = inject(HttpClient).get<Message>('/api');
}
