import os
import subprocess

TRACKED_FILES = [
    'index.html',
    'fotos.html',
    'styles.css',
    'src/script.js',
    'src/script.min.js',
    'src/input.css'
]

SW_FILE = 'sw.js'

def get_git_timestamp(filename):
    """
    Retorna o timestamp (época) do último commit de um arquivo.
    """
    try:
        if not os.path.exists(filename):
            return 0
        # %ct = commit timestamp (unix format)
        result = subprocess.check_output(
            ['git', 'log', '-1', '--format=%ct', filename],
            text=True
        ).strip()
        return int(result) if result else 0
    except Exception as e:
        print(f"[GIT ERROR] Falha ao ler timestamp de {filename}: {e}")
        return 0

def get_latest_content_timestamp():
    """
    Pega o timestamp mais recente entre todos os arquivos rastreados.
    """
    latest_ts = 0
    updated_file = ""
    
    for filename in TRACKED_FILES:
        ts = get_git_timestamp(filename)
        if ts > latest_ts:
            latest_ts = ts
            updated_file = filename
            
    return latest_ts, updated_file

def increment_version_in_line(line):
    """
    Lógica pura de string para incrementar a versão sem Regex.
    Espera formato: const CACHE_NAME = 'santo-grau-v56';
    """
    if "const CACHE_NAME =" not in line:
        return line, False, 0

    try:
        # Divide a linha: ["const CACHE_NAME = ", "'santo-grau-v56';", ...]
        parts = line.split("=")
        variable_part = parts[1].strip() # "'santo-grau-v56';"
        
        # Remove ponto e vírgula final se houver
        clean_value = variable_part.rstrip(';')
        
        # Remove as aspas (simples ou duplas)
        quote_char = clean_value[0]
        content_value = clean_value.strip(quote_char) # "santo-grau-v56"
        
        # Separa o prefixo do número. Procura o último 'v'
        # Ex: "santo-grau-v" e "56"
        base_name, version_str = content_value.rsplit('-v', 1)
        
        new_version = int(version_str) + 1
        new_content_value = f"{base_name}-v{new_version}"
        
        # Reconstrói a linha
        # Mantém a indentação/espaçamento original da primeira parte
        new_line = f"{parts[0]}= {quote_char}{new_content_value}{quote_char};\n"
        
        return new_line, True, new_version
        
    except Exception as e:
        print(f"[ERRO PARSE] Falha ao processar linha: {line.strip()} -> {e}")
        return line, False, 0

def update_service_worker():
    if not os.path.exists(SW_FILE):
        print(f"[ERRO] {SW_FILE} não encontrado.")
        return False

    # 1. Verifica se precisa atualizar
    content_ts, triggered_by = get_latest_content_timestamp()
    sw_ts = get_git_timestamp(SW_FILE)

    # Se o conteúdo é mais antigo ou igual ao SW, não faz nada
    # (A menos que forçado, mas aqui seguimos a lógica do git)
    if content_ts <= sw_ts:
        print("[CACHE] sw.js já está atualizado em relação aos arquivos rastreados.")
        return False

    print(f"[CACHE] Detectada alteração em '{triggered_by}'. Atualizando sw.js...")

    # 2. Processa o arquivo linha por linha
    new_lines = []
    updated = False
    new_ver_num = 0

    try:
        with open(SW_FILE, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        for line in lines:
            # Procura pela linha do CACHE_NAME
            if "const CACHE_NAME =" in line:
                line, changed, ver = increment_version_in_line(line)
                if changed:
                    updated = True
                    new_ver_num = ver
            new_lines.append(line)

        # 3. Salva se houve mudança
        if updated:
            with open(SW_FILE, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            print(f"[SUCESSO] Cache atualizado para versão v{new_ver_num}")
            return True
        else:
            print("[AVISO] Não foi possível encontrar a linha 'const CACHE_NAME' para atualizar.")
            
    except Exception as e:
        print(f"[ERRO] Falha ao escrever {SW_FILE}: {e}")

    return False

if __name__ == "__main__":
    print("--- Iniciando Verificação de Cache ---")
    update_service_worker()