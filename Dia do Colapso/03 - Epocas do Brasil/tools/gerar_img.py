r"""Imagens 16:9 do episódio 03 (Épocas do Brasil) pelo Gemini. Rode de dentro da pasta imagens:
   python ..\tools\gerar_img.py gemini-3.1-flash-image [chaves]   (sem chaves = todas que ainda não existem)"""
import json, base64, urllib.request, sys, concurrent.futures as cf, os, glob
K = open(glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'chave_gemini.txt', '*.txt'))[0],
         encoding='utf-8-sig').read().strip().split()[0]
ESTILO = (" Cinematic documentary still, photorealistic, historically accurate clothing and objects, dramatic natural light,"
          " muted desaturated colors with cold shadows and warm practical light, 16:9 widescreen, no text, no letters,"
          " no logos, no watermarks, no gore.")
P = {
 # gancho
 "despertar": "A person waking up startled on a wooden floor, seen from above, half of the image in a 1500s ship hold and the other half dissolving into a modern dark bedroom, dust in a beam of light, mysterious mood.",
 # 1500
 "nau_porao": "Cramped dark hold of a Portuguese carrack in 1500, sailors sleeping among barrels and ropes, a single lantern, damp wooden beams, ship tilting.",
 "nau_conves": "Deck of a Portuguese carrack in 1500 at dawn on the open Atlantic, thin tired sailors in rough linen, square sails with a red cross, other ships of the fleet on the horizon.",
 "nau_comida": "Close-up of a sailor's ration on a 1500 ship: hard ship biscuit with weevils, a slab of salted meat, a wooden cup of dark wine, a cracked water barrel, rough wooden table, candle light.",
 "nau_neblina": "A Portuguese carrack fading into thick fog on a calm sea in 1500, seen from another ship, ghostly silhouette, eerie silence.",
 "nau_tempestade": "Four Portuguese carracks caught in a violent storm off the Cape of Good Hope in 1500, giant waves, torn sails, lightning, one ship capsizing in the distance.",
 "terra_vista": "View from a 1500 caravel of a lush green coastline with a tall rounded mountain in Bahia, Brazil, white sand beach, sailors pointing, golden afternoon light.",
 # 1700
 "bateia": "A gold prospector in 1700 Brazil crouching in a cold muddy creek, panning gravel in a wooden pan, a few gold flakes shining, bare deforested hills behind, colonial clothing.",
 "arraial": "A chaotic 1700 gold mining camp in the hills of Minas Gerais, Brazil, wattle and daub shacks, smoke, crowds of prospectors, bare red hills, overcast sky.",
 "fome_minas": "A starving gold miner sitting against a shack in 1700 Brazil holding a single dry ear of corn, a small leather pouch of gold beside him, empty clay pots, bleak light.",
 "farinha_ouro": "A colonial trader in 1700 weighing gold dust on a small brass balance in exchange for one sack of cassava flour, hungry miners watching, dim wooden store.",
 "vila_rica": "Colonial town of Vila Rica in 1720 on steep hills, a crowd of angry townspeople with torches in a muddy street at night, colonial soldiers on horseback.",
 # 1808
 "corte_baia": "Guanabara Bay, Rio de Janeiro, March 1808, a fleet of Portuguese tall ships arriving, small boats rowing to the docks, colonial city on the shore, Sugarloaf mountain in the background.",
 "porta_pr": "A heavy wooden door of a colonial house in Rio de Janeiro 1808, an official in a tricorn hat painting two white letters P R on it, the worried family watching from inside.",
 "rio_rua": "A narrow unpaved street in colonial Rio de Janeiro 1808, two-story houses with balconies, crowded with street vendors, enslaved porters and newly arrived Portuguese nobles in European clothes, hot sun.",
 "rio_noite": "Night in colonial Rio de Janeiro 1808, men carrying wooden barrels on their heads walking toward the beach, seen from behind in the moonlight, respectful and somber, mud street, distant lanterns.",
 # 1865
 "alistamento": "Recruitment in a Brazilian town square in 1865, young men in civilian clothes lining up at a table with an imperial officer, a band and a flag, families watching.",
 "acampamento": "Brazilian imperial army camp in the swamps of Paraguay in 1866, rows of white tents in mud, soldiers in blue uniforms, heavy rain, campfires, palm trees.",
 "batalha": "Wide shot of a 19th-century battlefield in the marshes of Paraguay in 1866, smoke from muskets and cannons, infantry lines in blue, chaotic but not gory.",
 "hospital_campanha": "Field hospital tent in the Paraguay war 1867, sick soldiers lying on straw mats, a doctor with a lantern, buckets of water, exhausted nurses, somber light.",
 # 1877
 "sertao_seco": "The dry sertão of Ceará, Brazil in 1877 under a white scorching sky, cracked earth, dead caatinga trees, a thin cow lying down, a dry riverbed.",
 "retirantes": "A family of drought refugees walking on a dusty road in the Ceará sertão in 1877, bundles on their heads, barefoot children, a thin donkey, heat haze.",
 "abarracamento": "Overcrowded refugee camp of straw and branch huts on the outskirts of Fortaleza in 1878, thousands of drought refugees, smoke, dust, no water, somber atmosphere.",
 "cemiterio": "A colonial cemetery outside Fortaleza at dusk in 1878, rows of simple wooden crosses and fresh mounds of earth, tired gravediggers with shovels resting, vultures circling in the sky, no bodies visible.",
 # 1918
 "sp_1918": "A street in downtown São Paulo in November 1918 almost empty, a stopped tram, a few people with cloth masks, closed shops, gray drizzle, early 20th century buildings.",
 "hospital_1918": "A crowded 1918 hospital ward in São Paulo during the Spanish flu, rows of iron beds, nurses in white uniforms and caps, sick patients, natural light from tall windows.",
 "casa_1918": "Interior of a simple immigrant home in São Paulo 1918, a person lying sick in bed under heavy blankets, a relative with a bowl of soup, oil lamp, worried atmosphere.",
 # 1957
 "cerrado_obra": "Construction of Brasília in 1957, red dust of the cerrado, concrete skeletons of modernist buildings, cranes, old trucks, hundreds of workers, wide blue sky.",
 "andaime": "Workers on high wooden scaffolding at night during the construction of Brasília in 1958, floodlights, concrete pouring, dangerous heights, dust in the light, full color, warm orange floodlights against a deep blue night.",
 "acampamento_obra": "Wooden workers' camp during the construction of Brasília in 1959, long barracks, a canteen with metal plates, tired construction workers in dusty clothes, red dirt.",
 # hoje
 "sp_apagao": "São Paulo skyline at night during a total blackout, almost every apartment window completely black, only three or four windows with a faint candle glow, streets dark, traffic lights off, cars with headlights.",
 "agua_galoes": "Residents of a São Paulo apartment building in a modern dark hallway carrying plastic water jugs up the stairs during a blackout, phone flashlights, tired faces.",
 "geladeira": "A modern kitchen during a power outage, open dark refrigerator with no light inside, melting ice, food going bad, a phone flashlight lighting the scene.",
 "kit_72h": "An emergency kit arranged on a wooden kitchen table: bottles of water, unlabeled canned food, a clear glass jar of rice, a plain white first aid box with only a red cross and no words, plain medicine boxes with no writing, a flashlight, batteries, a small radio and a small closed coin purse, nothing written anywhere, no labels, no banknotes, soft window light.",
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
