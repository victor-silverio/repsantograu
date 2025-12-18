import os
import requests
import re
from datetime import datetime

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")

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
    if update_html(ratings):
        print("HTML Atualizado com sucesso.")
    else:
        print("Nenhuma alteração necessária.")