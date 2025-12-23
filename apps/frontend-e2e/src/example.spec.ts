import { test, expect } from '@playwright/test';

const moedasResponse = {
  '@odata.context': 'mock',
  value: [
    {
      simbolo: 'USD',
      nomeFormatado: 'Dolar',
      tipoMoeda: 'A',
    },
  ],
};

const cotacaoResponse = {
  '@odata.context': 'mock',
  value: [],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/Moedas*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(moedasResponse),
    });
  });

  await page.route('**/CotacaoMoedaDia*', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(cotacaoResponse),
    });
  });
});

test('renderiza o dashboard e o menu principal', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page.getByText('Total de Clientes')).toBeVisible();
  await expect(page.getByText('Total de Empréstimos')).toBeVisible();
  await expect(page.getByText('Valor Total')).toBeVisible();

  await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Clientes' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Empréstimos' })).toBeVisible();
});

test('navega para clientes e emprestimos sem dados', async ({ page }) => {
  await page.goto('/clients');
  await expect(page.getByText('Nenhum cliente encontrado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Novo Cliente' })).toBeVisible();

  await page.getByRole('link', { name: 'Empréstimos' }).click();
  await expect(page.getByText('Nenhum empréstimo encontrado')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Novo Empréstimo' })).toBeVisible();
});
