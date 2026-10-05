// Categorias de lançamento financeiro — sem dependências de servidor,
// seguro para importar tanto nas rotas /api quanto direto na UI.

export const CATEGORIAS = {
  receita: [
    { value: 'vendas', label: 'Vendas' },
    { value: 'servicos', label: 'Serviços' },
    { value: 'outras_receitas', label: 'Outras receitas' },
  ],
  despesa: [
    { value: 'fornecedores', label: 'Fornecedores' },
    { value: 'folha_pagamento', label: 'Folha de pagamento' },
    { value: 'aluguel', label: 'Aluguel' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'impostos', label: 'Impostos' },
    { value: 'outras_despesas', label: 'Outras despesas' },
  ],
};

export function categoriaLabel(tipo, value) {
  const list = CATEGORIAS[tipo] || [];
  const found = list.find((c) => c.value === value);
  return found ? found.label : value;
}
