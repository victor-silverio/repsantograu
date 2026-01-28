import os
import subprocess
from datetime import datetime
from bs4 import BeautifulSoup

# Mapeamento URL -> Arquivo Local
URL_FILE_MAP = {
    'https://www.repsantograu.online/': 'index.html',
    'https://www.repsantograu.online/fotos.html': 'fotos.html'
}

HUMANS_FILE = 'humans.txt'
SITEMAP_FILE = 'sitemap.xml'

def get_git_last_commit_date(filename):
    """
    Obtém a data do último commit (YYYY-MM-DD) de um arquivo específico.
    """
    try:
        if not os.path.exists(filename):
            return None
        # %cd = commit date, --date=short = YYYY-MM-DD
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%cd', '--date=short', filename],
            text=True
        ).strip()
        return result
    except Exception as e:
        print(f"[GIT ERROR] Falha ao ler data de {filename}: {e}")
        return None

def update_sitemap():
    """
    Atualiza as tags <lastmod> do sitemap.xml usando BeautifulSoup (XML parser).
    """
    if not os.path.exists(SITEMAP_FILE):
        print(f"[ERRO] {SITEMAP_FILE} não encontrado.")
        return False

    changes_made = False
    
    try:
        with open(SITEMAP_FILE, 'r', encoding='utf-8') as f:
            # Usamos 'xml' (lxml) para manter tags de fechamento e estrutura XML
            soup = BeautifulSoup(f, 'xml')

        # Itera sobre todas as tags <url>
        for url_tag in soup.find_all('url'):
            loc_tag = url_tag.find('loc')
            lastmod_tag = url_tag.find('lastmod')

            if loc_tag and loc_tag.text in URL_FILE_MAP:
                local_file = URL_FILE_MAP[loc_tag.text]
                git_date = get_git_last_commit_date(local_file)

                if git_date:
                    # Se não existir tag <lastmod>, cria uma
                    if not lastmod_tag:
                        lastmod_tag = soup.new_tag('lastmod')
                        url_tag.append(lastmod_tag)
                    
                    # Se a data for diferente, atualiza
                    if lastmod_tag.string != git_date:
                        print(f"[SEO] Atualizando sitemap: {local_file} -> {git_date}")
                        lastmod_tag.string = git_date
                        changes_made = True

        if changes_made:
            with open(SITEMAP_FILE, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print("[SUCESSO] sitemap.xml atualizado.")
            return True
        else:
            print("[INFO] Sitemap já está atualizado.")

    except Exception as e:
        print(f"[ERRO] Falha ao processar sitemap: {e}")
    
    return False

def update_humans_txt():
    """
    Atualiza a linha 'Last update' do humans.txt lendo linha por linha (sem regex).
    """
    if not os.path.exists(HUMANS_FILE):
        return False

    try:
        # Pega a data atual
        current_date_str = datetime.now().strftime('%Y/%m/%d')
        
        with open(HUMANS_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        changes_made = False

        for line in lines:
            # Verifica se a linha começa com "Last update:" (case insensitive)
            if line.strip().lower().startswith("last update:"):
                # Reconstrói a linha mantendo prefixo, mas mudando a data
                # Assume formato: "Last update: YYYY/MM/DD"
                parts = line.split(":", 1)
                prefix = parts[0] # "Last update"
                
                # Verifica se a data atual já está lá para evitar write desnecessário
                if current_date_str not in line:
                    new_line = f"{prefix}: {current_date_str}\n"
                    new_lines.append(new_line)
                    changes_made = True
                    print(f"[HUMANS] Data atualizada para {current_date_str}")
                else:
                    new_lines.append(line)
            else:
                new_lines.append(line)

        if changes_made:
            with open(HUMANS_FILE, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            return True
        else:
            print("[INFO] humans.txt já está na data de hoje.")

    except Exception as e:
        print(f"[ERRO] Falha ao processar humans.txt: {e}")

    return False

if __name__ == "__main__":
    print("--- Iniciando Atualização de Metadados ---")
    
    # 1. Atualiza Sitemap (baseado em datas do Git dos arquivos HTML)
    sitemap_updated = update_sitemap()
    
    # 2. Atualiza Humans.txt (se sitemap mudou ou se for rodado manualmente)
    # Lógica: Se o site mudou (sitemap updated), atualizamos a data do humans.txt
    if sitemap_updated:
        update_humans_txt()
    else:
        # Opcional: Verificar se o próprio humans.txt está desatualizado 
        # comparado ao último commit do repo, mas geralmente atualizamos 
        # humans.txt quando SITEMAP ou CONTENT muda.
        pass