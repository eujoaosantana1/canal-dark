r"""Move as 29 imagens baixadas do Gemini (pasta Downloads) para .\imagens com os nomes do roteiro.
As imagens foram baixadas na ordem do roteiro, então a ordem por data de modificação = ordem das chaves abaixo.
Uso: python tools\organizar_imagens.py   (rodar de dentro da pasta 04 - Epocas do Mexico)"""
import os, glob, shutil, sys, time

CHAVES = ["costa_cretacico", "asteroide_cielo", "impacto", "lago_mamuts", "noche_depredador", "trampa_mamut",
          "tenochtitlan_canoa", "chinampas", "mercado_tlatelolco", "templo_mayor", "llegada_calzada",
          "viruela_casa", "bergantines", "caida_ciudad", "ciudad_virreinal", "tromba_1629", "canoas_iglesia",
          "azotea_fuego", "calle_1915", "billetes_1915", "fila_comida", "hospital_tifo", "departamento_1985",
          "edificio_colapsado", "rescate_vecinos", "cdmx_hoy", "pozo_agua", "banqueta_hundida", "capas_valle"]

down = os.path.join(os.path.expanduser("~"), "Downloads")
desde = time.time() - 3 * 24 * 3600  # só arquivos dos últimos 3 dias
arqs = [f for f in glob.glob(os.path.join(down, "*")) if os.path.isfile(f)
        and f.lower().endswith((".png", ".jpg", ".jpeg", ".webp")) and "gemini" in os.path.basename(f).lower()
        and os.path.getmtime(f) > desde]
arqs.sort(key=os.path.getmtime)
print(f"Encontradas {len(arqs)} imagens do Gemini em {down}")
if len(arqs) < len(CHAVES):
    sys.exit(f"Esperava {len(CHAVES)}. Confira a pasta Downloads (o nome deve conter 'Gemini').")
if len(arqs) > len(CHAVES):
    print(f"Há {len(arqs)} imagens; usando as {len(CHAVES)} mais recentes.")
    arqs = arqs[-len(CHAVES):]
os.makedirs("imagens", exist_ok=True)
for k, f in zip(CHAVES, arqs):
    ext = os.path.splitext(f)[1].lower()
    dest = os.path.join("imagens", f"img_{k}{ext}")
    shutil.move(f, dest)
    print(f"{os.path.basename(f)} -> {dest}")
print("Pronto. Abra a pasta imagens e confira se cada nome bate com a cena.")
