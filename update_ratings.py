import os
import json
import requests
import re

# Configurações
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
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex para encontrar APENAS o bloco do JSON-LD
    # Procura por <script type="application/ld+json"> ... </script>
    pattern = re.compile(r'(<script type="application/ld\+json">)(.*?)(</script>)', re.DOTALL)
    
    matches = pattern.finditer(content)
    updated_content = content
    changes_made = False

    for match in matches:
        full_match = match.group(0)
        json_str = match.group(2)
        
        try:
            json_data = json.loads(json_str)
            
            if json_data.get('@type') == 'LodgingBusiness':
                
                # Garante estrutura
                if 'aggregateRating' not in json_data:
                    json_data['aggregateRating'] = {}

                # Checa se precisa atualizar
                current_count = str(json_data['aggregateRating'].get('reviewCount', '0'))
                new_count = str(new_data['reviewCount'])
                
                if current_count != new_count:
                    print(f"Atualizando reviewCount: {current_count} -> {new_count}")
                    
                    # Atualiza os dados
                    json_data['aggregateRating'].update({
                        "@type": "AggregateRating",
                        "ratingValue": str(new_data['ratingValue']),
                        "reviewCount": new_count,
                        "bestRating": "5",
                        "worstRating": "1"
                    })
                    
                    # Gera o novo JSON formatado
                    new_json_str = json.dumps(json_data, indent=4, ensure_ascii=False)
                    
                    # Reconstrói a tag completa
                    new_script_tag = f'<script type="application/ld+json">\n{new_json_str}\n</script>'
                    
                    # Substitui apenas este trecho no conteúdo original
                    updated_content = updated_content.replace(full_match, new_script_tag)
                    changes_made = True
                else:
                    print("Valores iguais, sem update.")
                    
        except json.JSONDecodeError:
            continue

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