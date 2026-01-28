import os
import subprocess
from datetime import datetime
from bs4 import BeautifulSoup

URL_FILE_MAP = {
    'https://www.repsantograu.online/': 'index.html',
    'https://www.repsantograu.online/fotos.html': 'fotos.html'
}

HUMANS_FILE = 'humans.txt'
SITEMAP_FILE = 'sitemap.xml'

def get_git_last_commit_date(filename):
    try:
        if not os.path.exists(filename):
            return None
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%cd', '--date=short', filename],
            text=True
        ).strip()
        return result
    except Exception as e:
        print(f"[GIT ERROR] Falha ao ler data de {filename}: {e}")
        return None

def update_sitemap():
    if not os.path.exists(SITEMAP_FILE):
        print(f"[ERRO] {SITEMAP_FILE} não encontrado.")
        return False

    changes_made = False
    
    try:
        with open(SITEMAP_FILE, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'xml')

        for url_tag in soup.find_all('url'):
            loc_tag = url_tag.find('loc')
            lastmod_tag = url_tag.find('lastmod')

            if loc_tag and loc_tag.text in URL_FILE_MAP:
                local_file = URL_FILE_MAP[loc_tag.text]
                git_date = get_git_last_commit_date(local_file)

                if git_date:
                    if not lastmod_tag:
                        lastmod_tag = soup.new_tag('lastmod')
                        url_tag.append(lastmod_tag)
                    
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
    if not os.path.exists(HUMANS_FILE):
        return False

    try:
        current_date_str = datetime.now().strftime('%Y/%m/%d')
        
        with open(HUMANS_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        changes_made = False

        for line in lines:
            if line.strip().lower().startswith("last update:"):
                parts = line.split(":", 1)
                prefix = parts[0]
                
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
    
    sitemap_updated = update_sitemap()
    
    if sitemap_updated:
        update_humans_txt()
    else:
        pass