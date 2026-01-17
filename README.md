# 🏠 República Santo Grau — Site oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/update_seo.yml/badge.svg) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Este repositório contém o site oficial da **República Santo Grau** (Itajubá, MG). O site foi construído como uma Single Page Application (SPA) estática, com foco em velocidade, SEO técnico e experiência mobile-first. Ele centraliza a apresentação da casa, história, networking de ex-moradores e automações de manutenção.

🔗 Acesse em: [www.repsantograu.online](https://www.repsantograu.online/)

## 🚀 Funcionalidades e Diferenciais

O projeto vai além de uma landing page estática, integrando funcionalidades dinâmicas via scripts e design moderno:

- **Seções Ricas:**
  - **História Interativa:** Linha do tempo (Carousel) com fotos desde 2011.
  - **Networking:** Showcase de empresas onde ex-moradores atuam (Embraer, MRS, BTG, etc.).
  - **FAQ:** Seção de perguntas frequentes com dados estruturados (`FAQPage`).
  - **Tour:** Galeria de infraestrutura e links para drive de fotos.
- **PWA (Progressive Web App):** Configurável via `manifest.json` para instalação nativa em celulares.
- **SEO Técnico Automatizado:** Dados estruturados (JSON-LD) para `LodgingBusiness` atualizados automaticamente.
- **Hospedagem:** Azure Static Web Apps com SSL, distribuição global e cache agressivo para assets estáticos.
- **Performance:** Imagens em formato WebP, carregamento *lazy* e fontes otimizadas.

## 🛠️ Stack Tecnológico

| Área | Tecnologias |
| :--- | :--- |
| **Frontend** | HTML5 Semântico, Tailwind CSS (CDN), JavaScript Vanilla (ES6+) |
| **Estilização** | Font Awesome, Google Fonts (Montserrat & Playfair Display) |
| **Automação/Scripting** | Python 3.9 (`requests`, `regex`, `subprocess`) |
| **Infraestrutura** | Azure Static Web Apps |
| **CI/CD** | GitHub Actions (Deploy contínuo e Jobs agendados) |

## ⚙️ Automação Inteligente (SEO & Manutenção)

O projeto possui um "zelador digital" que roda diariamente via GitHub Actions (`.github/workflows/update_seo.yml`). O script `update_ratings.py` realiza:

1.  **Monitoramento de Reputação:** Consulta a **Google Places API** para buscar a nota e contagem de avaliações atuais.
2.  **Atualização de SEO:** Se houver mudanças, atualiza automaticamente o JSON-LD e o texto visível no site.
3.  **Manutenção Temporal:**
    * **Copyright:** Atualiza automaticamente o ano no rodapé (`© 202X`) na virada de ano.
    * **Sitemap Inteligente:** Verifica via `git log` se houve alterações reais no `index.html` antes de atualizar a tag `<lastmod>` no `sitemap.xml`, evitando commits desnecessários.
4.  **Auto-Commit:** O bot realiza o commit e push das alterações diretamente na branch principal, disparando um novo deploy na Azure.

## 📂 Estrutura do Projeto

```text
repsantograu/
├── .github/workflows/          # Pipelines (Azure Deploy e SEO Bot)
├── imagens/                    # Assets otimizados (WebP)
├── index.html                  # Single Page Application (Core)
├── update_ratings.py           # Script de automação (Python)
├── sitemap.xml                 # Mapa do site (atualizado dinamicamente)
├── robots.txt                  # Diretrizes para crawlers
├── manifest.json               # Configuração PWA
├── staticwebapp.config.json    # Regras de roteamento e cache Azure
├── requirements.txt            # Dependências do script Python
└── README.md                   # Documentação
```

## 💻 Executando Localmente

### Pré-requisitos

- Navegador moderno
- Python 3.9+ (para testar scripts de automação)
- Git

### Passos rápidos

1. Clone o repositório:

```bash
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu
```

2. Para visualizar o site, basta abrir o `index.html` em seu navegador ou usar uma extensão como Live Server no VS Code.

3. Para testar o script de automação (requer chaves de API):

```bash
pip install -r requirements.txt
```

```bash
# No Linux/Mac
export GCP_API_KEY="sua_chave_google"
export PLACE_ID="seu_place_id"

# No Windows (PowerShell)
$env:GCP_API_KEY="sua_chave_google"
$env:PLACE_ID="seu_place_id"

python update_ratings.py
```

## 📞 Contato

Dúvidas sobre o desenvolvimento ou sobre a república?

| Canal | Link |
| :--- | :--- |
| Email | Victoraugusto4096@outlook.com |
| WhatsApp | +55 (12) 99217-1061 |
| Instagram | @republicasantograuitajuba |

© 2026 República Santo Grau. Desenvolvido por Victor Augusto.