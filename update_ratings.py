import os
import json
import requests
import re

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")

def get_google_ratings():
    """Busca dados na Google Places API (New)"""
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
    matches = json_pattern.finditer(content)

    for match in matches:
        full_match = match.group(0)
        json_str = match.group(2)
        
        try:
            json_data = json.loads(json_str)
            if json_data.get('@type') == 'LodgingBusiness':
                if 'aggregateRating' not in json_data:
                    json_data['aggregateRating'] = {}

                current_count = str(json_data['aggregateRating'].get('reviewCount', '0'))
                new_count = str(new_data['reviewCount'])
                
                if current_count != new_count:
                    print(f"[SEO] Atualizando reviewCount: {current_count} -> {new_count}")
                    
                    json_data['aggregateRating'].update({
                        "@type": "AggregateRating",
                        "ratingValue": str(new_data['ratingValue']),
                        "reviewCount": new_count,
                        "bestRating": "5",
                        "worstRating": "1"
                    })
                    
                    new_json_str = json.dumps(json_data, indent=4, ensure_ascii=False)
                    new_script_tag = f'<script type="application/ld+json">\n{new_json_str}\n</script>'
                    updated_content = updated_content.replace(full_match, new_script_tag)
                    changes_made = True
        except json.JSONDecodeError:
            continue

    text_pattern = re.compile(r'(<span id="google-rating-text">)(.*?)(</span>)')
    
    new_visible_text = f"Nota {new_data['ratingValue']} no Google (baseada em {new_data['reviewCount']} avaliações)"
    
    text_match = text_pattern.search(updated_content)
    if text_match:
        current_visible_text = text_match.group(2)
        
        if current_visible_text != new_visible_text:
            print(f"[UX] Atualizando texto visível: '{current_visible_text}' -> '{new_visible_text}'")

            updated_content = text_pattern.sub(f'\\1{new_visible_text}\\3', updated_content)
            changes_made = True

    if changes_made:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
        return True
    
    return False

if __name__ == "__main__":
    ratings = get_google_ratings()
    if ratings:
        if update_html(ratings):
            print("HTML Atualizado com sucesso.")
        else:
            print("Nenhuma alteração necessária.")