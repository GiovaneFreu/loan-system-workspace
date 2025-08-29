import { inject, Injectable } from '@angular/core';
import { ClientInterface } from '@loan-system-workspace/interfaces';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ClientsService {

  private readonly apiUrl = '/api/clients';
  private readonly http = inject(HttpClient);

  findAll(){
    return this.http.get<ClientInterface[]>(this.apiUrl)
  }

  findById(){

  }

  deleteById(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  update(id:number, clientData: Omit<ClientInterface,'id'>) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, clientData)
  }

  create(clientData: Omit<ClientInterface,'id'>) {
    return this.http.post<void>(this.apiUrl, clientData)
  }
}
