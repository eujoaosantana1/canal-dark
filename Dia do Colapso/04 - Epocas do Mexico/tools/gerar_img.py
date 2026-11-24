r"""Imagens 16:9 do episódio do México (¿Cuánto tiempo sobrevivirías en cada época de México?) pelo Gemini.
Rode de dentro da pasta imagens:
   python ..\tools\gerar_img.py gemini-3.1-flash-image [chaves]   (sem chaves = todas que ainda não existem)
Mesmo esquema do Ep. 03 (Épocas do Brasil): chave lida da pasta Canal Dark\chave_gemini.txt\*.txt."""
import json, base64, urllib.request, sys, concurrent.futures as cf, os, glob
K = open(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'chave_gemini.txt', '*.txt'))[0],
         encoding='utf-8-sig').read().strip().split()[0]
ESTILO = (" Cinematic documentary still, photorealistic, historically accurate clothing, architecture and objects,"
          " dramatic natural light, muted desaturated colors with cold shadows and warm practical light, 16:9 widescreen,"
          " no text, no letters, no logos, no watermarks, no gore, no blood, no dead bodies.")
P = {
 # 1 — Chicxulub
 "costa_cretacico": "A humid tropical coastline in the late Cretaceous, giant ferns and cycads, huge dragonflies, warm shallow turquoise sea, a herd of hadrosaurs walking on the beach in the distance, hazy morning light.",
 "asteroide_cielo": "The same Cretaceous beach seen from the ground, a single bright glowing point of light high in a clear blue sky with a faint trail, dinosaurs in the distance looking up, eerie calm before disaster.",
 "impacto": "View from far away on land of an enormous asteroid impact on the horizon over the sea, a blinding white flash, a rising wall of fire and dust, silhouettes of tall ferns and a fleeing dinosaur, apocalyptic sky.",
 # 2 — mamutes
 "lago_mamuts": "Ice age Basin of Mexico 15,000 years ago, a wide shallow lake surrounded by tall grass, snow-capped volcanoes in the background, a small herd of Columbian mammoths grazing at the shore, cold early morning mist.",
 "noche_depredador": "Night on the shore of an ice age lake, a lone person in rough animal skins crouching behind tall grass, the glowing eyes of a large saber-toothed cat in the darkness, moonlight, tense mood.",
 "trampa_mamut": "Ice age hunter-gatherers with torches and wooden spears driving a Columbian mammoth toward a large dug pit trap at the edge of a lake, dusk, dramatic firelight, no blood.",
 # 3 — Tenochtitlan 1519
 "tenochtitlan_canoa": "View from a canoe on Lake Texcoco in 1519 of the island city of Tenochtitlan, white stucco temples and the twin-shrine great pyramid, causeways crossing the water, many canoes, snow-capped volcanoes behind, bright morning.",
 "chinampas": "Aztec chinampas in 1519, narrow rectangular floating gardens with maize, beans and flowers separated by canals, farmers in white cotton poling canoes, willow trees at the edges, soft golden light.",
 "mercado_tlatelolco": "The great market of Tlatelolco in 1519, a huge crowded plaza with orderly rows of vendors selling maize, beans, cacao, turkeys, colorful textiles and pottery, people in Aztec cotton clothing, temple in the background.",
 "templo_mayor": "The Templo Mayor of Tenochtitlan in 1519 seen from the plaza at dusk, steep stairs to two shrines, smoke of copal incense, priests in dark robes at the top far away, crowds below, solemn and ominous, no violence.",
 "llegada_calzada": "November 1519, a column of Spanish conquistadors on horseback in steel armor and their Tlaxcalan allies entering the causeway to Tenochtitlan, Aztec nobles in feathered cloaks waiting, crowds on canoes watching, tense meeting.",
 # 4 — cerco 1521
 "viruela_casa": "Inside an Aztec house in 1520 during a smallpox epidemic, a sick person lying on a woven reed mat under a cotton blanket, a worried relative with a clay bowl of water, dim light through the doorway, somber, no visible sores.",
 "bergantines": "Spanish brigantines with sails and oars on Lake Texcoco in 1521 blockading Tenochtitlan, Aztec war canoes in the distance, smoke rising from the island city, overcast sky.",
 "caida_ciudad": "Ruined Tenochtitlan in August 1521, empty canals, smoke over damaged temples, silhouettes of exhausted people crossing a causeway with bundles, grey sky, sorrowful atmosphere, no bodies.",
 # 5 — 1629
 "ciudad_virreinal": "Colonial Mexico City in 1625, a wide plaza with a baroque cathedral under construction, stone palaces, straight streets, people in 17th century Spanish and indigenous clothing, lake and volcanoes on the horizon.",
 "tromba_1629": "Torrential night rainstorm over colonial Mexico City in September 1629, water flooding the cobblestone street, people struggling with lanterns, church bell tower, heavy rain streaks.",
 "canoas_iglesia": "Colonial Mexico City flooded in 1630, water two meters deep in the streets, people moving in wooden canoes past a baroque church and stone houses, people standing on rooftops and balconies, grey daylight.",
 "azotea_fuego": "A family on the flat rooftop of a colonial house in flooded Mexico City 1630, boiling water in a clay pot over a small fire, a canoe tied below, flooded street, evening light.",
 # 6 — 1915
 "calle_1915": "A street in downtown Mexico City in 1915, electric tram, stone buildings with iron balconies, revolutionary soldiers with sombreros and rifles on horseback, worried civilians, dusty afternoon light.",
 "billetes_1915": "Close-up of a hand holding a thick bundle of worthless revolutionary paper money with blurry unreadable designs over a nearly empty bakery counter in 1915 Mexico City, a baker shaking his head, no readable text.",
 "fila_comida": "A very long line of hungry people with baskets in a Mexico City street in 1915 waiting at a closed warehouse door, women in rebozos, children, soldiers keeping order, dust, somber.",
 "hospital_tifo": "A crowded improvised typhus ward in Mexico City in 1915, rows of iron beds, nurses in white uniforms, sick patients under blankets, tall windows, somber natural light.",
 # 7 — 1985
 "departamento_1985": "Interior of a small 1980s Mexico City apartment at 7 in the morning, a person tying shoes near the window, breakfast on the table, an analog wall clock, morning light, a cup of coffee trembling slightly.",
 "edificio_colapsado": "Downtown Mexico City in September 1985 after an earthquake, a collapsed 12-story concrete building with pancaked floors, dust in the air, emergency workers and neighbors in the street, 1980s cars, no bodies.",
 "rescate_vecinos": "Volunteers and neighbors in 1985 Mexico City forming a human chain passing buckets of rubble from a collapsed building, helmets and bare hands, one raising a fist for silence, dust and morning light, hopeful solidarity.",
 # 8 — hoje
 "cdmx_hoy": "Aerial view of modern Mexico City at golden hour, a vast urban sprawl to the horizon, skyscrapers, volcanoes in the distance, light haze.",
 "pozo_agua": "A deep water well pumping station inside a fenced lot in a Mexico City neighborhood, pipes and pumps, a cross-section cutaway view showing clay layers and the aquifer below the city, documentary illustration style.",
 "banqueta_hundida": "A Mexico City sidewalk visibly sunken and cracked, a colonial building leaning slightly, a lamp post tilted, new steps added at the base of an old stone monument plinth, daylight, documentary photo.",
 # fechamento
 "capas_valle": "Conceptual cutaway illustration of the Valley of Mexico as stacked geological and historical layers: at the bottom a Cretaceous sea, then an ice age lake with mammoths, then Aztec Tenochtitlan on the water, then a flooded colonial city, then the modern city on top, volcanoes behind, epic lighting.",
}

# Prompts para o gerador local (SDXL na RX 7600, Canal Dark\tools\gerar_img_local.py). O Gemini ignora estes três.
# Só ficam aqui as cenas testadas que o SDXL faz bem; as outras usam o P acima. Tenochtitlan NÃO funciona no SDXL (usar o Gemini).
ESTILO_LOCAL = ", cinematic documentary photograph, photorealistic, full color, natural morning light, highly detailed"
P_LOCAL = {
 "edificio_colapsado": "1985 Mexico City earthquake, pancake collapse, a concrete building whose floors fell onto each other, "
                       "a tall pile of tilted flat concrete slabs stacked like pancakes, the building reduced to a third of its height, "
                       "standing undamaged buildings on both sides, rescuers and neighbors climbing the pile, dust, 1980s cars",
}
NEG_LOCAL = {
 "edificio_colapsado": "black and white, monochrome, intact building only, empty street",
}


def gen(k):
    if os.path.exists(f"img_{k}.png") and len(sys.argv) <= 2:
        return k, "já existe"
    body = {"contents": [{"parts": [{"text": P[k] + ESTILO}]}],
            "generationConfig": {"responseModalities": ["IMAGE"], "imageConfig": {"aspectRatio": "16:9"}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{sys.argv[1]}:generateContent?key=" + K,
                                 data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    try:
        r = json.load(urllib.request.urlopen(req, timeout=180))
    except urllib.error.HTTPError as e:
        return k, f"ERRO {e.code} {e.read()[:250]}"
    except Exception as e:
        return k, f"ERRO {e}"
    for p in r.get("candidates", [{}])[0].get("content", {}).get("parts", []):
        if "inlineData" in p:
            open(f"img_{k}.png", "wb").write(base64.b64decode(p["inlineData"]["data"])); return k, "ok"
    return k, "sem imagem " + str(r)[:200]


ks = sys.argv[2:] or list(P)
with cf.ThreadPoolExecutor(6) as ex:
    for k, s in ex.map(gen, ks): print(k, s, flush=True)
