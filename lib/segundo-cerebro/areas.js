// Áreas fixas de captura — um framework de negócio simples e sem jargão,
// pensado para dono de PME sem bagagem de gestão. Trocar o framework no
// futuro é editar só esta lista.

export const AREAS = [
  {
    id: 'visao',
    emoji: '🎯',
    label: 'Visão & Estratégia',
    hint: 'Para onde a empresa está indo, metas, decisões grandes',
  },
  {
    id: 'financeiro',
    emoji: '💰',
    label: 'Financeiro',
    hint: 'Fluxo de caixa, custos, preços, inadimplência',
  },
  {
    id: 'vendas',
    emoji: '📣',
    label: 'Marketing & Vendas',
    hint: 'Clientes em potencial, funil, campanhas, concorrência',
  },
  {
    id: 'operacoes',
    emoji: '⚙️',
    label: 'Operações',
    hint: 'Processos, fornecedores, qualidade, logística',
  },
  {
    id: 'pessoas',
    emoji: '👥',
    label: 'Pessoas & Equipe',
    hint: 'Contratações, cultura, conflitos, desempenho',
  },
  {
    id: 'clientes',
    emoji: '🤝',
    label: 'Clientes',
    hint: 'Feedback, reclamações, ideias que eles trazem',
  },
];

export const AREA_BY_ID = Object.fromEntries(AREAS.map((a) => [a.id, a]));
