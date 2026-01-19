# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg) ![SEO Automation](https://github.com/victor-silverio/repsantograu/actions/workflows/update_seo.yml/badge.svg) ![Cloudflare Protection](https://img.shields.io/badge/Protected%20by-Cloudflare-orange?logo=cloudflare) ![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório com o código do site da República Santo Grau (Itajubá, MG). É uma Single Page Application que cuida de performance, SEO automático e segurança.

**Site:** [www.repsantograu.online](https://www.repsantograu.online/)

## Segurança e Infraestrutura

O site roda em cima de algumas tecnologias:

- **Cloudflare:** Protege contra DDoS, gerencia o DNS e acelera a entrega dos assets usando CDN.
- **Azure Static Web Apps:** Hospedagem serverless com deploy automático via GitHub Actions. A segurança é gerenciada pelo arquivo `staticwebapp.config.json`.
- **SSL/TLS:** Conexão criptografada de ponta a ponta.

## Funcionalidades

O site é uma PWA (Progressive Web App) com alguns recursos:

- **Instalável:** Usuários podem instalar como um app nativo no Android/iOS. Configuração em `manifest.json`.
- **Animações:** Usa `IntersectionObserver` para revelar elementos conforme a página é rolada e um carrossel touch-friendly na linha do tempo.
- **SEO:** Dados estruturados em JSON-LD para rich snippets no Google.
- **Performance:** Imagens em WebP, pré-carregamento de assets críticos e fontes otimizadas.

## Stack Tecnológico

| Camada | O que usei |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS (CDN), JavaScript |
| **Estilo** | Font Awesome, Google Fonts, WebP |
| **Scripts** | Python 3.9 (requests, regex, subprocess) |
| **Deploy** | Azure Static Web Apps + Cloudflare |
| **CI/CD** | GitHub Actions |

## Automação (Script Python)

O destaque aqui é o script `update_ratings.py`, que roda diariamente no GitHub Actions e faz algumas coisas legais:

**1. Sincroniza com Google Maps**
- Puxa a nota e número de avaliações da Google Places API.
- Se mudou algo, atualiza o HTML e o JSON-LD automaticamente.

**2. Atualiza o Copyright**
- No fim do ano, atualiza automaticamente o ano no footer.

**3. Gerencia o Sitemap**
- Checa o git log pra saber se o `index.html` foi modificado.
- Só atualiza a tag `<lastmod>` se realmente houve mudanças, evitando commits desnecessários.

**4. Faz Deploy Automático**
- Se o script fizer alguma mudança, ele commita direto na main e dispara um novo deploy na Azure.

## Estrutura de Arquivos

```
repsantograu/
├── .github/workflows/          # Deploy e automação
├── imagens/                    # Fotos otimizadas em WebP
├── icons/                      # Ícones e favicons
├── index.html                  # Página principal
├── update_ratings.py           # Script de automação
├── staticwebapp.config.json    # Config de segurança do Azure
├── manifest.json               # Config da PWA
├── sitemap.xml                 # Mapa do site
├── robots.txt                  # Diretrizes para buscadores
└── requirements.txt            # Dependências Python
```

## Como Usar Localmente

### Você vai precisar de:

- Python 3.9+
- Git
- Um servidor local (tipo Live Server da extensão do VS Code)

### Instalação

1. Clone o repositório:

```bash
git clone https://github.com/victor-silverio/repsantograu.git
```

2. Instale as dependências Python:

```bash
pip install -r requirements.txt
```

3. Configure as variáveis de ambiente (precisam disso pra rodar o script):

```bash
# Linux/Mac
export GCP_API_KEY="sua_api_key"
export PLACE_ID="seu_place_id"

# Windows (PowerShell)
$env:GCP_API_KEY="sua_api_key"
$env:PLACE_ID="seu_place_id"
```

### Rodando localmente

**Frontend:** Só abre o `index.html` no navegador. Tailwind vem do CDN, sem precisa de build.

**Script:** Se quiser testar a automação:

```bash
python update_ratings.py
```

## Contato

Dúvidas sobre o projeto ou interesse em morar na República?

| Canal | Link |
| :--- | :--- |
| **WhatsApp** | +55 (12) 99217-1061 |
| **Instagram** | [@republicasantograuitajuba](https://instagram.com/republicasantograuitajuba) |
| **Email** | [Victoraugusto4096@outlook.com](mailto:Victoraugusto4096@outlook.com) |

---

© 2026 República Santo Grau. Desenvolvido por Victor Augusto.