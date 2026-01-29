# República Santo Grau — Site Oficial

![Azure Static Web Apps CI/CD](https://github.com/victor-silverio/repsantograu/actions/workflows/azure-static-web-apps-black-moss-0abb1d50f.yml/badge.svg)
![Website Status](https://img.shields.io/website?url=https%3A%2F%2Fwww.repsantograu.online&label=Online&color=success)

Repositório com o código do site da República Santo Grau (Itajubá, MG). É uma Single Page Application moderna que foca em performance, SEO e organização.

**Site:** [www.repsantograu.online](https://www.repsantograu.online/)

---

## 🏛️ Estrutura do Projeto

O projeto foi reorganizado para maior modularidade e limpeza:

```text
repsantograu/
├── .github/                # Workflows do Azure e GitHub Actions
├── config/                 # Configurações e Scripts de Build
│   ├── package.json        # Dependências e scripts NPM
│   ├── eslint.impl.js      # Configuração real do ESLint
│   └── scripts/            # Scripts Node.js para build e versionamento
├── public/                 # Arquivos estáticos servidos na raiz
│   ├── manifest.json       # PWA Manifest
│   ├── robots.txt          # SEO
│   └── staticwebapp.config.json # Configuração Azure
├── src/                    # Código Fonte da Aplicação
│   ├── assets/             # Imagens, fontes e ícones
│   ├── input.css           # Tailwind CSS
│   ├── script.js           # Lógica JavaScript
│   ├── eslint.config.js    # Config do ESLint
│   └── *.html              # Páginas HTML
├── dist/                   # Output do build (gerado automaticamente)
└── README.md               # Documentação
```



---

## 🛠️ Stack Tecnológico

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | HTML5, Tailwind CSS v4, JavaScript (ES6+) |
| **Build System** | Node.js, PostCSS, Workbox (PWA) |
| **Hospedagem** | Azure Static Web Apps + Cloudflare |
| **Automação** | GitHub Actions (CI/CD) |

---

## 🚀 Como Usar Localmente

### 1. Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/victor-silverio/repsantograu.git
cd repsantograu

# IMPORTANTE: Todas as operações NPM devem ser feitas na pasta config/
cd config
npm install
```

### 2. Desenvolvimento

Para rodar o Tailwind em modo "watch" enquanto edita:

```bash
# Dentro da pasta config/
npm run dev
```

### 3. Build de Produção

Para gerar a versão final na pasta `dist/`:

```bash
# Dentro da pasta config/
npm run build:dist
```

Isso irá:
1. Compilar o Tailwind CSS.
2. Minificar o JavaScript.
3. Atualizar hashes de versão para cache busting.
4. Copiar arquivos de `src/`, `public/` e `config/` para `dist/`.
5. Gerar o Service Worker (`sw.js`).

---

## 🔒 Segurança e Features

- **PWA Ready**: Funciona offline, instalável via `manifest.json`.
- **Cache Busting**: Script próprio (`update_cache_version.js`) garante que usuários sempre recebam a versão mais nova.
- **Service Worker**: Gerado via Workbox para estratégias de caching inteligentes.
- **Cabeçalhos de Segurança**: Configurados via `staticwebapp.config.json` (CSP, HSTS, etc).

---

## 📞 Contato

| Canal | Link |
| :--- | :--- |
| **WhatsApp** | +55 (12) 99217-1061 |
| **Instagram** | [@republicasantograuitajuba](https://instagram.com/republicasantograuitajuba) |
| **Email** | [Victoraugusto4096@gmail.com](mailto:Victoraugusto4096@gmail.com) |

© 2026 República Santo Grau.
