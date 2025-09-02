import { Component, OnInit, inject, OnDestroy, computed, model, signal } from '@angular/core';
import { ClientInterface } from '@loan-system-workspace/interfaces';
import { Subscription } from 'rxjs';
import { ClientsService } from '../../services';
import { NotificationService } from '../../../../core/services';

@Component({
  selector: 'app-clients-list',
  standalone: false,
  templateUrl: './clients-list.component.html',
  styleUrl: './clients-list.component.css'
})
export class ClientsListComponent implements OnInit, OnDestroy {
  protected readonly clientsService = inject(ClientsService);
  protected readonly notificationService = inject(NotificationService);

  protected readonly title = 'Gerenciar Clientes';
  protected readonly clients = signal<ClientInterface[]>([])
  protected loading = false;
  protected showForm = false
  protected editingClient: ClientInterface | null = null;

  private subscription!:Subscription;

  protected searchTerm = model('')
  protected readonly filteredClients = computed(()=> {
    const searchTerm = this.searchTerm()
    if (!searchTerm) return this.clients()
      return this.clients().filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.cpf_cnpj.includes(searchTerm)
      );
  })

  ngOnInit() {
    this.loadClients();
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  protected loadClients() {
    this.loading = true;
    this.subscription = this.clientsService.findAll().subscribe({
      next: (clients) => {
        this.clients.set(clients)
        this.loading = false;
      },
      error: (error) => {
        this.notificationService.showError('Erro ao carregar clientes', error?.message || 'Erro desconhecido');
        this.loading = false;
      }
    })
  }

  protected  openAddForm() {
    this.showForm = true;
    this.editingClient = null;
  }

  protected  openEditForm(client: ClientInterface) {
    this.showForm = true;
    this.editingClient = { ...client };
  }

  protected closeForm() {
    this.showForm = false;
    this.editingClient = null;
  }

  protected  onFormSubmitted() {
    this.closeForm();
    this.loadClients();
  }

  protected deleteClient(client: ClientInterface) {
    // TODO - melhorar modal dialog
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      this.subscription = this.clientsService.deleteById(client.id).subscribe({
        next: () => this.loadClients(),
        error: (error) => {
          this.notificationService.showError('Erro ao excluir cliente', error?.message || 'Erro desconhecido');
        }
      });
    }
  }
}
