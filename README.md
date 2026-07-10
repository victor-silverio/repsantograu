# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/lastmod_update.yml/badge.svg) ![Cloudflare Protection](https://img.shields.io/badge/Protected%20by-Cloudflare-orange?logo=cloudflare) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório oficial do site da **República Santo Grau** (Itajubá, MG). Uma Single Page Application (SPA) moderna, foca em alta performance, acessibilidade, SEO automatizado e funcionamento offline (PWA).

**🌐 Site:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 🚀 Tecnologias e Stack

Frontend construído sem frameworks pesados, priorizando velocidade e controle total.

| Camada              | Tecnologias                                                                  |
| :------------------ | :--------------------------------------------------------------------------- |
| **Frontend**        | HTML5 Semântico, **Tailwind CSS v4.3**, JavaScript (ES6+)                    |
| **Estilização**     | Tailwind CLI, Font Awesome, Google Fonts (Montserrat)                        |
| **PWA**             | Service Worker (Workbox), Manifest.json, Offline Fallback                    |
| **Build System**    | Node.js, NPM Scripts, Terser, HTML-Minifier-Terser, Workbox Build            |
| **Automação (SEO)** | Python 3.9 (GitHub Actions para updates de ratings e sitemap)                |
| **Infraestrutura**  | **Azure Static Web Apps** (Hospedagem), **Cloudflare** (DNS, CDN, Segurança) |

---

## 🛡️ Segurança e Performance

A arquitetura foi desenhada para ser segura e extremamente rápida.

### Infraestrutura

- **Cloudflare:** Atua como proxy reverso, gerenciando DNS, protegendo contra DDoS e servindo assets via CDN global.
- **Azure Static Web Apps:** Hospedagem serverless com CI/CD integrado ao GitHub. Gerencia automaticamente certificados SSL/TLS.

### Configurações de Segurança (`staticwebapp.config.json`)

- **Rotas Protegidas:** Acesso negado (`404`) a arquivos de infraestrutura (`/node_modules`, `/src`, `package.json`, scripts Python).
- **Headers de Segurança:**
  - `Content-Security-Policy`: Restringe fontes de scripts/estilos.
  - `X-Frame-Options`: Bloqueia clickjacking.
  - `HSTS`: Força HTTPS por padrão.
  - `Permissions-Policy`: Desativa recursos sensíveis (câmera, mic).

### Otimizações Web Vitals

- **Imagens:** Formato WebP com decoding assimétrico e lazy loading.
- **Cache:** Estratégias de cache via Service Worker (Stale-While-Revalidate para assets, NetworkFirst para docs).
- **Minificação:** HTML e JS comprimidos no build de produção.
- **Fonts:** Carregamento otimizado de fontes.

---

## 🤖 Automação e CI/CD

O site se mantém atualizado automaticamente através de workflows do GitHub Actions, eliminando manutenção manual repetitiva.

### 1. Atualização de Avaliações (`rating_update.yml`)

- **Quando:** Semanalmente (Segunda-feira, 01:00 UTC).
- **O que faz:** Consulta a Google Places API para atualizar a nota e número de avaliações da república.
- **Script:** `scripts/automation/rating_update.py`

### 2. Metadados e Sitemap (`lastmod_update.yml`)

- **Quando:** Diariamente (01:30 UTC).
- **O que faz:** Atualiza a data de modificação no `sitemap.xml` e `humans.txt` para manter bots de busca informados sobre o frescor do conteúdo.
- **Script:** `scripts/automation/lastmod_update.py`

### 3. Vagas e Comodidades (Build Step)

- **Quando:** Durante o processo de build (`npm run build`).
- **O que faz:** Função Node.js que regenera o HTML principal atualizando as informações de vagas disponíveis, comodidades e metadados SEO (JSON-LD), com base no conteúdo de `src/data/vagas.json` e `src/data/amenities.json`.
- **Script:** `scripts/build/update_vacancy.js`

---

## 📂 Estrutura de Arquivos

```
repsantograu/
├── .github/workflows/          # Workflows de CI/CD e automação
├── docs/                       # Documentação interna e materiais extras
├── public/                     # Arquivos estáticos (Copiados direto pro dist)
│   ├── fonts/                  # Fontes locais
│   ├── icons/                  # Ícones e favicons
│   ├── imagens/                # Fotos otimizadas (WebP)
│   ├── manifest.json           # Configuração PWA
│   ├── robots.txt              # Diretrizes para crawlers
│   ├── sitemap.xml             # Mapa do site para SEO
│   └── llms.txt                # Contexto técnico para IAs
├── scripts/                    # Scripts do projeto
│   ├── automation/             # Automações em Python (SEO e API)
│   └── build/                  # Scripts de build em Node.js
├── src/                        # Código fonte
│   ├── data/                   # vagas.json e amenities.json
│   ├── js/                     # Lógica principal (script.js)
│   ├── pages/                  # index.html, fotos.html, 404.html
│   └── styles/                 # input.css (Tailwind)
├── dist/                       # (Gerado) Versão de produção otimizada
├── package.json                # Dependências e Scripts NPM
└── staticwebapp.config.json    # Configuração Azure SWA
```

---

## 💻 Desenvolvimento Local

### Pré-requisitos

- **Node.js** (v24+)
- **Python 3.9+** (opcional, para rodar scripts de automação)

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu

# Instale as dependências
npm install
pip install -r scripts/automation/requirements.txt  # Opcional
```

### 2. Rodando o Projeto

**Modo Desenvolvimento (com Hot Reload do CSS):**
Este comando observa mudanças no CSS e recompila automaticamente.

```bash
npm run dev
```

Abra `src/pages/index.html` no seu navegador (ou use uma extensão como Live Server).

**Gerar Build de Produção:**
Cria a pasta `dist/` com arquivos minificados, assets copiados, aplica versionamento de cache automático e gera o Service Worker.

```bash
npm run build:dist
```

---

## 📞 Contato

| Canal         | Link                                                                            |
| :------------ | :------------------------------------------------------------------------------ |
| **WhatsApp**  | +55 (12) 99217-1061                                                             |
| **Instagram** | [@republicasantograuitajuba](https://instagram.com/republicasantograuitajuba)   |
| **Email**     | [Victoraugusto4096@gmail.com](mailto:Victoraugusto4096@gmail.com)               |
| **GitHub**    | [victor-silverio/repsantograu](https://github.com/victor-silverio/repsantograu) |

---

© 2026 República Santo Grau. Desenvolvido por **Victor Augusto**.
