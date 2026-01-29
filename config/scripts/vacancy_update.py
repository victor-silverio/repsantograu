import json
import os
from bs4 import BeautifulSoup

DATA_FILE = 'src/vagas.json'
AMENITIES_FILE = 'src/amenities.json'
TARGET_FILE = 'index.html'

def load_vacancy_data():
    if not os.path.exists(DATA_FILE):
        print(f"[ERRO] Arquivo de dados {DATA_FILE} não encontrado.")
        return None
    
    try:
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERRO] Falha ao ler JSON de vagas: {e}")
        return None

def load_amenities_data():
    if not os.path.exists(AMENITIES_FILE):
        print(f"[ERRO] Arquivo de amenities {AMENITIES_FILE} não encontrado.")
        return None
    
    try:
        with open(AMENITIES_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"[ERRO] Falha ao ler JSON de amenities: {e}")
        return None

def generate_badge_html(soup, available, year):
    new_div = soup.new_tag('div')
    new_div['id'] = 'vacancy-badge'
    new_div['class'] = ['inline-flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'rounded-full', 'mb-6', 'animate-fadeIn']
    
    icon_span_wrapper = soup.new_tag('span')
    icon_span_wrapper['class'] = ['relative', 'flex', 'h-3', 'w-3']
    
    ping_span = soup.new_tag('span')
    dot_span = soup.new_tag('span')
    
    text_span = soup.new_tag('span')
    text_span['class'] = ['text-white', 'font-sans', 'text-sm', 'md:text-base', 'font-medium', 'tracking-wide']

    if available > 0:
        new_div['class'].extend(['bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20'])
        
        ping_span['class'] = ['animate-ping', 'absolute', 'inline-flex', 'h-full', 'w-full', 'rounded-full', 'bg-green-400', 'opacity-75']
        dot_span['class'] = ['relative', 'inline-flex', 'rounded-full', 'h-3', 'w-3', 'bg-green-500']
        
        text_span.string = f"{available} Vagas Disponíveis para {year}"
    else:
        new_div['class'].extend(['bg-red-500/20', 'backdrop-blur-md', 'border', 'border-red-500/30'])
        
        dot_span['class'] = ['relative', 'inline-flex', 'rounded-full', 'h-3', 'w-3', 'bg-red-500']
        
        text_span.string = f"Vagas Esgotadas para {year}"

    if available > 0:
        icon_span_wrapper.append(ping_span)
    icon_span_wrapper.append(dot_span)
    
    new_div.append(icon_span_wrapper)
    new_div.append(text_span)
    
    return new_div

def update_json_ld_description(soup, available, year):
    scripts = soup.find_all('script', type='application/ld+json')
    updated = False
    
    for script in scripts:
        if not script.string: 
            continue
            
        try:
            data = json.loads(script.string)
            if 'description' in data:
                current_desc = data['description']
                
                clean_desc = current_desc.split(' (Vagas')[0].split(' (vagas')[0].strip()
                
                if available > 0:
                    new_suffix = f" (Vagas Disponíveis: {available} para {year})"
                else:
                    new_suffix = f" (Vagas Esgotadas para {year})"
                
                new_full_desc = clean_desc + new_suffix
                
                if current_desc != new_full_desc:
                    data['description'] = new_full_desc
                    script.string = json.dumps(data, indent=2, ensure_ascii=False)
                    updated = True
                    print("[SEO] Descrição JSON-LD atualizada.")
                    
        except json.JSONDecodeError:
            continue
            
    return updated

def update_faq_text(soup, room_type):
    updated = False
    targets = soup.find_all(string=lambda text: text and "Atualmente as vagas são para" in text)
    
    for text_node in targets:
        content = str(text_node)
        prefix = "Atualmente as vagas são para "
        
        if prefix in content:
            start_index = content.find(prefix)
            end_index = content.find(".", start_index)
            
            if end_index == -1:
                end_index = len(content)
            else:
                end_index += 1
            
            old_sentence = content[start_index:end_index]
            new_sentence = f"{prefix}{room_type}."
            
            if old_sentence != new_sentence:
                new_content = content.replace(old_sentence, new_sentence)
                text_node.replace_with(new_content)
                updated = True
                print(f"[FAQ] Texto atualizado: '{old_sentence}' -> '{new_sentence}'")

    return updated

def update_amenities_container(soup, amenities_data):
    container = soup.find(id="amenities-container")
    if not container:
        print("[AVISO] Elemento id='amenities-container' não encontrado.")
        return False

    container.clear()

    if not amenities_data:
        return False

    updated = False
    
    for item in amenities_data:
        icon_path = item.get("iconPath", "")
        content_html = item.get("content", "")

        wrapper_div = soup.new_tag("div", **{"class": "flex items-start gap-3"})
        
        icon_div = soup.new_tag("div", **{"class": "mt-1 w-6 flex justify-center flex-shrink-0"})
        svg_tag = soup.new_tag("svg", viewBox="0 0 640 640", **{"class": "w-5 h-5 text-repGold", "xmlns": "http://www.w3.org/2000/svg"})
        path_tag = soup.new_tag("path", d=icon_path, fill="currentColor")
        svg_tag.append(path_tag)
        icon_div.append(svg_tag)
        
        span_tag = soup.new_tag("span", **{"class": "text-gray-700"})
        content_soup = BeautifulSoup(content_html, 'html.parser')
        span_tag.append(content_soup)

        wrapper_div.append(icon_div)
        wrapper_div.append(span_tag)
        
        container.append(wrapper_div)
        updated = True

    if updated:
        print("[UI] Amenities atualizados.")
        return True
    
    return False

def main():
    print("--- Iniciando Atualização de Vagas (BeautifulSoup) ---")
    
    vagas_data = load_vacancy_data()
    if not vagas_data:
        return

    total = vagas_data.get('total_slots', 0)
    occupied = vagas_data.get('occupied_slots', 0)
    year = vagas_data.get('year', 2026)
    room_type = vagas_data.get('room_type', 'quartos')
    available = total - occupied
    
    print(f"Dados: {available} livres de {total}. Ano: {year}. Tipo: {room_type}")

    if not os.path.exists(TARGET_FILE):
        print(f"[ERRO] {TARGET_FILE} não encontrado.")
        return

    try:
        with open(TARGET_FILE, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f, 'html.parser')
        
        changes_made = False

        old_badge = soup.find(id="vacancy-badge")
        if old_badge:
            new_badge = generate_badge_html(soup, available, year)
            if str(old_badge) != str(new_badge):
                old_badge.replace_with(new_badge)
                changes_made = True
                print("[UI] Badge de vagas atualizado.")
        else:
            print("[AVISO] Elemento id='vacancy-badge' não encontrado no HTML.")

        if update_faq_text(soup, room_type):
            changes_made = True

        if update_json_ld_description(soup, available, year):
            changes_made = True

        amenities_data = load_amenities_data()
        if amenities_data:
            if update_amenities_container(soup, amenities_data):
                changes_made = True
        
        if changes_made:
            with open(TARGET_FILE, 'w', encoding='utf-8') as f:
                f.write(str(soup))
            print("[SUCESSO] index.html atualizado com informações de vagas.")
        else:
            print("[INFO] Nenhuma alteração necessária.")

    except Exception as e:
        print(f"[ERRO CRÍTICO] Falha ao processar HTML: {e}")

if __name__ == "__main__":
    main()