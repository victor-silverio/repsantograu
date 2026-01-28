# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/update_seo.yml/badge.svg) ![Cloudflare Protection](https://img.shields.io/badge/Protected%20by-Cloudflare-orange?logo=cloudflare) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório com o código do site da República Santo Grau (Itajubá, MG). É uma Single Page Application que cuida de performance, SEO automático e segurança.

**Site:** [www.repsantograu.online](https://www.repsantograu.online/)

## Segurança e Infraestrutura

O site roda em cima de uma arquitetura bem pensada pra segurança e performance:

### Infraestrutura

- **Cloudflare:** Protege contra DDoS, gerencia o DNS global e acelera a entrega dos assets usando CDN. Todos os acessos passam por lá primeiro.
- **Azure Static Web Apps:** Hospedagem serverless com HTTPS nativo. Deployment automático em segundos via GitHub Actions. Suporta API backend sem custo extra.
- **SSL/TLS:** Conexão criptografada de ponta a ponta (HTTPS obrigatório, HTTP redireciona).

### Configurações de Segurança (staticwebapp.config.json)

- **Rotas Privadas (404):** Arquivos sensíveis como `/node_modules/`, `/package.json`, `/src/`, e scripts de configuração retornam **404 Not Found** para evitar acesso ou scanning externo.
- **CSP (Content Security Policy):** Bloqueia scripts de terceiros não-autorizados.
- **X-Frame-Options:** Impede clickjacking.
- **X-Content-Type-Options:** Previne MIME sniffing.
- **Strict-Transport-Security:** Força HTTPS por 1 ano.
- **Permissions-Policy:** Desabilita acesso a câmera, microfone, geolocalização e pagamentos.

### Funcionalidades

O site é uma PWA (Progressive Web App) com recursos modernos:

- **Instalável:** Usuários podem instalar como um app nativo (Android/iOS/Desktop). Configuração em `manifest.json`. Funciona offline graças ao Service Worker.
- **Offline First:** O `sw.js` usa cache-first strategy para assets estáticos. Página principal é acessível sem internet.
- **Animações:** Usa `IntersectionObserver` para revelar elementos conforme a página é rolada (lazy reveal effect). Carrossel de timeline com scroll smooth e suporte touch.
- **SEO Otimizado:** Dados estruturados em JSON-LD para rich snippets no Google (Organization, Place, Review schema). Sitemap dinâmico. Meta tags otimizadas.
- **Performance:** Imagens em WebP. Fontes otimizadas. Tailwind CSS v4 com tree-shaking.

## Stack Tecnológico

| Camada       | O que usei                                      |
| :----------- | :---------------------------------------------- |
| **Frontend** | HTML5, Tailwind CSS v4.1.18, JavaScript vanilla |
| **Estilo**   | Font Awesome, Google Fonts, WebP                |
| **PWA**      | Service Worker (sw.js), Manifest.json           |
| **Scripts**  | Python 3.9 (requests, regex, subprocess)        |
| **Build**    | Node.js + Tailwind CLI                          |
| **Deploy**   | Azure Static Web Apps + Cloudflare              |
| **CI/CD**    | GitHub Actions                                  |

> **Para Agentes de IA:** Veja o arquivo `llms.txt` na raiz para um resumo técnico otimizado para LLMs.

## Automação (Script Python)

O destaque aqui é o script `update_script.py`, que roda **diariamente via GitHub Actions** (às 03:00 UTC) e mantém o site sempre atualizado. Ele também é acionado manualmente através da aba "Actions" no GitHub ou automaticamente quando há push no `index.html`.

**1. Sincroniza com Google Maps**

- Puxa a nota e número de avaliações da Google Places API.
- Atualiza automaticamente o JSON-LD (structured data) no HTML.

**2. Atualiza o Copyright**

- Mantém o ano do footer sempre atual (atualmente 2026).

**3. Gerencia o Sitemap e Humans.txt**

- Atualiza `<lastmod>` no sitemap e data no `humans.txt` apenas quando há mudanças reais no HTML, evitando commits desnecessários.

**4. Deploy Automático Inteligente**

- Se o script fizer alguma mudança, ele commita automaticamente na branch main, acionando o deploy do Azure.

## Estrutura de Arquivos

```
repsantograu/
├── .github/workflows/          # Automação: deploy e SEO
├── .well-known/                # Security.txt
├── divulgao_rep/               # Material de divulgação (Private/404)
├── fonts/                      # Fontes locais (Montserrat)
├── icons/                      # Ícones e favicons
├── imagens/                    # Fotos otimizadas em WebP
├── node_modules/               # Dependências JS (Private/404)
├── private/                    # Arquivos protegidos (Private/404)
├── src/                        # Código fonte frontend (Private/404)
│   ├── input.css
│   └── script.js
├── 404.html                    # Página de erro customizada
├── fotos.html                  # Galeria de fotos
├── humans.txt                  # Créditos (Human readable)
├── index.html                  # Página principal (SPA)
├── llms.txt                    # Resumo para IA (Machine readable)
├── manifest.json               # Configuração da PWA
├── package.json                # Dependências Node.js (Private/404)
├── requirements.txt            # Dependências Python (Private/404)
├── robots.txt                  # Diretrizes para bots
├── security.txt                # Política de segurança
├── sitemap.xml                 # Mapa do site
├── staticwebapp.config.json    # Segurança e cache Azure (Private/404)
├── styles.css                  # CSS compilado
├── sw.js                       # Service Worker (PWA)
├── update_script.py            # Script de automação SEO (Private/404)
└── README.md                   # Este arquivo
```

## Como Usar Localmente

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu
```

2. Instale as dependências:

```bash
npm install                  # Node.js
pip install -r requirements.txt # Python
```

### Rodando

**Modo Desenvolvimento (Tailwind Watch):**

```bash
npm run dev
```

Abra o `index.html` no navegador.

**Build de Produção:**

```bash
npm run build
```

**Testar Script de Automação:**
Configure as variáveis `GCP_API_KEY` e `PLACE_ID`, depois rode:

```bash
python update_script.py
```

## Contato

| Canal         | Link                                                                            |
| :------------ | :------------------------------------------------------------------------------ |
| **WhatsApp**  | +55 (12) 99217-1061                                                             |
| **Instagram** | [@republicasantograuitajuba](https://instagram.com/republicasantograuitajuba)   |
| **Email**     | [Victoraugusto4096@gmail.com](mailto:Victoraugusto4096@gmail.com)               |
| **GitHub**    | [victor-silverio/repsantograu](https://github.com/victor-silverio/repsantograu) |

---

© 2026 República Santo Grau. Desenvolvido por [Victor Augusto](https://github.com/victor-silverio).
