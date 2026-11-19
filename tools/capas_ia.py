"""Capas no modelo da capa do vídeo 02 (referencias/capa_modelo_72h.jpg).

1) Ilustração SEM TEXTO gerada pela API do Gemini (imagem), com a capa modelo + recortes do vídeo como referência.
2) Texto do topo aplicado aqui em Pillow (Luckiest Guy, destaque #FFD23F, resto branco, borda preta e sombra).

Uso:
  python tools/capas_ia.py gerar NN A [B C]   -> publicacao/capa_ia/ilustra_<L>_<n>.png (guarda todas as tentativas)
  python tools/capas_ia.py montar NN [A B C]  -> publicacao/capa_<L>.jpg + comparacao_capas.jpg (usa a última ilustração ou a escolhida em ESCOLHA)
"""
import glob, io, json, os, sys
from PIL import Image, ImageDraw, ImageFilter
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gemini_chave import ler_chave
from capas_estilo import fonte, hexrgb

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELO_IMG = 'gemini-3-pro-image'
REF = os.path.join(BASE, 'referencias', 'capa_modelo_72h.jpg')
AMARELO = '#FFD23F'

ESTILO = (
    "Create a 16:9 YouTube thumbnail illustration in EXACTLY the same art style as the first reference image: "
    "bright, saturated cartoon colors, thick black outlines on everything, simple round-headed cartoon people with big "
    "expressive eyes and exaggerated expressions, warm sunset sky gradient (lilac, pink, orange). No photorealism, "
    "no dark vignette, no black gradient. Rich, detailed, polished scene with the same quality and finish as the reference. "
    "IMPORTANT: leave the TOP-RIGHT area (roughly the top 35% of the right 60% of the image) as clean open sky or plain background "
    "with nothing important in it, because a big title will be placed there later. "
    "Do NOT write any title or caption. The only text allowed is short Portuguese words on signs, labels and storefronts inside the scene, "
    "spelled exactly as given. No logos of real brands. "
    "Use the first reference ONLY for the art style and quality level: do NOT copy its scene or composition (no 'Mercadinho do Jura', no plug, "
    "no old shopkeeper, not the same queue or street layout). Draw the new scene described below. "
    "Characters from the other references must be fully drawn inside the scene at a natural size, never pasted as a big floating head. "
    "The other reference images are the show's characters: keep their faces, hair, skin tone and clothes recognizable in the reference style.\n\n"
)

# Composição opcional ('divisao': True na capa): Universo x Terra com diagonal. NÃO é obrigatória;
# cada capa escolhe a cena que melhor vende o vídeo (o padrão é a qualidade/estilo da referência, não o layout).
DIVISAO = (
    "Composition: the frame is split by one bold DIAGONAL with a thick black border. "
    "The UPPER-LEFT side is the 'Universe': fluffy lilac-pink clouds and the celestial office worker (the 'Technician': "
    "brown skin, round glasses, black headset with microphone, golden halo, small white angel wings, white lab coat with blue lanyard), "
    "drawn exactly like the angel in the reference, doing an absurd action. "
    "The LOWER-RIGHT side is Earth: a Brazilian scene showing the consequence.\n\n"
)

# ---------------------------------------------------------------- vídeos
VIDEOS = {
    '10': {
        'pasta': '10 - Escala 6x1',
        'capas': {
            'A': {
                'divisao': True,
                'refs': ['josi_cansada.png', 'helio_preocupado.png'],
                'cena': (
                    "UNIVERSE SIDE: the Technician, sweating and determined, rips a giant page labelled 'SÁBADO' off a huge wall calendar "
                    "floating in the clouds; torn paper pieces fly. "
                    "EARTH SIDE: a small neighborhood supermarket at sunset, red sign 'SUPERMERCADO', metal shutter half down with a paper sign "
                    "'FECHADO POR FOLGA'. In front, Josi (second reference: brown skin, black hair in a bun, red cashier uniform with ID badge) walks "
                    "out of the store with a huge relieved smile, arms up. Behind her at the door, the bald manager Hélio (third reference: white shirt, "
                    "red tie, gray mustache) looks shocked. A few customers in the street stare surprised."
                ),
                'texto': [[('A ', 0), ('ÚLTIMA', 1)], [('SEMANA', 0)]], 'area': {'area': (585, 14, 1265, 290)},
            },
            'B': {
                'refs': ['josi_choque.png'],
                'cena': (
                    "NO split screen, NO angel, NO clouds: one single full-frame scene. A Brazilian commercial street at golden-hour sunset, seen "
                    "from slightly above, PACKED with people (at least 20 different cartoon people, varied skin tones, clothes and ages: workers in "
                    "uniforms, a delivery guy, a grandma, kids) in front of a row of closed shops with metal shutters down; colorful shop signs reading "
                    "'PADARIA', 'LOJA' and 'FARMÁCIA', and paper signs 'FECHADO' on the shutters. Some people celebrate with arms up, some look at their "
                    "phones confused, a man in an apron scratches his head. "
                    "FOREGROUND LEFT, big (from the waist up, about 45% of the image height): Josi (second reference: brown skin, black hair in a bun, "
                    "purple shirt) with hands on her cheeks and mouth wide open in shock, looking at the crowd. "
                    "The upper right is warm sunset sky with a few pink clouds, empty for the title."
                ),
                'texto': [[('FOLGA', 1), (' PRA', 0)], [('TODO MUNDO?!', 0)]],
            },
            'C': {
                'refs': ['josi_feliz.png', 'luana_arvore.png'],
                'cena': (
                    "NO split screen, NO angel, NO clouds: one single full-frame scene. A simple Brazilian public-school patio on a Saturday morning, "
                    "decorated with colorful paper bunting, a cloth banner on the wall reading 'FESTA DA PRIMAVERA'. "
                    "FOREGROUND LEFT, big (from the waist up, about 55% of the image height): Josi (second reference: brown skin, black hair in a bun, "
                    "purple shirt) in the audience, crying tears of joy with a huge smile, holding up her phone to film; the phone screen shows the girl. "
                    "BACKGROUND RIGHT (lower half of the image): a small wooden stage where a little girl (third reference: Luana, in a green tree "
                    "costume with red apples, face showing in the middle) proudly waves, with other parents around clapping and smiling. "
                    "The upper right is bright sky / top of the patio wall with bunting only, empty for the title."
                ),
                'texto': [[('52 ', 1), ('→', 1), (' 104', 1)], [('FOLGAS', 0)]],
            },
        },
    },
    '05': {
        'pasta': '05 - Pao Frances',
        'capas': {
            'A': {
                'refs': ['pao.png', 'nene_smug.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A charming Paris street at sunrise, the Eiffel Tower in the background "
                    "on the LEFT third. FOREGROUND CENTER-LEFT: a GIANT the Brazilian 'pão francês': a small oval crusty golden bread roll with ONE single slit on top (NOT a baguette) (second reference), as big as a car, glowing golden with steam, sitting "
                    "on the cobblestones like a monument. Around it, a crowd of 8 French cartoon people (berets, striped shirts, scarves, one with a "
                    "baguette under the arm) stare at it baffled, question marks over their heads. A café/bakery storefront on the right with a sign "
                    "'BOULANGERIE'. Next to the giant bread, Seu Nenê (reference 'nene': 67-year-old Brazilian baker, light skin, round glasses, gray mustache, gray hair on the sides, tall white chef hat, white shirt with red apron) (third reference) proudly presents it with open arms. "
                    "The upper right is soft pink-orange morning sky, empty for the title."
                ),
                'texto': [[('NÃO EXISTE', 1)], [('NA FRANÇA', 0)]],
            },
            'B': {
                'refs': ['luc_confuso.png', 'nene_smug.png', 'pao.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. Inside a cozy Parisian bakery full of baguettes and croissants on wooden "
                    "shelves, a chalkboard reading 'BOULANGERIE'. FOREGROUND LEFT, big (from the chest up, about 60% of the image height): "
                    "Monsieur Luc (reference 'luc': 60-year-old Parisian baker, light skin, gray mustache, gray hair on the sides, tall white chef hat, blue shirt with white apron) (second reference) holding ONE the Brazilian 'pão francês': a small oval crusty golden bread roll with ONE single slit on top (NOT a baguette) (fourth reference) up close to his face with bakery tongs, inspecting it with one "
                    "eyebrow raised and an exaggerated confused, suspicious expression, a question mark above his head. "
                    "MIDDLE RIGHT, smaller, behind the counter: Seu Nenê (reference 'nene': 67-year-old Brazilian baker, light skin, round glasses, gray mustache, gray hair on the sides, tall white chef hat, white shirt with red apron) (third reference) with a wicker basket full of these rolls, smiling smugly "
                    "with arms crossed. The upper right is the bakery's light upper wall / window with soft morning light, empty for the title."
                ),
                'texto': [[('QUE PÃO', 0)], [('É ESTE?', 1)]], 'area': {'area': (560, 40, 1265, 300)},
            },
            'C': {
                'refs': ['nene_smug.png', 'pao.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A Paris sidewalk on a sunny morning, the Eiffel Tower small in the far "
                    "background on the LEFT. A small Brazilian-style bread stand with a green and yellow awning and a hand-painted sign "
                    "'PÃO FRANCÊS' and a smaller sign 'DO NENÊ - GUARULHOS'. Behind the stand, Seu Nenê (reference 'nene': 67-year-old Brazilian baker, light skin, round glasses, gray mustache, gray hair on the sides, tall white chef hat, white shirt with red apron) (second reference) hands a warm the Brazilian 'pão francês': a small oval crusty golden bread roll with ONE single slit on top (NOT a baguette) "
                    "(third reference) to a happy French lady, with a big proud smile. A LONG QUEUE of at least 14 French cartoon people (berets, "
                    "striped shirts, scarves, a mime, a man with a poodle, a chic lady) curves along the sidewalk toward the camera, everybody excited, "
                    "some already biting the rolls with crumbs flying. The upper right is clear blue-and-pink sky, empty for the title."
                ),
                'texto': [[('GUARULHOS', 0)], [('x ', 1), ('PARIS', 1)]],
            },
        },
    },
    '07': {
        'pasta': '07 - Salario Minimo',
        'capas': {
            'A': {
                'refs': ['taina_cansada.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A tiny, simple one-room home in the outskirts of São Paulo at night "
                    "(bare brick wall partly painted, small kitchen corner, gas cylinder, a single hanging lamp). FOREGROUND LEFT, big (from the "
                    "waist up, about 60% of the image height): Tainá (reference 'taina': 26-year-old Brazilian woman, brown skin, black hair in two round puffs, teal cleaning-staff uniform with a white collar and an ID badge on a green lanyard) (second reference) sitting at a small table, tired and worried, holding a thin "
                    "fan of a few Brazilian real banknotes, a notebook with handwritten sums in front of her. On the table, a pile of bills with labels "
                    "'ALUGUEL', 'LUZ' and 'GÁS', and a PET-bottle piggy bank with a few coins. Behind her, her 7-year-old son Davi (brown skin, curly "
                    "black hair, striped t-shirt) peeks with big hopeful eyes. On the wall, a big paper calendar showing a full month of 30 days. "
                    "The upper right is the plain warm-lit wall, empty for the title."
                ),
                'texto': [[('R$ 1.621', 1)], [('POR UM MÊS', 0)]],
            },
            'B': {
                'refs': ['taina_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. BACKGROUND LEFT AND CENTER: a GIANT wall calendar page of one month, "
                    "numbers 1 to 30, every day from 1 to 21 crossed out with a red X, and day 22 circled in thick red marker. "
                    "FOREGROUND RIGHT, big (from the waist up, about 60% of the image height): Tainá (reference 'taina': 26-year-old Brazilian woman, brown skin, black hair in two round puffs, teal cleaning-staff uniform with a white collar and an ID badge on a green lanyard) (second reference) with eyes wide and mouth open "
                    "in shock, holding an open EMPTY wallet upside down; only a single coin and a little dust and a moth fly out of it. "
                    "Bright, saturated colors, warm light. The upper right area is plain light wall, empty for the title (keep the calendar on the "
                    "left two thirds)."
                ),
                'texto': [[('DIA 22:', 1)], [('ACABOU', 0)]],
            },
            'C': {
                'divisao': True,
                'refs': ['contador_smug.png', 'taina_triste.png'],
                'cena': (
                    "In this one the celestial worker on the UNIVERSE SIDE is NOT the Technician: it is the Universe Accountant (reference 'contador': bald old man with white hair on the sides, small round glasses, golden halo, navy suit, red tie) (second reference), smugly slamming a "
                    "giant red rubber stamp 'DEFERIDO' on a huge calendar floating in the clouds that has ONLY 18 days (numbers 1 to 18, the rest "
                    "torn off and flying away). "
                    "EARTH SIDE: a São Paulo street at sunset with a bus stop. People stare confused at a street calendar sign showing '18 DIAS'. "
                    "In the front, Tainá (reference 'taina': 26-year-old Brazilian woman, brown skin, black hair in two round puffs, teal cleaning-staff uniform with a white collar and an ID badge on a green lanyard) (third reference) holds a paper bill labelled 'ALUGUEL' with an annoyed, defeated face, while the landlord "
                    "(chubby friendly man with a mustache) smiles holding out his hand."
                ),
                'texto': [[('MÊS DE', 0)], [('18 DIAS', 1)]],
            },
        },
    },
    '04': {
        'pasta': '04 - Um Feriado por Ano',
        'capas': {
            'A': {
                'refs': ['rose_choque.png', 'calendario.png'],
                'cena': (
                    "One single full-frame scene, no split screen. LEFT TWO THIRDS: a GIANT wall calendar of the year '2026' (twelve small month "
                    "grids, like the third reference but huge), every red holiday crossed out with a thick red X, except ONE single red day that "
                    "glows bright, untouched. A giant red marker pen, held by a huge hand coming in from a cloud at the top left, is about to cross "
                    "out this last red day. "
                    "FOREGROUND RIGHT, big (from the waist up, about 60% of the image height): Rose (reference 'rose': 38-year-old Brazilian saleswoman, brown skin, short straight black hair, red store uniform with white collar and an ID badge on a red lanyard) (second reference) throws herself in front of "
                    "the last red day, arms wide open to protect it, mouth open shouting in desperation. "
                    "Bright warm colors. The upper right is plain light wall/sky, empty for the title."
                ),
                'texto': [[('SÓ ', 0), ('1', 1)], [('FERIADO', 1)]],
            },
            'B': {
                'refs': ['fabio_smug.png', 'rose_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A Brazilian furniture store street front in Santo André on a sunny day. "
                    "BACKGROUND: a huge billboard on top of the store showing Doutor Fábio (reference 'fabio': 52-year-old businessman, light skin, slicked-back black hair with gel, dark suit, red tie, smug half-closed eyes and grin)'s own grinning face holding a sofa, with the store name "
                    "'FÁBIO MÓVEIS' and a big banner 'ABERTO TODO DIA'. "
                    "FOREGROUND LEFT, big (from the waist up, about 60% of the image height): Doutor Fábio (reference 'fabio': 52-year-old businessman, light skin, slicked-back black hair with gel, dark suit, red tie, smug half-closed eyes and grin) (second reference) in person, with the same "
                    "smug grin, tearing a paper page labelled 'FERIADO' in half. "
                    "MIDDLE RIGHT, smaller: tired employees in red uniforms, among them Rose (reference 'rose': 38-year-old Brazilian saleswoman, brown skin, short straight black hair, red store uniform with white collar and an ID badge on a red lanyard) (third reference) staring at him in shock. "
                    "Keep the billboard on the left/center so the upper right is empty sky for the title."
                ),
                'texto': [[('FERIADO', 0)], [('CANCELADO', 1)]],
            },
            'C': {
                'refs': ['rose_feliz.png', 'lara_feliz.png', 'pote.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A beautiful Brazilian beach in Ubatuba at golden sunset, turquoise sea, "
                    "green hills, colorful beach umbrellas, a small beach guesthouse. FOREGROUND LEFT, big (from the waist up, about 60% of the "
                    "image height): Rose (reference 'rose': 38-year-old Brazilian saleswoman, brown skin, short straight black hair, red store uniform with white collar and an ID badge on a red lanyard) (second reference, wearing a simple sundress instead of the uniform) holds up a glass jar labelled "
                    "'PRAIA' (fourth reference), now EMPTY, smiling with happy tears. "
                    "MIDDLE RIGHT: her daughter Lara (reference 'lara': 10-year-old girl, brown skin, black hair in two round puffs, light blue t-shirt) (third reference, in a swimsuit) runs into the waves for the first time, arms up, laughing, water splashing. "
                    "The upper right is warm sunset sky, empty for the title."
                ),
                'texto': [[('O POTE', 0)], [('DA PRAIA', 1)]],
            },
        },
    },
    '08': {
        'pasta': '08 - Decimo Terceiro',
        'capas': {
            'A': {
                'refs': ['nonato_triste.png', 'cris_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. Inside a colorful toy and gift shop on Rua 25 de Março in São Paulo "
                    "in December: shelves PACKED with toys (dolls, balls, toy cars, plush bears), Christmas tinsel and lights, price tags. "
                    "But the shop is completely EMPTY of customers; through the big front window the famous shopping street outside is deserted, "
                    "a lonely tumbleweed rolling. A street sign 'RUA 25 DE MARÇO'. "
                    "FOREGROUND LEFT, big (from the waist up, about 55% of the image height): Seu Nonato (reference 'nonato': 61-year-old shop owner, light skin, bald with gray hair on the sides, round black glasses, gray mustache, blue shirt with a red vest) (second reference) leaning on the cash register, "
                    "sad and dejected, the cash drawer open and empty with a moth flying out. Next to him, Cris (reference 'cris': 34-year-old saleswoman, tan skin, short dark-brown hair with a side part, red store shirt with white collar and an ID badge on a yellow lanyard) (third reference) looks at the empty "
                    "street in shock. The upper right is the shop's upper wall with a 'FELIZ NATAL' garland at the very left, the right part empty "
                    "for the title."
                ),
                'texto': [[('UM ANO', 0)], [('SEM ', 0), ('13º', 1)]],
            },
            'B': {
                'divisao': True,
                'refs': ['noel_suspenso.png', 'nonato_triste.png'],
                'cena': (
                    "In this one the celestial worker on the UNIVERSE SIDE is NOT the Technician: it is the Universe Accountant (bald old man with white hair on the sides, small round glasses, golden halo, navy suit, red tie), cutting with giant golden scissors "
                    "a long festive banner that reads 'NATAL'; the pieces fall down from the clouds. "
                    "EARTH SIDE: the shop window of a toy store at night with Christmas lights turned off. Inside the window, a Santa Claus animatronic "
                    "(second reference) frozen stiff, wearing a hanging sign 'SUSPENSO'. Outside, two little kids and a grandmother press their faces "
                    "against the glass, sad. Snow-like paper confetti falling. Seu Nonato (reference 'nonato': 61-year-old shop owner, light skin, bald with gray hair on the sides, round black glasses, gray mustache, blue shirt with a red vest) (third reference) at the door, holding his head in despair."
                ),
                'texto': [[('SEM ', 0), ('13º', 1)], [('SEM ', 0), ('NATAL', 1)]],
            },
            'C': {
                'refs': ['cris_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. Close-up, FOREGROUND LEFT-CENTER, big (from the chest up, about 70% of "
                    "the image height): Cris (reference 'cris': 34-year-old saleswoman, tan skin, short dark-brown hair with a side part, red store shirt with white collar and an ID badge on a yellow lanyard) (second reference) with eyes bulging and mouth wide open in total shock, holding up a paper payslip "
                    "that reads '13º SALÁRIO' and below it 'R$ 0,00' in big red numbers. Behind her, a long credit card bill with the word 'FATURA' "
                    "unrolls to the floor, and a small Christmas tree in the corner of a toy shop. Bright saturated colors, comic shock lines around "
                    "her head. The upper right is plain warm background, empty for the title."
                ),
                'texto': [[('ACABOU', 0)], [('O ', 0), ('13º', 1), ('?!', 0)]],
            },
        },
    },
    '06': {
        'pasta': '06 - Neve no Brasil',
        'capas': {
            'A': {
                'divisao': True,
                'refs': ['chiquinha_feliz.png'],
                'cena': (
                    "UNIVERSE SIDE: the Technician, wide-eyed and sweating, shakes a GIANT snow globe that contains a small green map of Brazil; "
                    "snowflakes swirl inside and spill out of the globe down toward the Earth side. "
                    "EARTH SIDE: a hot tropical Brazilian city completely covered in thick white snow: palm trees and mango trees with snow on the "
                    "leaves, colorful low houses with snowy roofs, a street sign 'PRAÇA' and a beach-style kiosk 'ÁGUA DE COCO' buried in snow. "
                    "People in flip-flops, shorts and tank tops shiver and stare at the sky in disbelief; a kid builds a snowman with a coconut "
                    "head and a straw beach hat. In front, Dona Chiquinha (reference 'chiquinha': 54-year-old street vendor from Teresina, brown skin, dark-brown hair in a bun, yellow t-shirt with a white apron) (second reference) opens her arms in amazement catching snowflakes."
                ),
                'texto': [[('NEVE NO', 0)], [('BRASIL', 1)]],
            },
            'B': {
                'refs': ['chiquinha_feliz.png', 'carrinho_neve.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A sunny-colored town square in Teresina (northeast Brazil): mango trees, "
                    "a simple church tower, a bridge over a river in the background, colorful low houses — ALL covered in thick fresh white snow, "
                    "snowflakes falling under a pink-lilac sky. "
                    "FOREGROUND LEFT, big (from the waist up, about 60% of the image height): Dona Chiquinha (reference 'chiquinha': 54-year-old street vendor from Teresina, brown skin, dark-brown hair in a bun, yellow t-shirt with a white apron) (second reference) laughing with pure joy, "
                    "tongue out catching snowflakes, arms open; next to her her white styrofoam push-cart with the words 'DINDIN' and 'R$ 1,00' (reference 'carrinho') (third reference) topped with a pile of snow. Behind, locals in "
                    "flip-flops and shorts throw snowballs and slide on the snow. The upper right is the pink-lilac sky with falling snow only, "
                    "empty for the title."
                ),
                'texto': [[('NEVOU EM', 0)], [('TERESINA', 1)]],
            },
            'C': {
                'refs': ['chiquinha_frio_choque.png', 'carrinho_neve.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A snowy street in Teresina at noon. LEFT THIRD: a tall digital street "
                    "thermometer/clock sign, clearly showing '-3°C' in big glowing red digits, with icicles hanging from it. "
                    "FOREGROUND CENTER-RIGHT, big (from the waist up, about 60% of the image height): Dona Chiquinha (reference 'chiquinha': 54-year-old street vendor from Teresina, brown skin, dark-brown hair in a bun, yellow t-shirt with a white apron) (second reference) shivering hard, "
                    "teeth chattering, blue nose, wrapped in a thin colorful beach towel over her yellow t-shirt, wearing flip-flops in the snow, "
                    "mouth open in shock. Next to her, her white styrofoam push-cart with the words 'DINDIN' and 'R$ 1,00' (reference 'carrinho') (third reference) frozen solid with icicles. Background: mango trees and low houses "
                    "covered in snow, a man in a hammock frozen stiff on a porch. The upper right is pale winter sky, empty for the title."
                ),
                'texto': [[('-3°C', 1)], [('EM TERESINA', 0)]], 'area': {'area': (450, 8, 1268, 238)},
            },
        },
    },
    '09': {
        'pasta': '09 - Doze Vezes',
        'capas': {
            'A': {
                'refs': ['kaua_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A small simple bedroom in Belo Horizonte. A GIANT credit card bill "
                    "printout with the header 'FATURA' unrolls from the ceiling like an endless paper river, coiling all over the floor, the bed and "
                    "the furniture, covered in tiny lines of installments ending in '12x'. Floating around are cartoon items each with a small price "
                    "tag '12x': a generic smartphone, a generic black video game controller (not resembling any real brand), a sofa, a fridge, a motorcycle, a coxinha (Brazilian teardrop-shaped fried snack). Keep all floating items on the LEFT HALF and the lower part of the image, nothing in the upper right. "
                    "FOREGROUND LEFT, big (from the waist up, about 60% of the image height): Kauã (reference 'kaua': 24-year-old Brazilian guy, brown skin, spiky black hair, orange t-shirt) (second reference) half buried in the paper roll, "
                    "eyes bulging and mouth wide open in total shock, holding a credit card. "
                    "The upper right is the plain bedroom wall, empty for the title."
                ),
                'texto': [[('382', 1)], [('PARCELAS', 0)]],
            },
            'B': {
                'divisao': True,
                'refs': ['kaua_call_choque.png'],
                'cena': (
                    "In this one the celestial worker on the UNIVERSE SIDE is NOT the Technician: it is the Universe Accountant (bald old man with white hair on the sides, small round glasses, golden halo, navy suit, red tie), calmly slicing a GIANT green "
                    "banknote with the word 'SALÁRIO' into 12 thin strips with a big paper cutter; the strips fly away. "
                    "EARTH SIDE: a busy call center at night with rows of desks and computer screens. In front, big, Kauã (reference 'kaua': 24-year-old Brazilian guy, brown skin, spiky black hair, gray call-center polo shirt with an ID badge on an orange lanyard) (second reference) with "
                    "a headset, in total shock, holding up his smartphone; the phone screen, large and clearly readable, shows a bank app with "
                    "'DEPÓSITO' and 'R$ 183,33'. Coworkers in headsets turn to look."
                ),
                'texto': [[('SALÁRIO', 0)], [('EM 12x', 1)]],
            },
            'C': {
                'refs': ['coxinha.png', 'kaua_feliz.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A cozy Brazilian bakery counter (padaria) with a glass display full of "
                    "savory snacks. FOREGROUND CENTER-LEFT: ONE GIANT golden coxinha (Brazilian teardrop-shaped fried snack, first-reference shape "
                    "but realistic cartoon with crispy breadcrumb texture), huge and glowing, on a small plate, with a big price tag reading "
                    "'12x R$ 0,50'. Next to it a card machine whose screen says 'PARCELADO'. "
                    "BEHIND, to the left: Kauã (reference 'kaua': 24-year-old Brazilian guy, brown skin, spiky black hair, orange t-shirt) (third reference) leaning in with a huge delighted grin and sparkling eyes, holding his credit card "
                    "up like a trophy. A baker in a white cap behind the counter looks puzzled. "
                    "The upper right is the bakery's light upper wall, empty for the title."
                ),
                'texto': [[('ATÉ A', 0)], [('COXINHA', 1)]],
            },
        },
    },
    '03': {
        'pasta': '03 - Conta de Luz',
        'capas': {
            'A': {
                'refs': ['neide_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A simple, tidy living room of a seamstress in Mauá at night, lit by ONE "
                    "single weak bulb: an old sewing machine, a notebook with handwritten meter readings, a small hourglass, everything unplugged "
                    "(plugs hanging loose, a power strip switched off). FOREGROUND LEFT, big (from the waist up, about 60% of the image height): "
                    "Dona Neide (reference 'neide': 63-year-old seamstress, light-tan skin, gray hair in a bun, round glasses, pink blouse with white collar) (second reference) in total shock, eyes bulging, holding up an electricity bill that reads 'CONTA DE LUZ' and "
                    "'R$ 186,00' in big red numbers, with a red arrow pointing UP printed on it. The upper right is the plain wall, empty for the title."
                ),
                'texto': [[('ECONOMIZEI', 0)], [('E ', 0), ('SUBIU?!', 1)]],
            },
            'B': {
                'refs': ['neide_confusa.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A modest Brazilian living room. A giant electricity bill 'CONTA DE LUZ' "
                    "unfolds by itself out of a handbag on the sofa, and out of it walks a LINE of five serious cartoon bill collectors in suits, "
                    "each with a big ID badge reading, in order: 'ENERGIA', 'DISTRIBUIÇÃO', 'TRANSMISSÃO', 'ENCARGOS', 'IMPOSTO'; each holds a "
                    "slice of a paper bill. The line snakes from the left across the room. FOREGROUND RIGHT, big (from the waist up, about 55% of "
                    "the image height): Dona Neide (reference 'neide': 63-year-old seamstress, light-tan skin, gray hair in a bun, round glasses, pink blouse with white collar) (second reference), hands on her hips, confused and outraged. The upper right is the plain "
                    "wall, empty for the title."
                ),
                'texto': [[('A FILA', 0)], [('DA CONTA', 1)]],
            },
            'C': {
                'refs': ['gato_smug.png', 'neide_brava.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A Brazilian street at dusk with a concrete utility pole full of tangled "
                    "wires. At the end of a line of serious bill collectors in suits with badges (only their backs visible, on the left), the last "
                    "one in line is 'the Gato' (reference 'gato': shady guy with a black cap, black sunglasses and a dark t-shirt, smug grin) (second reference), WITHOUT a badge, tiptoeing sneakily while holding a stolen electrical wire pulled "
                    "straight from the pole, with sparks. FOREGROUND RIGHT, big (from the waist up): Dona Neide (reference 'neide': 63-year-old seamstress, light-tan skin, gray hair in a bun, round glasses, pink blouse with white collar) (third reference) pointing at him, "
                    "angry, catching him in the act. The upper right is dusk sky, empty for the title."
                ),
                'texto': [[('O ', 0), ('6º', 1)], [('DA FILA', 0)]],
            },
        },
    },
    '11': {
        'pasta': '11 - Apagao Nuvem',
        'capas': {
            'A': {
                'refs': ['rafa_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A small home office in a São Paulo apartment, morning. FOREGROUND "
                    "LEFT-CENTER, big (from the waist up, about 60% of the image height): Rafa (reference 'rafa': 27-year-old guy, light skin, short brown hair, round glasses, gray t-shirt) (second reference) in a dress shirt on top and "
                    "pajama shorts, headset on, staring in shock at his laptop, hands on his head. The laptop screen, large and readable, shows a "
                    "video-call window with empty grey squares, a spinning loading circle and the words 'CONECTANDO...'. Sticky notes everywhere, "
                    "a cold cup of coffee. Through the window, other apartment windows show other people also frozen in front of their screens. "
                    "No real software logos. The upper right is the plain wall, empty for the title."
                ),
                'texto': [[('TEAMS', 1)], [('CAIU', 0)]],
            },
            'B': {
                'divisao': True,
                'refs': ['jura_smug.png'],
                'cena': (
                    "UNIVERSE SIDE: the Technician, panicking, tries to hold up a GIANT server cabinet with blinking lights that is falling through "
                    "a hole in the clouds, cables snapping and sparking. "
                    "EARTH SIDE: a Brazilian city street: an office building with every window showing frustrated workers in front of frozen "
                    "screens, a bank with a sign 'SISTEMA FORA DO AR'. In front, a small corner shop with a red sign 'MERCADINHO' where "
                    "Seu Jura (reference 'jura': 71-year-old shopkeeper, bald with white hair on the sides, round glasses, white mustache, blue shirt with a tan vest) (second reference) smiles smugly at the door, holding an old paper notebook labelled 'FIADO' and a pencil, the only one "
                    "still working; a queue of people waits at his shop."
                ),
                'texto': [[('A NUVEM', 0)], [('CAIU', 1)]],
            },
            'C': {
                'refs': [],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. A busy airport terminal: the big departures board, the check-in "
                    "computers, the self-service kiosks, a bank ATM and a TV on the wall ALL show the same plain bright BLUE error screen with a big "
                    "white sad face drawn as a colon and a parenthesis (no logos, no other text). Dozens of travellers with suitcases look up "
                    "confused and frustrated, a pilot scratches his head, a cleaning lady leans on her mop, a kid presses a frozen kiosk. The blue "
                    "glow lights the whole scene. Keep the upper right as the terminal's high ceiling / glass roof with sky, empty for the title."
                ),
                'texto': [[('8,5 MILHÕES', 1)], [('DE TELAS AZUIS', 0)]],
            },
        },
    },
    '12': {
        'pasta': '12 - Sem Voos',
        'capas': {
            'A': {
                'refs': ['valdemar_choque.png', 'nene_choque.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. The taxi rank in front of a big Brazilian airport terminal. LEFT HALF: "
                    "a huge departures board 'PARTIDAS' where EVERY line shows a destination (RIO DE JANEIRO, BRASÍLIA, MANAUS, SALVADOR, RECIFE) and "
                    "the status 'CANCELADO' in red. The sky is empty of planes, only birds. A long row of white taxis with 'TÁXI' roof signs, all "
                    "waiting. FOREGROUND RIGHT, big (from the waist up, about 60% of the image height): Seu Valdemar (reference 'valdemar': 60-year-old taxi driver, tan skin, short gray hair, black mustache, blue polo shirt) (second reference) leaning on his taxi, "
                    "jaw dropped in shock, looking at the board. Behind him his colleague Nenê (reference 'nene': brown skin, red cap, green t-shirt) (third reference) also in shock. No airline logos. "
                    "The upper right is empty blue sky, empty for the title."
                ),
                'texto': [[('NENHUM', 0)], [('AVIÃO', 1)]],
            },
            'B': {
                'refs': ['aviao.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. Aerial-ish view of a Brazilian airport apron PACKED like a parking lot "
                    "with dozens of identical plain white passenger jets (like the reference plane: white with a light-blue stripe, NO airline logos "
                    "or names) parked wingtip to wingtip, some with weeds growing around the wheels, pigeons nesting on the wings, a dog sleeping on "
                    "the runway. On the terminal facade, a giant red electronic board reading '15 MIL VOOS CANCELADOS'. Ground staff in orange vests "
                    "sit on stairs bored, playing cards. Warm sunset light. Keep the upper right as clear sky, empty for the title."
                ),
                'texto': [[('7 DIAS', 1)], [('NO CHÃO', 0)]],
            },
            'C': {
                'refs': ['lucia_preocupada.png', 'caixa_orgao.png', 'relogio.png'],
                'cena': (
                    "One single full-frame scene, no split screen, no angel. Dramatic, dynamic close-up. FOREGROUND LEFT-CENTER, BIG "
                    "(from the chest up, about 75% of the image height, slightly low angle): Doutora Lúcia (second reference: doctor, light skin, "
                    "short brown hair, round glasses, white lab coat, blue lanyard) sweating, eyebrows up in panic, hugging tight a blue-and-white "
                    "cooler box with a red label 'TRANSPLANTE' and 'ÓRGÃO HUMANO' (third reference), clearly readable. Right behind her shoulder, a "
                    "BIG round wall clock (fourth reference) with hands blurring as they spin, red motion lines and small sweat drops flying. "
                    "Background: a busy hospital corridor in warm colors with nurses rushing and a stretcher, a window showing an empty airport "
                    "runway with no planes. The upper right is the light corridor ceiling, empty for the title."
                ),
                'texto': [[('SEM', 0)], [('TEMPO', 1)]], 'area': {'area': (690, 14, 1265, 290)},
            },
        },
    },
}

# ilustração escolhida por capa (nome do arquivo em capa_ia); se faltar, usa a mais recente
ESCOLHA = {('10', 'A'): 'ilustra_A_1.png'}


def pasta_pub(nn):
    return os.path.join(BASE, VIDEOS[nn]['pasta'], 'publicacao')


def gerar(nn, letra):
    from google import genai
    from google.genai import types
    v = VIDEOS[nn]; c = v['capas'][letra]
    pub = pasta_pub(nn); out = os.path.join(pub, 'capa_ia'); os.makedirs(out, exist_ok=True)
    partes = [Image.open(REF)]
    for r in c['refs']:
        p = os.path.join(pub, 'capa_assets', r)
        im = Image.open(p).convert('RGBA'); fundo = Image.new('RGBA', im.size, (255, 255, 255, 255))
        partes.append(Image.alpha_composite(fundo, im).convert('RGB'))
    prompt = ESTILO + (DIVISAO if c.get('divisao') else '') + c['cena']
    cli = genai.Client(api_key=ler_chave())
    resp = cli.models.generate_content(
        model=MODELO_IMG, contents=partes + [prompt],
        config=types.GenerateContentConfig(response_modalities=['IMAGE'],
                                           image_config=types.ImageConfig(aspect_ratio='16:9', image_size='2K')))
    n = len(glob.glob(os.path.join(out, f'ilustra_{letra}_*.png'))) + 1
    for part in resp.candidates[0].content.parts:
        if part.inline_data and part.inline_data.data:
            im = Image.open(io.BytesIO(part.inline_data.data)).convert('RGB')
            f = os.path.join(out, f'ilustra_{letra}_{n}.png'); im.save(f)
            print('OK', f, im.size); return f
    print('SEM IMAGEM', [getattr(p, 'text', None) for p in resp.candidates[0].content.parts])


# ---------------------------------------------------------------- texto
def seta(d, x, y, w, h, cor, bw):
    pts = [(x, y + h * .28), (x + w * .5, y + h * .28), (x + w * .5, y - h * .1), (x + w, y + h / 2),
           (x + w * .5, y + h * 1.1), (x + w * .5, y + h * .72), (x, y + h * .72)]
    d.line(pts + [pts[0]], fill=(17, 17, 17, 255), width=bw * 2, joint='curve')
    d.polygon(pts, fill=cor)


def titulo(linhas, area=(470, 14, 1262, 300), tam_max=150):
    """Monta o bloco de texto (2x) e devolve camada RGBA 1280x720 com sombra."""
    S = 2; x0, y0, x1, y1 = [a * S for a in area]
    def larg_seg(ft, s): return ft.size * 1.05 if s == '→' else ft.getlength(s)
    for tam in range(tam_max, 40, -4):
        ft = fonte('lg', tam * S); bw = max(8, tam // 11) * S
        l, t, r, b = ft.getbbox('M'); cap = b - t
        passo = cap + bw * 2 + 4 * S
        larg = [sum(larg_seg(ft, s) for s, _ in ln) + bw * 2 for ln in linhas]
        total = passo * len(linhas) + bw
        if max(larg) <= x1 - x0 and total <= y1 - y0: break
    lay = Image.new('RGBA', (1280 * S, 720 * S), (0, 0, 0, 0)); d = ImageDraw.Draw(lay)
    topo = y0 + ((y1 - y0) - total) / 2
    for i in reversed(range(len(linhas))):  # de baixo pra cima: acento de cima fica por cima
        ln, w = linhas[i], larg[i]
        base = topo + bw + cap + i * passo
        x = x0 + ((x1 - x0) - w) / 2 + bw
        for s, dest in ln:
            cor = hexrgb(AMARELO if dest else '#FFFFFF')
            if s == '→':
                aw = ft.size * 1.05
                seta(d, x + aw * .06, base - cap * .82, aw * .88, cap * .64, cor, bw); x += aw; continue
            d.text((x, base), s, font=ft, fill=cor, stroke_width=bw, stroke_fill=(17, 17, 17, 255), anchor='ls')
            x += ft.getlength(s)
    a = lay.split()[3]
    sombra = Image.new('RGBA', lay.size, (0, 0, 0, 0)); sombra.putalpha(a.point(lambda v: int(v * .65)))
    sombra = sombra.filter(ImageFilter.GaussianBlur(10))
    tot = Image.new('RGBA', lay.size, (0, 0, 0, 0)); tot.alpha_composite(sombra, (8 * S, 12 * S)); tot.alpha_composite(lay)
    return tot.resize((1280, 720), Image.LANCZOS)


def montar(nn, letras):
    pub = pasta_pub(nn); v = VIDEOS[nn]; feitos = []
    for L in letras:
        esc = ESCOLHA.get((nn, L))
        fs = sorted(glob.glob(os.path.join(pub, 'capa_ia', f'ilustra_{L}_*.png')), key=os.path.getmtime)
        f = os.path.join(pub, 'capa_ia', esc) if esc else fs[-1]
        im = Image.open(f).convert('RGB')
        r = 1280 / 720; w, h = im.size
        if w / h > r: nw = int(h * r); im = im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h))
        else: nh = int(w / r); im = im.crop((0, 0, w, nh))
        im = im.resize((1280, 720), Image.LANCZOS).convert('RGBA')
        cfg = v['capas'][L]
        im.alpha_composite(titulo(cfg['texto'], **cfg.get('area', {})))
        dst = os.path.join(pub, f'capa_{L}.jpg'); im.convert('RGB').save(dst, quality=92)
        print('capa', dst, os.path.getsize(dst) // 1024, 'KB  <-', os.path.basename(f)); feitos.append(dst)
    # comparação: as 3 capas lado a lado + miniatura
    caps = [Image.open(os.path.join(pub, f'capa_{L}.jpg')) for L in 'ABC' if os.path.exists(os.path.join(pub, f'capa_{L}.jpg'))]
    fol = Image.new('RGB', (1920, 360 * len(caps) + 20 * (len(caps) + 1)), (30, 30, 30)); d = ImageDraw.Draw(fol)
    for i, (L, c) in enumerate(zip('ABC', caps)):
        y = 20 + i * 380
        fol.paste(c.resize((640, 360), Image.LANCZOS), (20, y))
        fol.paste(c.resize((320, 180), Image.LANCZOS), (700, y))
        fol.paste(c.resize((168, 94), Image.LANCZOS), (1040, y))
        d.text((1230, y + 10), f'CAPA {L}', font=fonte('lg', 60), fill=(255, 210, 63))
    fol.save(os.path.join(pub, 'comparacao_capas.jpg'), quality=90)


if __name__ == '__main__':
    acao, nn, *letras = sys.argv[1:]
    letras = letras or ['A', 'B', 'C']
    if acao == 'gerar':
        for L in letras: gerar(nn, L)
    else:
        montar(nn, letras)
