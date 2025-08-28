import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ClientInterface } from '@loan-system-workspace/interfaces';

@Component({
  selector: 'app-clients-list',
  standalone: false,
  templateUrl: './clients-list.component.html',
  styleUrl: './clients-list.component.css'
})
export class ClientsListComponent implements OnInit {
  protected readonly title = 'Gerenciar Clientes';

  clients: ClientInterface[] = [];
  filteredClients: ClientInterface[] = [];
  loading = false;
  searchTerm = '';
  showForm = false;
  editingClient: ClientInterface | null = null;

  private http = inject(HttpClient);

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.http.get<ClientInterface[]>('/api/clients').subscribe({
      next: (clients) => {
        this.clients = clients;
        this.filteredClients = clients;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.loading = false;
      }
    });
  }

  filterClients() {
    if (!this.searchTerm) {
      this.filteredClients = this.clients;
    } else {
      this.filteredClients = this.clients.filter(client =>
        client.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        client.cpf_cnpj.includes(this.searchTerm)
      );
    }
  }

  openAddForm() {
    this.showForm = true;
    this.editingClient = null;
  }

  openEditForm(client: ClientInterface) {
    this.showForm = true;
    this.editingClient = { ...client };
  }

  closeForm() {
    this.showForm = false;
    this.editingClient = null;
  }

  onFormSubmitted() {
    this.closeForm();
    this.loadClients();
  }

  deleteClient(client: ClientInterface) {
    if (confirm(`Tem certeza que deseja excluir o cliente ${client.name}?`)) {
      this.http.delete(`/api/clients/${client.id}`).subscribe({
        next: () => {
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          alert('Erro ao excluir cliente');
        }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }


}
