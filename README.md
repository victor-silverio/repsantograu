# 🏠 Website - República Santo Grau

[![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg)](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online)](https://www.repsantograu.online/)

Este repositório contém o código-fonte do website oficial da **República Santo Grau**, uma moradia estudantil tradicional localizada em Itajubá - MG, próxima à UNIFEI. O projeto serve como uma *landing page* institucional para apresentar a estrutura, história e atrair novos moradores (bixos).

🔗 **Acesse o site oficial:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 📖 Sobre o Projeto

O objetivo deste projeto é fornecer uma presença digital moderna, rápida e responsiva para a República. O site centraliza informações essenciais como localização, valores, fotos da estrutura e links de contato direto (WhatsApp/Instagram), facilitando o processo de recrutamento de novos estudantes.

### ✨ Funcionalidades Principais

* **Design Responsivo:** Layout adaptável para dispositivos móveis (mobile-first) e desktop.
* **Animações e Interatividade:** Elementos com *scroll reveal*, carrossel interativo na linha do tempo e efeitos de *hover*.
* **SEO Otimizado:** Configuração de meta tags, OpenGraph (para redes sociais) e Schema.org (JSON-LD) para melhor indexação.
* **Integrações:**
    * **Google Tag Manager:** Para análise de tráfego e métricas.
    * **Botão Flutuante do WhatsApp:** Para contacto rápido.
    * **Google Maps:** Link direto para a localização.
* **Performance:** Uso de imagens em formato WebP hospedadas em Azure Blob Storage e pré-carregamento de recursos críticos.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído focando em performance e simplicidade de manutenção:

* **HTML5 Semântico:** Estrutura base do site.
* **CSS3 & Tailwind CSS:** Estilização moderna. Nota: O CSS do Tailwind (v3.4.17) foi *inlinado* no documento para garantir carregamento instantâneo sem dependência de build steps complexos no runtime.
* **JavaScript (Vanilla):** Lógica para o menu mobile, carrossel da timeline e observadores de intersecção (lazy loading de animações).
* **Azure Static Web Apps:** Plataforma de hospedagem e CI/CD.
* **Azure Blob Storage:** Hospedagem externa de ativos de imagem para otimizar a largura de banda.
* **Font Awesome & Google Fonts:** Ícones e tipografia (Montserrat e Playfair Display).

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

## ⚙️ Deploy e CI/CD

O projeto utiliza **GitHub Actions** para Integração e Entrega Contínuas (CI/CD), conectado ao **Microsoft Azure Static Web Apps**.

* **Workflow:** Definido em `.github/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml`.
* **Gatilhos:**
    * Push na *branch* `main`: Inicia o build e deploy para produção.
    * Pull Requests: Cria automaticamente um ambiente de *preview* para validação das mudanças antes do merge.

---

## 📂 Estrutura de Arquivos

```text
repsantograu/
├── .github/workflows/   # Configuração do CI/CD para Azure
├── .gitignore           # Arquivos ignorados pelo Git
├── index.html           # Arquivo principal (Single Page Application)
├── robots.txt           # Diretrizes para indexadores (SEO)
├── sitemap.xml          # Mapa do site para motores de busca
└── README.md            # Documentação do projeto

# 🏠 Website - República Santo Grau

[![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg)](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml)
[![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online)](https://www.repsantograu.online/)

Este repositório contém o código-fonte do website oficial da **República Santo Grau**, uma moradia estudantil tradicional localizada em Itajubá - MG, próxima à UNIFEI. O projeto serve como uma *landing page* institucional para apresentar a estrutura, história e atrair novos moradores (bixos).

🔗 **Acesse o site oficial:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 📖 Sobre o Projeto

O objetivo deste projeto é fornecer uma presença digital moderna, rápida e responsiva para a República. O site centraliza informações essenciais como localização, valores, fotos da estrutura e links de contato direto (WhatsApp/Instagram), facilitando o processo de recrutamento de novos estudantes.

### ✨ Funcionalidades Principais

* **Design Responsivo:** Layout adaptável para dispositivos móveis (mobile-first) e desktop.
* **Animações e Interatividade:** Elementos com *scroll reveal*, carrossel interativo na linha do tempo e efeitos de *hover*.
* **SEO Otimizado:** Configuração de meta tags, OpenGraph (para redes sociais) e Schema.org (JSON-LD) para melhor indexação.
* **Integrações:**
    * **Google Tag Manager:** Para análise de tráfego e métricas.
    * **Botão Flutuante do WhatsApp:** Para contacto rápido.
    * **Google Maps:** Link direto para a localização.
* **Performance:** Uso de imagens em formato WebP hospedadas em Azure Blob Storage e pré-carregamento de recursos críticos.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído focando em performance e simplicidade de manutenção:

* **HTML5 Semântico:** Estrutura base do site.
* **CSS3 & Tailwind CSS:** Estilização moderna. Nota: O CSS do Tailwind (v3.4.17) foi *inlinado* no documento para garantir carregamento instantâneo sem dependência de build steps complexos no runtime.
* **JavaScript (Vanilla):** Lógica para o menu mobile, carrossel da timeline e observadores de intersecção (lazy loading de animações).
* **Azure Static Web Apps:** Plataforma de hospedagem e CI/CD.
* **Azure Blob Storage:** Hospedagem externa de ativos de imagem para otimizar a largura de banda.
* **Font Awesome & Google Fonts:** Ícones e tipografia (Montserrat e Playfair Display).

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

## ⚙️ Deploy e CI/CD

O projeto utiliza **GitHub Actions** para Integração e Entrega Contínuas (CI/CD), conectado ao **Microsoft Azure Static Web Apps**.

* **Workflow:** Definido em `.github/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml`.
* **Gatilhos:**
    * Push na *branch* `main`: Inicia o build e deploy para produção.
    * Pull Requests: Cria automaticamente um ambiente de *preview* para validação das mudanças antes do merge.

---

## 📂 Estrutura de Arquivos

```text
repsantograu/
├── .github/workflows/   # Configuração do CI/CD para Azure
├── .gitignore           # Arquivos ignorados pelo Git
├── index.html           # Arquivo principal (Single Page Application)
├── robots.txt           # Diretrizes para indexadores (SEO)
├── sitemap.xml          # Mapa do site para motores de busca
└── README.md            # Documentação do projeto

## 📞 Contato

**República Santo Grau**
* 📍 Itajubá, MG - Brasil
* 📱 [Instagram](https://instagram.com/republicasantograuitajuba)
* 💬 [WhatsApp](https://wa.me/5519992521926)