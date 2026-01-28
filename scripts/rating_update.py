import os
import json
import requests
from bs4 import BeautifulSoup

# Configuração
API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")
TARGET_FILE = 'index.html'

def get_google_ratings():
    """
    Busca a nota e contagem de avaliações via Google Places API (New).
    """
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
            # Retornamos strings para manter consistência, mas o JSON lida bem com int/float
            return {
                "ratingValue": str(data.get("rating", 5.0)),
                "reviewCount": str(data.get("userRatingCount", 0))
            }
    except Exception as e:
        print(f"[ERRO API] Falha ao buscar avaliações: {e}")
    return None

def update_json_recursively(obj, key_map):
    """
    Função auxiliar para encontrar e atualizar chaves em um JSON aninhado.
    key_map: dict com { 'chave_para_buscar': 'novo_valor' }
    """
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
            # Usamos html.parser (nativo) para não exigir lxml
            soup = BeautifulSoup(f, 'html.parser')
        
        changes_made = False

        # --- 1. Atualização do JSON-LD (Schema.org) ---
        # Busca todos os scripts do tipo JSON-LD
        scripts = soup.find_all('script', type='application/ld+json')
        
        for script in scripts:
            if not script.string:
                continue
                
            try:
                json_content = json.loads(script.string)
                
                # Mapa de atualizações desejadas
                target_updates = {
                    "ratingValue": new_data['ratingValue'],
                    "reviewCount": new_data['reviewCount']
                }

                # Atualiza o objeto JSON recursivamente (funciona mesmo se estiver dentro de aggregateRating)
                if update_json_recursively(json_content, target_updates):
                    # Dump do JSON atualizado de volta para a tag script
                    # ensure_ascii=False permite acentos se houver, indent=2 mantém legibilidade
                    script.string = json.dumps(json_content, indent=2, ensure_ascii=False)
                    changes_made = True
                    print(f"[SEO] JSON-LD atualizado com Nota: {new_data['ratingValue']}, Reviews: {new_data['reviewCount']}")

            except json.JSONDecodeError:
                print("[AVISO] Encontrado script JSON-LD inválido, pulando...")

        # --- 2. Atualização do Texto Visível (Badge) ---
        badge_span = soup.find(id="google-rating-text")
        if badge_span:
            new_text = f"Nota {new_data['ratingValue']} no Google (baseada em {new_data['reviewCount']} avaliações)"
            if badge_span.get_text() != new_text:
                badge_span.string = new_text
                changes_made = True
                print(f"[UX] Texto visível atualizado para: {new_text}")

        # --- Salvar Arquivo ---
        if changes_made:
            # O BeautifulSoup reescreve o HTML. Isso garante HTML válido, 
            # mas pode alterar levemente a indentação original do arquivo.
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