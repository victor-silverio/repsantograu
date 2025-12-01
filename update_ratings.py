import os
import json
import requests
from bs4 import BeautifulSoup

API_KEY = os.environ.get("GCP_API_KEY")
PLACE_ID = os.environ.get("PLACE_ID")

def get_google_ratings():
    """Busca nota e contagem na Google Places API (New Version v1)"""
    if not API_KEY or not PLACE_ID:
        print("Erro: API_KEY ou PLACE_ID não configurados.")
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
        else:
            print(f"Erro na API (sem rating): {data}")
            return None
    except Exception as e:
        print(f"Erro ao conectar na API: {e}")
        return None

def update_html(new_data):
    """Atualiza o JSON-LD dentro do index.html"""
    file_path = 'index.html'
    
    if not os.path.exists(file_path):
        print(f"Arquivo {file_path} não encontrado.")
        return False

    with open(file_path, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Encontra todos os scripts JSON-LD
    scripts = soup.find_all('script', type='application/ld+json')
    updated = False
    
    for script in scripts:
        try:
            # Usar .get_text() é mais seguro
            json_text = script.get_text()
            if not json_text: continue
            
            json_data = json.loads(json_text)
            
            # Verifica se é o JSON da República
            if json_data.get('@type') == 'Residence':
                
                # Garante que a estrutura existe
                if 'aggregateRating' not in json_data:
                    json_data['aggregateRating'] = {
                        "@type": "AggregateRating",
                        "bestRating": "5",
                        "worstRating": "4"
                    }
                
                # Compara valores
                current_count = str(json_data['aggregateRating'].get('reviewCount'))
                new_count = str(new_data['reviewCount'])
                
                if current_count != new_count:
                    print(f"ATUALIZANDO: {current_count} -> {new_count} avaliações.")
                    json_data['aggregateRating']['ratingValue'] = str(new_data['ratingValue'])
                    json_data['aggregateRating']['reviewCount'] = new_count
                    json_data['aggregateRating']['bestRating'] = "5" 
                    json_data['aggregateRating']['worstRating'] = "4"
                    
                    # type: ignore para o Pylance não reclamar
                    new_json_string = json.dumps(json_data, indent=4, ensure_ascii=False)
                    script.string = new_json_string # type: ignore
                    
                    updated = True
                else:
                    print("Nenhuma alteração necessária nas avaliações.")
                    
        except json.JSONDecodeError:
            continue

    if updated:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(str(soup))
        return True
    
    return False

if __name__ == "__main__":
    print("Iniciando verificação de SEO (New API)...")
    ratings = get_google_ratings()
    if ratings:
        if update_html(ratings):
            print("Sucesso: HTML atualizado.")
        else:
            print("Sem alterações no HTML.")
    else:
        print("Falha ao obter dados do Google.")