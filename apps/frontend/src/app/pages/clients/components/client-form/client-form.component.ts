import { Component, EventEmitter, Input, OnInit, Output, inject, OnDestroy } from '@angular/core';
import { ClientInterface } from '@loan-system-workspace/interfaces';
import { ClientsService } from '../../services';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../../../core/services';
import { formatDateForInput, validateCpfCnpj } from '../../../../helpers';

type ClientFormErrors = Partial<Record<'general' | 'name' | 'birthDate' | 'cpf_cnpj' | 'monthlyIncome', string>>;

@Component({
  selector: 'app-client-form',
  standalone: false,
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.css'
})
export class ClientFormComponent implements OnInit, OnDestroy{
  private readonly clientService = inject(ClientsService);
  private readonly notificationService = inject(NotificationService);

  @Input() client: ClientInterface | null = null;
  @Output() submitted = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  protected formData = {
    name: '',
    birthDate: '',
    cpf_cnpj: '',
    monthlyIncome: 0
  };

  protected loading = false;
  protected errors: ClientFormErrors = {};

  private subscription!:Subscription;

  ngOnInit() {
    if (this.client) {
      this.formData = {
        name: this.client.name,
        birthDate: formatDateForInput(this.client.birthDate),
        cpf_cnpj: this.client.cpf_cnpj,
        monthlyIncome: this.client.monthlyIncome
      };
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  get isEditing(): boolean {
    return this.client !== null;
  }

  get title(): string {
    return this.isEditing ? 'Editar Cliente' : 'Novo Cliente';
  }

  onSubmit() {
    if (this.validateForm()) {
      this.loading = true;
      this.errors = {};

      const clientData = {
        ...this.formData,
        birthDate: new Date(this.formData.birthDate)
      };

      const request = this.client
        ? this.clientService.update(this.client.id, clientData)
        : this.clientService.create(clientData);

      this.subscription = request.subscribe({
        next: () => {
          this.loading = false;
          this.notificationService.showSuccess(`Cliente ${this.isEditing ? 'alterado' : 'criado'} com sucesso!`);
          this.submitted.emit();
        },
        error: (error: unknown) => {
          this.loading = false;

          const message = error && typeof error === 'object' && 'error' in error
            && error.error && typeof error.error === 'object' && 'message' in error.error
            ? String(error.error.message)
            : 'Erro ao salvar cliente. Tente novamente.';
          this.errors.general = message;
        }
      });
    }
  }

  onCancel() {
    this.cancelled.emit();
  }

  private validateForm(): boolean {
    this.errors = {};
    let isValid = true;

    if (!this.formData.name.trim()) {
      this.errors.name = 'Nome é obrigatório';
      isValid = false;
    }

    if (!this.formData.birthDate) {
      this.errors.birthDate = 'Data de nascimento é obrigatória';
      isValid = false;
    }

    if (!this.formData.cpf_cnpj.trim()) {
      this.errors.cpf_cnpj = 'CPF/CNPJ é obrigatório';
      isValid = false;
    } else if (!validateCpfCnpj(this.formData.cpf_cnpj)) {
      this.errors.cpf_cnpj = 'CPF/CNPJ inválido';
      isValid = false;
    }

    if (this.formData.monthlyIncome <= 0) {
      this.errors.monthlyIncome = 'Renda mensal deve ser maior que zero';
      isValid = false;
    }

    return isValid;
  }

  protected formatCpfCnpj() {
    let value = this.formData.cpf_cnpj.replace(/\D/g, '');

    if (value.length <= 11) {
      // Format as CPF: 000.000.000-00
      value = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // Format as CNPJ: 00.000.000/0000-00
      value = value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    this.formData.cpf_cnpj = value;
  }
}
