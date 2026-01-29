import os
import json
import requests
from bs4 import BeautifulSoup

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")
TARGET_FILE = 'index.html'

def get_google_ratings():
    if not API_KEY or not PLACE_ID:
        print("[ERRO] Chaves GCP_API_KEY ou PLACE_ID não configuradas.")
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
        print(f"[ERRO API] Falha ao buscar avaliações: {e}")
    return None

def update_json_recursively(obj, key_map):
    updated = False
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k in key_map:
                if str(v) != str(key_map[k]):
                    obj[k] = key_map[k]
                    updated = True
            elif isinstance(v, (dict, list)):
                if update_json_recursively(v, key_map):
                    updated = True
    elif isinstance(obj, list):
        for item in obj:
            if update_json_recursively(item, key_map):
                updated = True
    return updated

def update_html_ratings(new_data):
    if not new_data:
        return False

    if not os.path.exists(TARGET_FILE):
        print(f"[ERRO] Arquivo {TARGET_FILE} não encontrado.")
        return False

    try:
        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
        
        changes_made = False

        scripts = soup.find_all('script', type='application/ld+json')
        
        for script in scripts:
            if not script.string:
                continue
                
            try:
                json_content = json.loads(script.string)
                
                target_updates = {
                    "ratingValue": new_data['ratingValue'],
                    "reviewCount": new_data['reviewCount']
                }

                if update_json_recursively(json_content, target_updates):
                    script.string = json.dumps(json_content, indent=2, ensure_ascii=False)
                    changes_made = True
                    print(f"[SEO] JSON-LD atualizado com Nota: {new_data['ratingValue']}, Reviews: {new_data['reviewCount']}")

            except json.JSONDecodeError:
                print("[AVISO] Encontrado script JSON-LD inválido, pulando...")

        badge_span = soup.find(id="google-rating-text")
        if badge_span:
            new_text = f"Nota {new_data['ratingValue']} no Google (baseada em {new_data['reviewCount']} avaliações)"
            if badge_span.get_text() != new_text:
                badge_span.string = new_text
                changes_made = True
                print(f"[UX] Texto visível atualizado para: {new_text}")

        if changes_made:
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print("[SUCESSO] index.html atualizado e salvo.")
            return True
        else:
            print("[INFO] Dados já estão atualizados. Nenhuma alteração no arquivo.")
            
    except Exception as e:
        print(f"[ERRO] Falha crítica ao processar HTML: {e}")
    
    return False

if __name__ == "__main__":
    print("--- Iniciando Atualização de Ratings (BeautifulSoup) ---")
    ratings_data = get_google_ratings()
    
    if ratings_data:
        update_html_ratings(ratings_data)
    else:
        print("Abortando atualização (sem dados da API).")