# 🏠 República Santo Grau — Site oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/update_seo.yml/badge.svg) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Este repositório contém o site oficial da **República Santo Grau** (Itajubá, MG). O site foi construído como uma Single Page Application (SPA) estática, com foco em velocidade e boa experiência em dispositivos móveis. Ele reúne informações institucionais, galeria de eventos e meios de contato para novos moradores.

🔗 Acesse em: [www.repsantograu.online](https://www.repsantograu.online/)

## 🚀 Resumo do projeto

O site foi pensado para oferecer:

- Conteúdo otimizado para SEO técnico.
- Carregamento rápido em dispositivos móveis (mobile-first).
- Atualizações automatizadas de dados públicos (nota/avaliações) via scripts.

### Principais diferenciais técnicos

- **PWA (Progressive Web App):** configuração via `manifest.json` para instalação em dispositivos móveis.
- **Atualização automática de SEO:** um script em Python roda diariamente via GitHub Actions, consulta a Google Places API e atualiza o JSON-LD e trechos do `index.html` quando necessário.
- **Hospedagem:** Azure Static Web Apps com SSL e distribuição global.
- **Imagens otimizadas:** arquivos em WebP entregues via Azure Blob Storage para melhorar o LCP.
- **Frontend enxuto:** Tailwind CSS em conjunto com JavaScript vanilla, sem dependências pesadas de frameworks.

## 🛠️ Stack tecnológico

| Área | Tecnologias |
| :--- | :--- |
| **Frontend** | HTML5 semântico, Tailwind CSS, JavaScript (Vanilla) |
| **Scripting** | Python 3.9 (`requests`, `regex`) |
| **Infra** | Azure Static Web Apps, Azure Blob Storage |
| **CI/CD** | GitHub Actions (deploy e jobs agendados) |
| **SEO & Analytics** | Schema.org (JSON-LD), OpenGraph, Google Tag Manager |

## ⚙️ Como funciona a automação de SEO

O projeto mantém alguns dados "vivos" com um job automático:

1. Um workflow no GitHub Actions roda diariamente (às 03:00).
2. Ele executa `update_ratings.py` em um container com Python.
3. O script consulta a Google Places API usando a variável `GCP_API_KEY` e compara a nota/quantidade de avaliações com o que está no `index.html`.
4. Se houver mudança, o script atualiza o JSON-LD e o texto visível, ajusta `<lastmod>` em `sitemap.xml` e realiza um commit automático, disparando novo deploy.

## 📂 Estrutura do projeto

```text
repsantograu/
├── .github/workflows/          # Pipelines de CI/CD (Azure e SEO)
├── index.html                  # Core da aplicação (SPA)
├── update_ratings.py           # Script que atualiza as notas/SEO
├── sitemap.xml                 # Mapa do site (atualizado pelo script)
├── robots.txt                  # Diretrizes de indexação
├── manifest.json               # Configuração PWA (ícones, cores)
├── staticwebapp.config.json    # Regras/headers do Azure
├── requirements.txt            # Dependências Python
└── README.md                   # Documentação
```

## 💻 Executando localmente

### Pré-requisitos

- Navegador moderno
- (Opcional) Python 3.9+ para testar os scripts

### Passos rápidos

```bash
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu
```

Para ver o site abra `index.html` no navegador ou use uma extensão como Live Server no VS Code.

Para testar a automação (requer variáveis de ambiente):

```bash
pip install -r requirements.txt
# defina GCP_API_KEY e PLACE_ID nas variáveis de ambiente
python update_ratings.py
```

## 📞 Contato

Se quiser falar sobre o projeto:

| Canal | Link |
| :--- | :--- |
| **Email** | [Victoraugusto4096@outlook.com](mailto:Victoraugusto4096@outlook.com) |
| **WhatsApp** | [+55 (12) 99217-1061](https://wa.me/5512992171061?text=Olá,%20venho%20através%20do%20github) |

---

© 2026 República Santo Grau. Desenvolvido por Victor Augusto.