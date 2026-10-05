// Perguntas do onboarding: perfil de negócio capturado antes de liberar o
// app. Poucas perguntas, de escolha única (exceto a última) — pensado pra
// quem não tem fluência digital. Cada resposta vira uma coluna em
// business_profile (ver supabase/migrations/0002_perfil_e_financeiro.sql).

export const ONBOARDING_STEPS = [
  {
    field: 'modelo_negocio',
    question: 'Seu negócio é uma franquia ou uma marca própria?',
    type: 'choice',
    options: [
      { value: 'franquia', label: '🏷️ Franquia' },
      { value: 'marca_propria', label: '✨ Marca própria' },
    ],
  },
  {
    field: 'segmento',
    question: 'Em qual segmento sua empresa atua?',
    type: 'choice',
    options: [
      { value: 'alimentacao', label: '🍔 Alimentação' },
      { value: 'varejo', label: '🛍️ Varejo / Comércio' },
      { value: 'servicos', label: '🧰 Serviços' },
      { value: 'saude_bemestar', label: '💊 Saúde & Bem-estar' },
      { value: 'beleza_estetica', label: '💅 Beleza & Estética' },
      { value: 'educacao', label: '📚 Educação' },
      { value: 'construcao', label: '🏗️ Construção & Reforma' },
      { value: 'tecnologia', label: '💻 Tecnologia' },
      { value: 'outro', label: '🔧 Outro' },
    ],
  },
  {
    field: 'tempo_mercado',
    question: 'Há quanto tempo a empresa está no mercado?',
    type: 'choice',
    options: [
      { value: 'menos_1_ano', label: 'Menos de 1 ano' },
      { value: '1_a_3_anos', label: '1 a 3 anos' },
      { value: '3_a_10_anos', label: '3 a 10 anos' },
      { value: 'mais_10_anos', label: 'Mais de 10 anos' },
    ],
  },
  {
    field: 'faturamento_mensal',
    question: 'Qual a faixa de faturamento mensal aproximado?',
    type: 'choice',
    options: [
      { value: 'ate_10k', label: 'Até R$ 10 mil' },
      { value: '10k_30k', label: 'R$ 10 mil a R$ 30 mil' },
      { value: '30k_100k', label: 'R$ 30 mil a R$ 100 mil' },
      { value: '100k_300k', label: 'R$ 100 mil a R$ 300 mil' },
      { value: 'acima_300k', label: 'Acima de R$ 300 mil' },
      { value: 'nao_informar', label: 'Prefiro não informar' },
    ],
  },
  {
    field: 'numero_funcionarios',
    question: 'Quantas pessoas trabalham na empresa (contando você)?',
    type: 'choice',
    options: [
      { value: 'so_eu', label: 'Só eu' },
      { value: '2_a_5', label: '2 a 5' },
      { value: '6_a_15', label: '6 a 15' },
      { value: '16_a_50', label: '16 a 50' },
      { value: 'mais_50', label: 'Mais de 50' },
    ],
  },
  {
    field: 'principal_desafio',
    question: 'Qual o maior desafio da empresa hoje?',
    type: 'choice',
    options: [
      { value: 'vender_mais', label: '📣 Vender mais / atrair clientes' },
      { value: 'controlar_custos', label: '💰 Controlar custos e fluxo de caixa' },
      { value: 'organizar_processos', label: '⚙️ Organizar processos e operação' },
      { value: 'gerenciar_equipe', label: '👥 Contratar e gerenciar equipe' },
      { value: 'outro', label: '🔧 Outro' },
    ],
  },
  {
    field: 'objetivo_12_meses',
    question: 'Em uma frase: o que você quer alcançar nos próximos 12 meses?',
    type: 'text',
    placeholder: 'ex: abrir uma segunda unidade, dobrar o faturamento, sair da operação do dia a dia…',
  },
];

export const FIELD_BY_NAME = Object.fromEntries(ONBOARDING_STEPS.map((s) => [s.field, s]));

export function labelFor(field, value) {
  const step = FIELD_BY_NAME[field];
  if (!step || step.type !== 'choice') return value;
  const opt = step.options.find((o) => o.value === value);
  return opt ? opt.label : value;
}
