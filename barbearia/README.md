# 💈 Jan Barbearia — Site Premium

Site institucional de página única (one-page) para barbearias, com visual premium
(tema escuro + dourado) e agendamento integrado ao WhatsApp. **Zero dependências**:
um único arquivo `index.html`, pronto para hospedar em qualquer lugar.

## ✨ O que está incluído

- **Hero** com chamada de impacto, prova social e CTA de agendamento
- **Serviços & preços** em cards com destaque para o combo mais vendido
- **Clube de assinatura** com 3 planos (recorrência = faturamento previsível)
- **Galeria** com efeito hover e layout em mosaico
- **Equipe** com foto e especialidade de cada barbeiro
- **Depoimentos** em carrossel automático
- **Agendamento rápido**: formulário que monta a mensagem e abre o WhatsApp
- **Mapa do Google** integrado, horários de funcionamento e botão flutuante de WhatsApp
- Responsivo (mobile-first), animações de scroll e SEO básico (meta tags)

## 🚀 Como publicar

O site é 100% estático. Basta enviar a pasta para qualquer hospedagem:

- **Vercel / Netlify**: arraste a pasta no painel — pronto
- **GitHub Pages**: ative o Pages apontando para a pasta
- **Hospedagem tradicional (Hostinger, HostGator...)**: suba o `index.html` via FTP

## 🔧 Como personalizar para cada cliente

Abra o `index.html` e edite o bloco `CONFIG` no início do `<script>` (fim do arquivo):

```js
const CONFIG = {
  whatsapp: "5511987654321",        // DDI + DDD + número, só dígitos
  phoneDisplay: "(11) 98765-4321",  // telefone exibido no site
  address: "Rua Exemplo, 123 — Bairro, Cidade/UF",
  instagram: "https://instagram.com/suabarbearia",
  mapQuery: "Nome da Barbearia Cidade", // busca usada no mapa
  slots: ["09:00", "09:45", ...],   // horários do formulário
};
```

Todo telefone, endereço, Instagram, mapa e link de WhatsApp do site é atualizado
automaticamente a partir desse bloco.

### Textos, preços e fotos

- **Nome/marca**: busque por "Jan" e substitua pelos dados do cliente
- **Preços e serviços**: edite os cards na seção `<!-- SERVIÇOS -->`
- **Planos**: edite a seção `<!-- PLANOS -->`
- **Fotos**: troque as URLs das tags `<img>` por fotos reais do cliente
  (recomendado: fotos próprias convertem mais)
- **Cores**: ajuste as variáveis CSS em `:root` (ex.: `--gold` para a cor de destaque)

## 📄 Licença

Template desenvolvido para revenda/uso comercial pelo proprietário do repositório.
