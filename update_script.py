import os
import requests
import re
import subprocess
from datetime import datetime

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")

TRACKED_FILES = [
    'index.html',
    'fotos.html',
    'styles.css',
    'src/script.js'
]

def get_git_commit_timestamp(filename):
    try:
        if not os.path.exists(filename):
            return 0
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%ct', filename],
            text=True
        ).strip()
        return int(result) if result else 0
    except Exception:
        return 0

def get_git_last_commit_date_str(filename):
    try:
        if not os.path.exists(filename):
            return None
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%cd', '--date=short', filename],
            text=True
        ).strip()
        return result
    except Exception:
        return None

def get_latest_tracked_timestamp():
    latest_ts = 0
    for filename in TRACKED_FILES:
        ts = get_git_commit_timestamp(filename)
        if ts > latest_ts:
            latest_ts = ts
    return latest_ts

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
        latest_change_ts = get_latest_tracked_timestamp()
        sitemap_ts = get_git_commit_timestamp(file_path)
        
        if latest_change_ts > sitemap_ts:
            print(f"[SEO] Arquivos alterados recentemente. Atualizando sitemap.")
            should_update = True

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
            else:
                print("[SEO] Sitemap já está com a data de hoje.")
                return False
        except Exception as e:
            print(f"Erro ao atualizar sitemap: {e}")
    
    return False

def update_humans_txt(force_update=False):
    file_path = 'humans.txt'
    should_update = force_update

    if not should_update:
        latest_change_ts = get_latest_tracked_timestamp()
        humans_ts = get_git_commit_timestamp(file_path)
        
        if latest_change_ts > humans_ts:
            should_update = True

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
        
        if new_data:
            rc_pattern = re.compile(r'("reviewCount"\s*:\s*")(\d+)(")')
            rv_pattern = re.compile(r'("ratingValue"\s*:\s*")([\d.]+)(")')
            
            def replace_rc(m):
                if m.group(2) != str(new_data['reviewCount']):
                    print(f"[SEO] Atualizando reviewCount: {m.group(2)} -> {new_data['reviewCount']}")
                    return f'{m.group(1)}{new_data["reviewCount"]}{m.group(3)}'
                return m.group(0)

            def replace_rv(m):
                if m.group(2) != str(new_data['ratingValue']):
                    print(f"[SEO] Atualizando ratingValue: {m.group(2)} -> {new_data['ratingValue']}")
                    return f'{m.group(1)}{new_data["ratingValue"]}{m.group(3)}'
                return m.group(0)

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
            if match_text.group(2) != new_visible_text:
                print(f"[UX] Atualizando texto visível.")
                updated_content = text_pattern.sub(f'\\1{new_visible_text}\\3', updated_content)
                changes_made = True

    current_year = str(datetime.now().year)
    copyright_pattern = re.compile(r'(©\s*)(\d{4})(\s*República Santo Grau)')
    match_copyright = copyright_pattern.search(updated_content)
    if match_copyright and match_copyright.group(2) != current_year:
        print(f"[FOOTER] Atualizando ano.")
        updated_content = copyright_pattern.sub(f'\\g<1>{current_year}\\g<3>', updated_content)
        changes_made = True

    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    
    return False

if __name__ == "__main__":
    ratings = get_google_ratings()
    
import json

def update_availability():
    try:
        with open('src/vagas.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        total = data.get('total_slots', 0)
        occupied = data.get('occupied_slots', 0)
        year = data.get('year', datetime.now().year)
        room_type = data.get('room_type', 'quartos duplos')
        
        available = total - occupied
        
        file_path = 'index.html'
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        updated_content = content
        changes_made = False
        
        if available > 0:
            badge_text = f"{available} Vagas Disponíveis para {year}"
            badge_html = f'''
        <div id="vacancy-badge" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-fadeIn">
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-white font-sans text-sm md:text-base font-medium tracking-wide">
                {badge_text}
            </span>
        </div>'''
        else:
            badge_text = f"Vagas Esgotadas para {year}"
            badge_html = f'''
        <div id="vacancy-badge" class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-md border border-red-500/30 mb-6 animate-fadeIn">
            <span class="relative flex h-3 w-3">
              <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span class="text-white font-sans text-sm md:text-base font-medium tracking-wide">
                {badge_text}
            </span>
        </div>'''
        
        badge_pattern = re.compile(r'(<div id="vacancy-badge".*?</div>)', re.DOTALL)
        if badge_pattern.search(content):
            current_match = badge_pattern.search(content).group(1)
            if ' '.join(current_match.split()) != ' '.join(badge_html.split()):
                print(f"[VAGAS] Atualizando badge: {badge_text}")
                updated_content = badge_pattern.sub(badge_html.strip(), updated_content)
                changes_made = True
                
        faq_pattern = re.compile(r'(Atualmente as vagas são para )(.*?)(?=\.)')
        match_faq = faq_pattern.search(updated_content)
        if match_faq and match_faq.group(2) != room_type:
            print(f"[VAGAS] Atualizando FAQ: {match_faq.group(2)} -> {room_type}")
            updated_content = faq_pattern.sub(f'\\g<1>{room_type}', updated_content)
            changes_made = True

        json_desc_pattern = re.compile(r'("description":\s*")(.*?)(")')
        match_desc = json_desc_pattern.search(updated_content)
        
        if match_desc:
            current_desc = match_desc.group(2)
            
            clean_desc = re.sub(r'\s*\(Vagas.*?\)', '', current_desc).strip()
            clean_desc = re.sub(r'\s*Vagas Esgotadas.*', '', clean_desc).strip()
            
            if available > 0:
                new_desc = f"{clean_desc} (Vagas Disponíveis: {available} para {year})"
            else:
                new_desc = f"{clean_desc} (Vagas Esgotadas para {year})"
            
            if current_desc != new_desc:
                print(f"[SEO] Atualizando descrição JSON-LD com vagas.")
                updated_content = json_desc_pattern.sub(f'\\1{new_desc}\\3', updated_content, count=1)
                changes_made = True

        if changes_made:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            return True
            
    except Exception as e:
        print(f"Erro ao atualizar disponibilidade: {e}")
        
    return False

if __name__ == "__main__":
    ratings = get_google_ratings()
    
    html_changed = update_html(ratings)
    vagas_changed = update_availability()
    
    sitemap_updated = update_sitemap(force_update=(html_changed or vagas_changed))
    humans_updated = update_humans_txt(force_update=(html_changed or vagas_changed))
    
    should_update_cache = False
    
    if html_changed or vagas_changed or sitemap_updated or humans_updated:
        should_update_cache = True
    else:
        latest_file_ts = get_latest_tracked_timestamp()
        sw_file_ts = get_git_commit_timestamp('sw.js')
        
        if latest_file_ts > sw_file_ts:
            print(f"[CACHE] Detecção por timestamp: Arquivos ({latest_file_ts}) > sw.js ({sw_file_ts}). Atualizando...")
            should_update_cache = True
        else:
            print("[CACHE] Nenhuma atualização pendente detectada (sw.js já é recente).")

    if should_update_cache:
        update_cache_version()