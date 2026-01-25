import os
import requests
import re
import subprocess
from datetime import datetime

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")

TRACKED_FILES = [
    'index.html',
    'src/input.css',
    'src/script.js'
]

def get_git_last_commit_date(filename):
    try:
        if not os.path.exists(filename):
            print(f"[WARN] Arquivo monitorado não encontrado localmente: {filename}")
            return None
            
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%cd', '--date=short', filename],
            text=True
        ).strip()
        return result
    except Exception as e:
        print(f"Erro ao verificar git log para {filename}: {e}")
        return None

def get_latest_tracked_change():
    latest_date = None
    
    for filename in TRACKED_FILES:
        date = get_git_last_commit_date(filename)
        if date:
            if latest_date is None or date > latest_date:
                latest_date = date
    
    return latest_date

def get_google_ratings():
    if not API_KEY or not PLACE_ID:
        print("Erro: Chaves não configuradas.")
        return None

    url = f"https://places.googleapis.com/v1/places/{PLACE_ID}"
    headers = {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'rating,userRatingCount'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        if "rating" in data:
            return {
                "ratingValue": str(data.get("rating", 5.0)),
                "reviewCount": str(data.get("userRatingCount", 0))
            }
    except Exception as e:
        print(f"Erro API: {e}")
    return None

def update_sitemap(force_update=False):
    file_path = 'sitemap.xml'
    should_update = force_update

    if not should_update:
        latest_change = get_latest_tracked_change()
        date_sitemap = get_git_last_commit_date(file_path)

        if latest_change and date_sitemap:
            if latest_change > date_sitemap:
                print(f"[SEO] Detectada alteração recente ({latest_change}) em arquivos monitorados. Atualizando sitemap.")
                should_update = True
            else:
                print("[SEO] Sitemap já está sincronizado com a versão mais recente dos arquivos.")

    if should_update:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            current_date = datetime.now().strftime('%Y-%m-%d')
            new_content = re.sub(r'<lastmod>.*?</lastmod>', f'<lastmod>{current_date}</lastmod>', content, count=1)
            
            if new_content != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"[SEO] Sitemap atualizado para: {current_date}")
                return True
        except Exception as e:
            print(f"Erro ao atualizar sitemap: {e}")
    
    return False

def update_humans_txt(force_update=False):
    file_path = 'humans.txt'
    should_update = force_update

    if not should_update:
        latest_change = get_latest_tracked_change()
        date_humans = get_git_last_commit_date(file_path)
        
        if latest_change and date_humans:
            if latest_change > date_humans:
                print(f"[SEO] Detectada alteração recente ({latest_change}). Atualizando humans.txt.")
                should_update = True
            else:
                print("[SEO] humans.txt já está sincronizado.")

    if should_update:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            current_date = datetime.now().strftime('%Y/%m/%d')
            
            pattern = re.compile(r'(Last update:\s*)(\d{4}/\d{2}/\d{2})')
            
            if pattern.search(content):
                new_content = pattern.sub(f'\\g<1>{current_date}', content)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"[SEO] humans.txt atualizado para: {current_date}")
                    return True
            else:
                print("[SEO] Campo 'Last update' não encontrado em humans.txt")

        except Exception as e:
            print(f"Erro ao atualizar humans.txt: {e}")
    
    return False

def update_cache_version():
    file_path = 'sw.js'
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        pattern = re.compile(r"const CACHE_NAME = 'santo-grau-v(\d+)'")
        match = pattern.search(content)
        
        if match:
            current_version = int(match.group(1))
            new_version = current_version + 1
            
            new_content = pattern.sub(f"const CACHE_NAME = 'santo-grau-v{new_version}'", content)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            
            print(f"[CACHE] Versão do cache incrementada: v{current_version} -> v{new_version}")
            return True
        else:
            print("[CACHE] Padrão de versão não encontrado em sw.js")
    except Exception as e:
        print(f"Erro ao atualizar versão do cache: {e}")
    
    return False

def update_html(new_data):
    file_path = 'index.html'
    changes_made = False
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    updated_content = content

    json_pattern = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.DOTALL)
    match_json = json_pattern.search(content)

    if match_json:
        script_content = match_json.group(2)
        new_script_content = script_content
        
        rc_pattern = re.compile(r'("reviewCount"\s*:\s*")(\d+)(")')
        rv_pattern = re.compile(r'("ratingValue"\s*:\s*")([\d.]+)(")')
        
        def replace_rc(m):
            if new_data and m.group(2) != str(new_data['reviewCount']):
                print(f"[SEO] Atualizando reviewCount: {m.group(2)} -> {new_data['reviewCount']}")
                return f'{m.group(1)}{new_data["reviewCount"]}{m.group(3)}'
            return m.group(0)

        def replace_rv(m):
            if new_data and m.group(2) != str(new_data['ratingValue']):
                print(f"[SEO] Atualizando ratingValue: {m.group(2)} -> {new_data['ratingValue']}")
                return f'{m.group(1)}{new_data["ratingValue"]}{m.group(3)}'
            return m.group(0)

        if new_data:
            new_script_content = rc_pattern.sub(replace_rc, new_script_content)
            new_script_content = rv_pattern.sub(replace_rv, new_script_content)

        if new_script_content != script_content:
            updated_content = updated_content[:match_json.start(2)] + new_script_content + updated_content[match_json.end(2):]
            changes_made = True

    if new_data:
        text_pattern = re.compile(r'(<span id="google-rating-text">)(.*?)(</span>)')
        new_visible_text = f"Nota {new_data['ratingValue']} no Google (baseada em {new_data['reviewCount']} avaliações)"
        
        match_text = text_pattern.search(updated_content)
        if match_text:
            current_text = match_text.group(2)
            if current_text != new_visible_text:
                print(f"[UX] Atualizando texto visível: '{current_text}' -> '{new_visible_text}'")
                updated_content = text_pattern.sub(f'\\1{new_visible_text}\\3', updated_content)
                changes_made = True

    current_year = str(datetime.now().year)
    copyright_pattern = re.compile(r'(©\s*)(\d{4})(\s*República Santo Grau)')
    
    match_copyright = copyright_pattern.search(updated_content)
    if match_copyright:
        existing_year = match_copyright.group(2)
        if existing_year != current_year:
            print(f"[FOOTER] Atualizando ano de copyright: {existing_year} -> {current_year}")
            updated_content = copyright_pattern.sub(f'\\g<1>{current_year}\\g<3>', updated_content)
            changes_made = True

    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    
    return False

if __name__ == "__main__":
    ratings = get_google_ratings()
    
    html_changed_by_script = update_html(ratings)
    
    if html_changed_by_script:
        print("HTML foi alterado pelo script (dados/ano). Forçando atualização de dependentes...")
        update_sitemap(force_update=True)
        update_humans_txt(force_update=True)
        update_cache_version()
    else:
        print("Nenhuma alteração automática no HTML. Verificando histórico do Git para arquivos monitorados...")
        
        sitemap_updated = update_sitemap(force_update=False)
        humans_updated = update_humans_txt(force_update=False)
        
        if sitemap_updated or humans_updated:
            update_cache_version()