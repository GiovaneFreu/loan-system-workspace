export function formatDateForInput(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

export function validateCpfCnpj(value: string): boolean {
  // Remove characters especial
  const cleanValue = value.replace(/\D/g, '');

  // Verifica se tem 11 dígitos (CPF) ou 14 dígitos (CNPJ)
  return cleanValue.length === 11 || cleanValue.length === 14;
}
