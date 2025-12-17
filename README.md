# 🏠 Website - República Santo Grau

[![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg)](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online)](https://www.repsantograu.online/)

Este repositório contém o código-fonte do website oficial da **República Santo Grau**, desenvolvido por mim para a moradia estudantil onde resido e estudo (UNIFEI). O projeto serve como *landing page* institucional, centralizando informações para novos moradores e apresentando nossa estrutura.

🔗 **Teste o projeto ao vivo:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 📖 Sobre o Projeto

O objetivo deste projeto foi criar uma presença digital moderna e performática, aplicando conceitos de CI/CD e Cloud Computing. O site é uma *Single Page Application* otimizada para SEO e conversão de novos candidatos.

### ✨ Funcionalidades e Destaques Técnicos

* **Design Responsivo & UI:** Layout *mobile-first* estilizado com Tailwind CSS (inlinado para performance máxima) e animações via *scroll reveal*.
* **SEO Técnico:** Implementação avançada de **Schema.org (JSON-LD)** para *Rich Snippets* do Google (avaliações, endereço e FAQ) e OpenGraph para redes sociais.
* **Automação de Dados (Python):** Script personalizado que roda via GitHub Actions para buscar avaliações reais na Google Places API e atualizar o HTML automaticamente, mantendo o SEO sempre "fresco" sem intervenção manual.
* **Performance:** Imagens em formato WebP servidas via CDN (Azure Blob Storage) e *lazy loading* de recursos.
* **Analytics:** Integração via Google Tag Manager.

---

## 🛠️ Stack Tecnológica

O projeto combina simplicidade no frontend com robustez na infraestrutura:

* **Frontend:** HTML5 Semântico, CSS3 (Tailwind CSS), JavaScript (Vanilla).
* **Automação/Backend:** Python 3.9 (Script `update_ratings.py` para atualização dinâmica de metadados).
* **Infraestrutura & Cloud:**
    * **Azure Static Web Apps:** Hospedagem e orquestração.
    * **Azure Blob Storage:** Armazenamento de mídia.
    * **GitHub Actions:** Pipelines de CI/CD para deploy e execução de rotinas agendadas (cron jobs).

---

## ⚙️ CI/CD e Automação

O projeto utiliza **GitHub Actions** conectado ao **Microsoft Azure**. Existem dois workflows principais:

1.  **Build & Deploy:**
    * Disparado a cada *push* na `main`.
    * Realiza o deploy imediato para o Azure Static Web Apps.
    * Atualiza automaticamente o `lastmod` do `sitemap.xml`.

2.  **Update SEO Ratings (Cron Job):**
    * Executado automaticamente todos os dias às 03:00 AM.
    * Um ambiente Python é configurado para rodar o script `update_ratings.py`.
    * O script consome a API do Google Places, verifica se há novas avaliações e, se houver mudança na nota ou contagem, faz um *commit* direto no repositório atualizando o JSON-LD do `index.html`.

---

## 📂 Estrutura de Arquivos

```text
repsantograu/
├── .github/workflows/   # Workflows de CI/CD e Automação Python
├── .gitignore           # Arquivos ignorados
├── index.html           # SPA Principal
├── update_ratings.py    # Script Python de automação de SEO
├── requirements.txt     # Dependências do script Python
├── robots.txt           # Diretrizes para crawlers
├── sitemap.xml          # Mapa do site dinâmico
└── README.md            # Documentação
```

---

## 🚀 Como Executar Localmente

Como o projeto é estático, a execução local é simples.

### Pré-requisitos
* Um navegador web moderno.
* (Opcional) Extensão "Live Server" no VS Code para desenvolvimento mais fluido.

### Passos
1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/victor-silverio/repsantograu.git](https://github.com/victor-silverio/repsantograu.git)
    ```
2.  **Acesse o diretório:**
    ```bash
    cd repsantograu
    ```
3.  **Abra o arquivo `index.html`:**
    * Basta dar um duplo clique no arquivo `index.html` para abrir no seu navegador.
    * Ou, se estiver a usar o VS Code com Live Server, clique em "Go Live".

---

## 📞 Contato

# Informações de contato:

email: [Victoraugusto4096@outlook.com](mailto:Victoraugusto4096@outlook.com)

WhatsApp: [+55 (12) 99217-1061](https://wa.me//5512992171061?text=Olá,%20venho%20através%20do%20github)

> Clique nos links acima para ser redirecionado automaticamente.