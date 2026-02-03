# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/lastmod_update.yml/badge.svg) ![Cloudflare Protection](https://img.shields.io/badge/Protected%20by-Cloudflare-orange?logo=cloudflare) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório oficial do site da **República Santo Grau** (Itajubá, MG). Uma Single Page Application (SPA) moderna, foca em alta performance, acessibilidade, SEO automatizado e funcionamento offline (PWA).

**🌐 Site:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 🚀 Tecnologias e Stack

Frontend construído sem frameworks pesados, priorizando velocidade e controle total.

| Camada              | Tecnologias                                                                 |
| :------------------ | :-------------------------------------------------------------------------- |
| **Frontend**        | HTML5 Semântico, **Tailwind CSS v4.1**, JavaScript (ES6+)                   |
| **Estilização**     | Tailwind CLI, Font Awesome, Google Fonts (Montserrat)                       |
| **PWA**             | Service Worker (Workbox), Manifest.json, Offline Fallback                   |
| **Build System**    | Node.js, Terser (Minificação JS), HTML-Minifier-Terser, Workbox Build       |
| **Automação (SEO)** | Python 3.9 (GitHub Actions para updates de ratings, vagas e sitemap)        |
| **Infraestrutura**  | **Azure Static Web Apps** (Hospedagem), **Cloudflare** (DNS, CDN, Segurança)|

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
- **Script:** `scripts/rating_update.py`

### 2. Metadados e Sitemap (`lastmod_update.yml`)
- **Quando:** Diariamente (01:30 UTC).
- **O que faz:** Atualiza a data de modificação no `sitemap.xml` e `humans.txt` para manter bots de busca informados sobre o frescor do conteúdo.
- **Script:** `scripts/lastmod_update.py`

### 3. Vagas e Comodidades (`update_vacancy_amenities.yml`)
- **Quando:** Ao fazer push em `src/vagas.json` ou `src/amenities.json`.
- **O que faz:** Regenera o HTML principal injetando as novas informações de vagas disponíveis e comodidades, garantindo que o site reflita o estado atual da casa.
- **Script:** `scripts/vacancy_update.py`

---

## 📂 Estrutura de Arquivos

```
repsantograu/
├── .github/workflows/          # Workflows de CI/CD e automação
├── .well-known/                # Arquivos de verificação e segurança
├── dist/                       # (Gerado) Versão de produção otimizada
├── fonts/                      # Fontes locais
├── icons/                      # Ícones e favicons
├── imagens/                    # Fotos otimizadas (WebP)
├── scripts/                    # Scripts de build (JS) e automação (Python)
├── src/                        # Código fonte não minificado
│   ├── amenities.json          # Dados das comodidades
│   ├── input.css               # Entrada do Tailwind
│   ├── script.js               # Lógica principal
│   └── vagas.json              # Status das vagas
├── 404.html                    # Página de erro customizada
├── fotos.html                  # Galeria de fotos
├── humans.txt                  # Créditos do time
├── index.html                  # Página principal
├── llms.txt                    # Contexto técnico para IAs
├── manifest.json               # Configuração PWA
├── offline.html                # Fallback para falta de conexão
├── package.json                # Dependências e Scripts NPM
├── robots.txt                  # Diretrizes para crawlers
├── sitemap.xml                 # Mapa do site para SEO
├── staticwebapp.config.json    # Configuração Azure SWA
└── sw.js                       # Service Worker (Gerado no build)
```

---

## 💻 Desenvolvimento Local

### Pré-requisitos
- **Node.js** (v18+)
- **Python 3.9+** (opcional, para rodar scripts de automação)

### 1. Instalação

```bash
# Clone o repositório
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu

# Instale as dependências
npm install
pip install -r scripts/requirements.txt  # Opcional
```

### 2. Rodando o Projeto

**Modo Desenvolvimento (com Hot Reload do CSS):**
Este comando observa mudanças no CSS e recompila automaticamente.
```bash
npm run dev
```
Abra `index.html` no seu navegador (ou use uma extensão como Live Server).

**Gerar Build de Produção:**
Cria a pasta `dist/` com arquivos minificados, assets copiados e gera o Service Worker.
```bash
npm run build:dist
```

**Verificar Versão de Cache:**
Atualiza manualmente as query strings de versão (`?v=HASH`) nos arquivos HTML.
```bash
npm run update-version
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
