# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/update_seo.yml/badge.svg) ![Cloudflare Protection](https://img.shields.io/badge/Protected%20by-Cloudflare-orange?logo=cloudflare) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório com o código do site da República Santo Grau (Itajubá, MG). É uma Single Page Application que cuida de performance, SEO automático e segurança.

**Site:** [www.repsantograu.online](https://www.repsantograu.online/)

## Segurança e Infraestrutura

O site roda em cima de uma arquitetura bem pensada pra segurança e performance:

### Infraestrutura

- **Cloudflare:** Protege contra DDoS, gerencia o DNS global e acelera a entrega dos assets usando CDN. Todos os acessos passam por lá primeiro.
- **Azure Static Web Apps:** Hospedagem serverless com HTTPS nativo. Deployment automático em segundos via GitHub Actions. Suporta API backend sem custo extra (quando necessário).
- **SSL/TLS:** Conexão criptografada de ponta a ponta (HTTPS obrigatório, HTTP redireciona).

### Configurações de Segurança (staticwebapp.config.json)

- **CSP (Content Security Policy):** Bloqueia scripts de terceiros não-autorizados.
- **X-Frame-Options:** Impede clickjacking.
- **X-Content-Type-Options:** Previne MIME sniffing.
- **Strict-Transport-Security:** Força HTTPS por 1 ano.
- **Permissions-Policy:** Desabilita acesso a câmera, microfone, geolocalização e pagamentos.
- **Cache inteligente:** Assets compilados (JS, CSS, imagens) ficam 1 ano no cache. HTML é sempre revalidado.

### Funcionalidades

O site é uma PWA (Progressive Web App) com recursos modernos:

- **Instalável:** Usuários podem instalar como um app nativo (Android/iOS/Desktop). Configuração em `manifest.json`. Funciona offline graças ao Service Worker.
- **Offline First:** O `sw.js` usa cache-first strategy para assets estáticos. Página principal é acessível sem internet.
- **Animações:** Usa `IntersectionObserver` para revelar elementos conforme a página é rolada (lazy reveal effect). Carrossel de timeline com scroll smooth e suporte touch.
- **SEO Otimizado:** Dados estruturados em JSON-LD para rich snippets no Google (Organization, Place, Review schema). Sitemap dinâmico. Meta tags otimizadas.
- **Performance:** Imagens em WebP (reduz 30% do tamanho). Fontes otimizadas via Google Fonts. Pré-carregamento de assets críticos. Tailwind CSS com tree-shaking (CSS puro, sem JIT bloat).

## Stack Tecnológico

| Camada | O que usei |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS v4.1.18, JavaScript vanilla |
| **Estilo** | Font Awesome 6.4, Google Fonts, WebP |
| **PWA** | Service Worker (sw.js), Manifest.json |
| **Scripts** | Python 3.9 (requests, regex, subprocess) |
| **Build** | Node.js + Tailwind CLI |
| **Deploy** | Azure Static Web Apps + Cloudflare |
| **CI/CD** | GitHub Actions |

## Automação (Script Python)

O destaque aqui é o script `update_ratings.py`, que roda **diariamente via GitHub Actions** (às 03:00 UTC) e mantém o site sempre atualizado. Ele também é acionado manualmente através da aba "Actions" no GitHub ou automaticamente quando há push no `index.html`.

**1. Sincroniza com Google Maps**
- Puxa a nota e número de avaliações da Google Places API.
- Atualiza automaticamente o JSON-LD (structured data) no HTML.
- Atualiza os campos de rating na página principal se houver mudanças.

**2. Atualiza o Copyright**
- No fim do ano, atualiza automaticamente o ano no footer (agora é 2026).
- Evita commits desnecessários se o ano não mudou.

**3. Gerencia o Sitemap**
- Compara datas do git log entre `index.html` e `sitemap.xml`.
- Só atualiza a tag `<lastmod>` se o HTML foi modificado após o sitemap.
- Mantém tudo sincronizado sem gerar commits fake.

**4. Sincroniza humans.txt**
- Atualiza a data "Last update" do arquivo `humans.txt` conforme mudanças no `index.html`.
- Segue o mesmo padrão inteligente do sitemap.

**5. Deploy Automático Inteligente**
- Se o script fizer alguma mudança, ele commita automaticamente na branch main.
- O Azure Static Web Apps detecta o novo commit e faz o deploy em seguida.
- Usa um bot de automação (SEO Bot) para fazer commits sem precisar de intervenção manual.

### CI/CD Pipeline

```yaml
Trigger (3x por dia) → Python Script → Verifica mudanças 
  → Atualiza arquivos → Commit & Push → Azure Detects → Deploy
```

## Estrutura de Arquivos

```
repsantograu/
├── .github/workflows/          # Automação: deploy e SEO
│   ├── azure-static-web-apps-*.yml    # Deploy automático
│   └── update_seo.yml                 # Atualização de ratings diários
├── src/                        # Assets em desenvolvimento
│   ├── input.css               # Tailwind CSS puro
│   └── script.js               # Lógica do frontend
├── imagens/                    # Fotos otimizadas em WebP
├── icons/                      # Ícones e favicons
├── .well-known/                # Security.txt e outros padrões web
├── index.html                  # Página principal (SPA)
├── 404.html                    # Página de erro customizada
├── sw.js                       # Service Worker (PWA)
├── styles.css                  # CSS compilado (gerado)
├── update_ratings.py           # Script de automação SEO
├── staticwebapp.config.json    # Segurança e cache (Azure)
├── manifest.json               # Configuração da PWA
├── sitemap.xml                 # Mapa do site (dinâmico)
├── robots.txt                  # Diretrizes para buscadores
├── package.json                # Dependências Node.js
├── requirements.txt            # Dependências Python
└── README.md                   # Este arquivo
```

## Como Usar Localmente

### Você vai precisar de:

- Node.js 18+ (para compilar o Tailwind CSS)
- Python 3.9+ (para rodar o script de automação)
- Git
- Um navegador moderno

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu
```

2. Instale as dependências Node.js:

```bash
npm install
```

3. Instale as dependências Python:

```bash
pip install -r requirements.txt
```

### Rodando Localmente

**Para desenvolvimento com auto-reload do Tailwind CSS:**

```bash
npm run dev
```

Depois abra o `index.html` no seu navegador ou use a extensão Live Server do VS Code. O Tailwind recompilará automaticamente a cada mudança no `src/input.css` ou no HTML.

**Para gerar a versão de produção (minificada):**

```bash
npm run build
```

**Para testar o script de automação SEO:**

Antes, configure as variáveis de ambiente:

```bash
# Windows (PowerShell)
$env:GCP_API_KEY="sua_api_key_aqui"
$env:PLACE_ID="seu_place_id_aqui"

# Linux/Mac
export GCP_API_KEY="sua_api_key_aqui"
export PLACE_ID="seu_place_id_aqui"
```

Depois rode:

```bash
python update_ratings.py
```

### Estrutura do Frontend

- **index.html** – Single Page Application com toda a estrutura HTML
- **styles.css** – Tailwind CSS compilado (NÃO edite diretamente!)
- **src/script.js** – JavaScript que gerencia:
  - Menu mobile responsivo
  - Animações com `IntersectionObserver`
  - Carrossel de timeline com scroll touch-friendly
  - Service Worker registration (PWA)
- **sw.js** – Service Worker com cache-first strategy para funcionar offline

### Estrutura do Backend/Automação

- **update_ratings.py** – Roda diariamente via GitHub Actions e:
  - Puxa ratings do Google Places API
  - Atualiza JSON-LD e HTML com novos dados
  - Sincroniza a data do sitemap com o último commit do `index.html`
  - Atualiza `humans.txt` automaticamente
  - Commita e faz push se houver mudanças

## Contato

Dúvidas sobre o projeto, contribuições ou interesse em morar na República?

| Canal | Link |
| :--- | :--- |
| **WhatsApp** | +55 (12) 99217-1061 |
| **Instagram** | [@republicasantograuitajuba](https://instagram.com/republicasantograuitajuba) |
| **Email** | [Victoraugusto4096@gmail.com](mailto:Victoraugusto4096@gmail.com) |
| **GitHub** | [victor-silverio/repsantograu](https://github.com/victor-silverio/repsantograu) |

---

© 2026 República Santo Grau. Desenvolvido por [Victor Augusto](https://github.com/victor-silverio).