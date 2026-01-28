import json
import os
from bs4 import BeautifulSoup

# Arquivos de entrada e saída
DATA_FILE = 'src/vagas.json'
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

def generate_badge_html(soup, available, year):
    """
    Gera o novo elemento do badge usando BeautifulSoup.
    Mantém as classes exatas do design original.
    """
    new_div = soup.new_tag('div')
    new_div['id'] = 'vacancy-badge'
    new_div['class'] = ['inline-flex', 'items-center', 'gap-2', 'px-4', 'py-2', 'rounded-full', 'mb-6', 'animate-fadeIn']
    
    # Span para o ícone (bolinha pulsante)
    icon_span_wrapper = soup.new_tag('span')
    icon_span_wrapper['class'] = ['relative', 'flex', 'h-3', 'w-3']
    
    ping_span = soup.new_tag('span')
    dot_span = soup.new_tag('span')
    
    # Span para o texto
    text_span = soup.new_tag('span')
    text_span['class'] = ['text-white', 'font-sans', 'text-sm', 'md:text-base', 'font-medium', 'tracking-wide']

    if available > 0:
        # Estilo VERDE (Disponível)
        new_div['class'].extend(['bg-white/10', 'backdrop-blur-md', 'border', 'border-white/20'])
        
        ping_span['class'] = ['animate-ping', 'absolute', 'inline-flex', 'h-full', 'w-full', 'rounded-full', 'bg-green-400', 'opacity-75']
        dot_span['class'] = ['relative', 'inline-flex', 'rounded-full', 'h-3', 'w-3', 'bg-green-500']
        
        text_span.string = f"{available} Vagas Disponíveis para {year}"
    else:
        # Estilo VERMELHO (Esgotado)
        new_div['class'].extend(['bg-red-500/20', 'backdrop-blur-md', 'border', 'border-red-500/30'])
        
        # Sem animação de ping no vermelho, apenas o ponto
        dot_span['class'] = ['relative', 'inline-flex', 'rounded-full', 'h-3', 'w-3', 'bg-red-500']
        
        text_span.string = f"Vagas Esgotadas para {year}"

    # Montagem da estrutura
    if available > 0:
        icon_span_wrapper.append(ping_span)
    icon_span_wrapper.append(dot_span)
    
    new_div.append(icon_span_wrapper)
    new_div.append(text_span)
    
    return new_div

def update_json_ld_description(soup, available, year):
    """
    Atualiza a descrição dentro do JSON-LD.
    """
    scripts = soup.find_all('script', type='application/ld+json')
    updated = False
    
    for script in scripts:
        if not script.string: 
            continue
            
        try:
            data = json.loads(script.string)
            if 'description' in data:
                current_desc = data['description']
                
                # Limpeza da string anterior (remove parenteses de vagas antigos)
                # Divide pelo "(" e pega a primeira parte limpa
                clean_desc = current_desc.split(' (Vagas')[0].split(' (vagas')[0].strip()
                
                # Cria novo sufixo
                if available > 0:
                    new_suffix = f" (Vagas Disponíveis: {available} para {year})"
                else:
                    new_suffix = f" (Vagas Esgotadas para {year})"
                
                new_full_desc = clean_desc + new_suffix
                
                if current_desc != new_full_desc:
                    data['description'] = new_full_desc
                    # Dump seguro com unicode
                    script.string = json.dumps(data, indent=2, ensure_ascii=False)
                    updated = True
                    print("[SEO] Descrição JSON-LD atualizada.")
                    
        except json.JSONDecodeError:
            continue
            
    return updated

def update_faq_text(soup, room_type):
    """
    Procura textos no HTML que falem sobre o tipo de vaga e atualiza.
    """
    updated = False
    # Procura strings que contenham o texto âncora
    targets = soup.find_all(string=lambda text: text and "Atualmente as vagas são para" in text)
    
    for text_node in targets:
        # Lógica de string python pura
        content = str(text_node)
        prefix = "Atualmente as vagas são para "
        
        if prefix in content:
            # Reconstrói a frase. Assume que a frase termina em ponto ou fim da string.
            # Ex: "Atualmente as vagas são para quartos duplos."
            start_index = content.find(prefix)
            end_index = content.find(".", start_index)
            
            if end_index == -1:
                end_index = len(content)
            else:
                end_index += 1 # Inclui o ponto
            
            old_sentence = content[start_index:end_index]
            new_sentence = f"{prefix}{room_type}."
            
            if old_sentence != new_sentence:
                new_content = content.replace(old_sentence, new_sentence)
                text_node.replace_with(new_content)
                updated = True
                print(f"[FAQ] Texto atualizado: '{old_sentence}' -> '{new_sentence}'")

    return updated

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

        # 1. Atualizar Badge
        old_badge = soup.find(id="vacancy-badge")
        if old_badge:
            new_badge = generate_badge_html(soup, available, year)
            # Compara a representação string para ver se mudou
            if str(old_badge) != str(new_badge):
                old_badge.replace_with(new_badge)
                changes_made = True
                print("[UI] Badge de vagas atualizado.")
        else:
            print("[AVISO] Elemento id='vacancy-badge' não encontrado no HTML.")

        # 2. Atualizar FAQ
        if update_faq_text(soup, room_type):
            changes_made = True

        # 3. Atualizar JSON-LD
        if update_json_ld_description(soup, available, year):
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