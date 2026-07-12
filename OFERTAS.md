# 🛒 Garimpo de Ofertas

Plataforma para garimpar produtos com desconto na **Amazon**, **Mercado Livre** e **Shopee**, gerar o link já com o **seu ID de afiliado** e uma **copy persuasiva pronta** para postar no seu grupo de WhatsApp/Telegram.

## Como rodar

```bash
npm install
cp .env.example .env.local   # opcional — preencha o que tiver
npm run dev                  # abre em http://localhost:3000
```

## Como usar

1. Clique em **⚙️ Meus IDs de afiliado** e preencha seus identificadores (ficam salvos só no seu navegador):
   - **Amazon**: sua tag do programa Associados (ex: `meusite-20`);
   - **Mercado Livre**: sua palavra-chave de afiliado (`matt_word`) e, se tiver, o id da ferramenta (`matt_tool`);
   - **Shopee**: o App ID da Open API (opcional — veja abaixo);
   - **Audiência**: descreva seu público para a IA personalizar a copy.
2. **🔥 Ofertas do dia**: carregue a lista diária com os maiores descontos do Mercado Livre (nas categorias populares ou nos "interesses do grupo" que você configurar), marque as ofertas que quiser e clique em **Gerar mensagens** — todas saem de uma vez, cada uma com link de afiliado e copy pronta, com botão de copiar individual, "copiar todas" e envio direto no WhatsApp.
3. **🔍 Buscar ofertas**: pesquise no Mercado Livre e filtre pelo desconto mínimo. Cada resultado mostra preço, preço anterior e % de desconto.
4. **🔗 Colar link**: cole qualquer URL de produto da Amazon, Mercado Livre ou Shopee, preencha nome/preços/cupom e gere.
5. No gerador: escolha o **tom** (urgência, desejo, economia, exclusividade), edite a mensagem se quiser, **copie** ou envie **direto pro WhatsApp**.

## O que funciona sem credenciais

| Recurso | Sem credenciais | Com credenciais |
|---|---|---|
| Busca de ofertas no Mercado Livre | ✅ API pública | ✅ (`ML_ACCESS_TOKEN` se a API exigir) |
| Busca na Amazon / Shopee | ❌ (use "Colar link") | 🔜 exige PA-API / Open API |
| Link de afiliado Amazon | ✅ (`?tag=sua-tag`) | ✅ |
| Link de afiliado Mercado Livre | ✅ (`matt_word`/`matt_tool`) | ✅ |
| Shortlink comissionado Shopee | ❌ (gere no portal) | ✅ (`SHOPEE_APP_ID` + `SHOPEE_SECRET`) |
| Copy persuasiva | ✅ templates com gatilhos mentais | ✅ IA sob medida (`ANTHROPIC_API_KEY`) |

## Estrutura

- `pages/index.js` — interface da plataforma;
- `pages/api/deals.js` — lista diária de ofertas com maior desconto (Mercado Livre, com cache por dia);
- `pages/api/search.js` — busca de ofertas (Mercado Livre);
- `pages/api/copy.js` — copy por IA (Claude) com fallback em templates;
- `pages/api/shopee-link.js` — shortlink comissionado via Shopee Open API;
- `lib/affiliates.js` — detecção de marketplace e montagem dos links de afiliado;
- `lib/copywriter.js` — templates de copy com formatação do WhatsApp.

## Boas práticas

- Identifique-se como afiliado nos grupos (transparência exigida pelos programas);
- Preços mudam a toda hora — o rodapé das mensagens já inclui esse aviso;
- Amazon e Shopee proíbem raspagem de páginas: por isso a busca automática nesses marketplaces só é liberada via APIs oficiais.
