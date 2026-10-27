#!/usr/bin/env python3
"""Importador de la Biblioteca Inteligente Fit-K -> src/lib/fitkLibrary.ts

El Excel es la fuente de verdad (FIT-K_Instrucciones.docx, sec. 19 y 23).
Este script NO interpreta metodología: normaliza las hojas "Biblioteca",
"Variantes", "Matriz muscular" y "Diccionario muscular" y genera el módulo
TypeScript que usa el Motor.

Uso:
    python3 scripts/import-biblioteca.py [ruta.xlsx]
    (por defecto: ../FIT-K_Biblioteca_Inteligente_v2.17_Auditoria_Matriz_Muscular.xlsx)

Contradicciones o datos imposibles NO se resuelven en silencio: se abortan
(si son ambiguos) o quedan registradas en LIBRARY_META.warnings.
"""
import itertools
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = ROOT.parent / 'FIT-K_Biblioteca_Inteligente_v2.17_Auditoria_Matriz_Muscular.xlsx'
OUT = ROOT / 'src' / 'lib' / 'fitkLibrary.ts'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL_NS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'

# Categorías de equipamiento que entiende el Motor (Hard Filter de equipo).
# 'corporal' siempre está disponible. Material específico de gimnasio sin
# categoría propia (hack squat, belt squat, tib bar, ab wheel...) cuenta como
# 'maquina': sin perfil de equipo (= gimnasio completo) está disponible, y en
# casa o al aire libre no se prescribe material que quizá no existe.
EQUIPMENT_TOKENS = {
    'barra': 'barra', 'barra libre': 'barra', 'barra recta': 'barra', 'ez': 'barra', 'barra ez': 'barra',
    'barra-ez': 'barra', 'barra anclada': 'barra', 'landmine': 'barra', 'disco': 'barra', 'discos': 'barra',
    'barra dominadas': 'dominadas', 'barra agarre neutro': 'dominadas',
    'mancuerna': 'mancuernas', 'mancuernas': 'mancuernas', 'kettlebell': 'mancuernas',
    'carga': 'mancuernas', 'carga opcional': 'corporal', 'carga sobre rodillas': 'mancuernas',
    'máquina': 'maquina', 'maquina': 'maquina', 'máquina específica': 'maquina',
    'máquina/asistencia segura': 'maquina', 'asistencia segura': 'maquina', 'máquina asistida': 'maquina',
    'polea específica': 'polea', 't-bar': 'maquina', 'hack squat': 'maquina', 'belt squat': 'maquina',
    'tib bar': 'maquina', 'palanca': 'maquina', 'silla romana': 'maquina', "captain's chair": 'maquina',
    'ab wheel': 'maquina',
    'polea': 'polea', 'poleas': 'polea', 'polea baja': 'polea', 'cable': 'polea', 'banda segura': 'banda',
    'cuerda': 'polea', 'cuff': 'polea',
    'smith': 'smith', 'multipower': 'smith', 'smith compatible': 'smith',
    'prensa': 'prensa', 'banco': 'banco', 'banco predicador': 'banco', 'banco inclinado': 'banco',
    'banco declinado': 'banco', 'banco 45°': 'banco', 'cajón': 'banco', 'rack': 'rack',
    'paralelas': 'paralelas', 'asistida': 'paralelas',
    'banda': 'banda', 'banda elástica': 'banda', 'minibanda': 'banda', 'ghd': 'ghd',
    'trx': 'suspension', 'anillas': 'suspension',
    'peso corporal': 'corporal', 'pared': 'corporal', 'asistencia': 'corporal', 'asiento': 'corporal',
    'apoyo': 'corporal', 'resistencia manual': 'corporal',
}

LEVELS = {'Mínimo', 'Bajo', 'Baja', 'Bajo-Medio', 'Baja-Media', 'Medio-Bajo', 'Media-Baja', 'Medio', 'Media',
          'Medio-Alto', 'Media-Alta', 'Alto', 'Alta', 'Muy alto', 'Muy alta', 'Variable', 'No prioritario'}

MATRIX_LEVELS = {'P', 'S', 'C', 'E'}

# IDs de versiones anteriores de la Biblioteca que siguen siendo EL MISMO
# ejercicio en esta versión: renombrados, o fusionados como configuración de
# otra ficha según el propio Excel (Variantes / reglas LIB-*). Sirven para
# leer planes, historial, exclusiones y preferencias guardados con el ID
# viejo. Los ejercicios que la Biblioteca saca del núcleo (nordic, dead bug,
# clamshell...) NO se mapean: no son equivalentes y el Motor elige otro.
LEGACY_ID_ALIASES = {
    # v1.8 -> v2.17: renombrados
    'shoulder_facepull': 'back_face_pull',
    'quad_squat': 'legs_barbell_squat',
    'quad_front_squat': 'legs_front_squat',
    'quad_goblet_squat': 'legs_goblet_squat',
    'quad_hack': 'legs_hack_squat',
    'quad_legpress': 'legs_leg_press',
    'quad_extension': 'legs_leg_extension',
    'leg_bulgarian': 'legs_bulgarian_split_squat',
    'leg_reverse_lunge': 'legs_reverse_lunge',
    'leg_walking_lunge': 'legs_walking_lunge',
    'leg_stepup': 'legs_step_up',
    'ham_rdl': 'hamstrings_romanian_deadlift',
    'ham_single_rdl': 'hamstrings_single_leg_rdl',
    'ham_good_morning': 'hamstrings_good_morning',
    'ham_seated_curl': 'hamstrings_seated_leg_curl',
    'ham_lying_curl': 'hamstrings_lying_leg_curl',
    'ham_single_curl': 'hamstrings_standing_leg_curl',
    'ham_45_extension': 'hamstrings_45deg_hip_extension',
    'glute_hipthrust': 'glutes_hip_thrust',
    'glute_kickback': 'glutes_cable_kickback',
    'glute_abduction_machine': 'glutes_abduction_machine',
    'glute_abduction_cable': 'glutes_cable_abduction',
    'adductor_machine': 'adductors_machine',
    'adductor_cable': 'adductors_cable_adduction',
    'calf_standing': 'calves_standing_raise',
    'calf_seated': 'calves_seated_raise',
    'calf_legpress': 'calves_leg_press_raise',
    # v1.8 -> v2.17: ahora configuraciones de otra ficha
    'quad_single_legpress': 'legs_leg_press',          # LIB-QUAD-SCOPE-083
    'quad_extension_single': 'legs_leg_extension',     # Variantes: bilateral / unilateral
    'calf_single_standing': 'calves_standing_raise',   # Variantes: unilateral en escalón
    'glute_single_hipthrust': 'glutes_hip_thrust',     # LIB-GLUTE-SCOPE-087
    'glute_bridge': 'glutes_hip_thrust',               # LIB-GLUTE-SCOPE-087
    'glute_frog_pump': 'glutes_hip_thrust',            # LIB-GLUTE-SCOPE-087
    'back_supinated_pulldown': 'back_lat_pulldown',    # Variantes: prono / neutro / supino
    'back_neutral_pullup': 'back_pullup',              # Variantes: pronada / neutra / supina
    'back_chinup': 'back_pullup',
}


def read_sheets(path):
    z = zipfile.ZipFile(path)
    sst = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
            sst.append(''.join(t.text or '' for t in si.findall('.//m:t', NS)))
    wb = ET.fromstring(z.read('xl/workbook.xml'))
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))}
    sheets = {}
    for sh in wb.findall('m:sheets/m:sheet', NS):
        target = rels[sh.get(REL_NS)]
        p = 'xl/' + target if not target.startswith('/') else target[1:]
        rows = []
        for row in ET.fromstring(z.read(p)).findall('.//m:sheetData/m:row', NS):
            cells = {}
            for c in row.findall('m:c', NS):
                col = re.match(r'[A-Z]+', c.get('r')).group(0)
                v = c.find('m:v', NS)
                if v is not None:
                    val = sst[int(v.text)] if c.get('t') == 's' else v.text
                else:
                    it = c.find('m:is/m:t', NS)
                    val = it.text if it is not None else ''
                cells[col] = (val or '').strip()
            rows.append((int(row.get('r')), cells))
        sheets[sh.get('name')] = rows
    return sheets


def as_records(rows):
    header_row = rows[0][1]
    header = {col: name for col, name in header_row.items() if name}
    out = []
    for line, cells in rows[1:]:
        rec = {name: cells.get(col, '') for col, name in header.items()}
        if any(rec.values()):
            out.append((line, rec))
    return list(header.values()), out


def parse_range(text, field, ex_id, warnings):
    t = text.strip()
    nums = [int(n) for n in re.findall(r'\d+', t)]
    spec = {
        'min': None, 'max': None,
        'unit': 'seconds' if re.search(r'\d\s*s\b', t) else ('steps' if 'paso' in t else 'reps'),
        'perSide': '/lado' in t,
        'byCapacity': t.lower().startswith('según'),
        'openEnded': t.endswith('+'),
        'raw': t,
    }
    if len(nums) >= 2:
        spec['min'], spec['max'] = nums[0], nums[1]
    elif len(nums) == 1:
        spec['min'] = spec['max'] = nums[0]
    elif not spec['byCapacity']:
        warnings.append(f'{ex_id}: {field} "{t}" no tiene números ni es "Según ..."')
    return spec


# Sinónimos que en el Excel van unidos con '/' pero son UNA sola pieza de
# equipo: "Barra/EZ+banco" = (barra recta o EZ) + banco, no "barra" o "EZ+banco".
EQUIPMENT_SYNONYMS = [(r'barra\s*/\s*ez', 'barra'), (r'cajón\s*/\s*banco', 'banco'), (r'\s+o\s+', '/')]

# Cadenas cuyo agrupamiento no se deduce de la sintaxis: "Polea baja+cuff/Banda"
# es (polea con tobillera) o banda, no polea + (tobillera o banda).
EQUIPMENT_OVERRIDES = {
    'Polea baja+cuff/Banda': [['polea'], ['banda']],
}


def equipment_token(tok, ex_id, warnings):
    tok = tok.strip().lower()
    if tok.endswith(' opcional'):
        return 'corporal'  # "banco opcional", "arnés-polea opcional": no es requisito
    cat = EQUIPMENT_TOKENS.get(tok)
    if cat is None:
        # tolera sufijos ("máquina específica", "máquina high row", "polea baja"...)
        cat = next((v for k, v in sorted(EQUIPMENT_TOKENS.items(), key=lambda kv: -len(kv[0]))
                    if tok.startswith(k)), None)
    if cat is None:
        warnings.append(f'{ex_id}: equipo "{tok}" desconocido -> tratado como "maquina"')
        cat = 'maquina'
    return cat


def parse_equipment(text, load_source, ex_id, warnings):
    """Requisitos alternativos: basta con cumplir UNA lista.

    '+' une piezas necesarias y '/' separa alternativas dentro de cada pieza:
    'Barra/Smith/mancuernas+banco' -> [['barra','banco'], ['smith','banco'], ['mancuernas','banco']].
    """
    if text in EQUIPMENT_OVERRIDES:
        return EQUIPMENT_OVERRIDES[text]
    t = text
    for pattern, repl in EQUIPMENT_SYNONYMS:
        t = re.sub(pattern, repl, t, flags=re.I)
    # En ejercicios de carga corporal con lastre opcional, la mancuerna no es requisito.
    optional_load = 'opcional' in load_source.lower()
    pieces = [[a.strip() for a in seg.split('/') if a.strip()] for seg in t.split('+') if seg.strip()]
    options = []
    for combo in itertools.product(*pieces):
        req = []
        for tok in combo:
            cat = equipment_token(tok, ex_id, warnings)
            if optional_load and cat == 'mancuernas' and len(pieces) > 1:
                continue
            if cat != 'corporal' and cat not in req:
                req.append(cat)
        if req not in options:
            options.append(req)
    # Una alternativa sin requisitos ya cubre a las demás.
    return [[]] if [] in options else options


def leading_int(text):
    m = re.match(r'\s*(\d+)', text or '')
    return int(m.group(1)) if m else None


def main():
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_XLSX
    sheets = read_sheets(path)
    warnings = []

    header, records = as_records(sheets['Biblioteca'])
    # --- duplicados -----------------------------------------------------
    by_id, order, dup_rows = {}, [], []
    for line, rec in records:
        ex_id = rec.get('ID', '').strip()
        if not ex_id:
            continue
        if ex_id in by_id:
            first_line, first = by_id[ex_id]
            diffs = [k for k in header if k != 'Notas Motor' and first.get(k, '') != rec.get(k, '')]
            if diffs:
                sys.exit(f'ERROR: ID duplicado con datos distintos: {ex_id} (filas {first_line} y {line}): {diffs}')
            dup_rows.append(line)
            continue
        by_id[ex_id] = (line, rec)
        order.append(ex_id)
    if dup_rows:
        warnings.append(
            f'{len(dup_rows)} filas duplicadas idénticas ignoradas (filas {min(dup_rows)}-{max(dup_rows)}). '
            f'La hoja tiene {len(records)} filas pero solo {len(order)} fichas únicas.')

    # --- diccionario y matriz muscular ----------------------------------
    _, drecs = as_records(sheets['Diccionario muscular'])
    muscles = {}
    for line, d in drecs:
        code = d.get('Código músculo', '')
        if not code:
            continue
        if code in muscles:
            sys.exit(f'ERROR: código muscular duplicado en el Diccionario: {code} (fila {line})')
        muscles[code] = {
            'code': code, 'name': d.get('Músculo / región', ''), 'group': d.get('Grupo', ''),
            'type': d.get('Tipo', ''), 'motorUse': d.get('Uso Motor', ''), 'notes': d.get('Notas V1', '') or None,
        }

    _, mrecs = as_records(sheets['Matriz muscular'])
    matrix = {}
    for line, r in mrecs:
        ex_id, code, lvl = r.get('Exercise ID', ''), r.get('Músculo código', ''), r.get('Nivel', '')
        if not ex_id:
            continue
        if ex_id not in by_id:
            sys.exit(f'ERROR: Matriz muscular fila {line}: "{ex_id}" no existe en la Biblioteca')
        if code not in muscles:
            sys.exit(f'ERROR: Matriz muscular fila {line}: código "{code}" no está en el Diccionario')
        if lvl not in MATRIX_LEVELS:
            sys.exit(f'ERROR: Matriz muscular fila {line}: nivel "{lvl}" no es P/S/C/E')
        directness = r.get('Directitud', '')
        if directness not in ('Directo', 'Indirecto'):
            sys.exit(f'ERROR: Matriz muscular fila {line}: directitud "{directness}" no es Directo/Indirecto')
        entries = matrix.setdefault(ex_id, [])
        if any(e['code'] == code for e in entries):
            sys.exit(f'ERROR: Matriz muscular fila {line}: {ex_id} repite el músculo {code}')
        entries.append({
            'code': code, 'level': lvl, 'direct': directness == 'Directo',
            'function': r.get('Función / rol muscular', ''), 'bias': r.get('Sesgo / región', '') or None,
            'confidence': r.get('Confianza V1', ''), 'notes': r.get('Notas Motor', '') or None,
        })

    exercises = []
    for ex_id in order:
        line, r = by_id[ex_id]
        for f in ('Accesibilidad técnica', 'Fuerza requerida', 'Escalabilidad', 'Estabilidad', 'Fatiga local',
                  'Demanda sistémica', 'Progresabilidad', 'Adecuación cerca del fallo', 'Setup', 'Coste temporal', 'Densidad'):
            if r.get(f, '') not in LEVELS:
                warnings.append(f'{ex_id}: {f} con valor no reconocido "{r.get(f, "")}"')
        contrib = matrix.get(ex_id, [])
        if not any(c['level'] == 'P' for c in contrib):
            sys.exit(f'ERROR: {ex_id} no tiene músculo principal (P) en la Matriz muscular')
        roles = [x.strip() for x in r['Rol compatible'].split('/') if x.strip()]
        secondary = r.get('Secundarios / contribución heurística', '')
        exercises.append({
            'id': ex_id,
            'name': r['Ejercicio'],
            'block': r['Bloque'],
            'family': r['Familia'],
            'movementPattern': r['Patrón'],
            'compatibleRoles': [x for x in roles if x != 'Opt-in'],
            'optIn': 'Opt-in' in roles,
            'equipment': r['Equipo'],
            'equipmentOptions': parse_equipment(r['Equipo'], r['Fuente carga'], ex_id, warnings),
            'loadSource': r['Fuente carga'],
            'laterality': r['Lateralidad'],
            'primaryMuscle': r['Músculo principal'],
            'secondaryNotes': None if secondary in ('', '—', '-') else secondary,
            'muscles': contrib,
            'accessibility': r['Accesibilidad técnica'],
            'strengthRequirement': r['Fuerza requerida'],
            'scalability': r['Escalabilidad'],
            'stability': r['Estabilidad'],
            'localFatigue': r['Fatiga local'],
            'systemicDemand': r['Demanda sistémica'],
            'progressionSuitability': r['Progresabilidad'],
            'nearFailureSuitability': r['Adecuación cerca del fallo'],
            'repSpec': parse_range(r['Reps V1'], 'Reps V1', ex_id, warnings),
            'restSpec': parse_range(r['Descanso'], 'Descanso', ex_id, warnings),
            'setupCost': r['Setup'],
            'executionTimeCost': r['Coste temporal'],
            'densitySuitability': r['Densidad'],
            'substitutionFamily': r['Familia sustitución'],
            'motorNotes': r.get('Notas Motor', '') or None,
        })

    # --- variantes -------------------------------------------------------
    _, vrecs = as_records(sheets['Variantes'])
    variants = []
    for line, v in vrecs:
        base = v.get('Base ID', '')
        if not base:
            continue
        if base not in by_id:
            warnings.append(f'Variante "{v.get("Variante/configuración")}" (fila {line}) apunta a "{base}", '
                            f'que no existe en la Biblioteca -> ignorada')
            continue
        new_sheet = v.get('¿Nueva ficha?', '')
        if new_sheet.lower().startswith('s'):
            promoted = new_sheet.split(':', 1)[1].strip() if ':' in new_sheet else ''
            if promoted not in by_id:
                warnings.append(f'Variante fila {line} marcada como nueva ficha: revisar con producto')
        variants.append({
            'baseId': base,
            'name': v.get('Variante/configuración', ''),
            'type': v.get('Tipo', ''),
            'changes': v.get('Qué cambia', ''),
            'rule': v.get('Regla', ''),
        })

    # --- alias de IDs antiguos -----------------------------------------
    for old, new in LEGACY_ID_ALIASES.items():
        if new not in by_id:
            sys.exit(f'ERROR: alias {old} -> {new}: el destino no existe en la Biblioteca')
        if old in by_id:
            sys.exit(f'ERROR: alias {old} -> {new}: el ID antiguo sigue existiendo como ficha')

    # --- versión declarada ---------------------------------------------
    resumen = sheets.get('Resumen', [])
    title = next((c.get('A', '') for _, c in resumen if 'Biblioteca' in c.get('A', '')), '')
    version = (re.search(r'v(\d+(?:\.\d+)*)', title) or [None, 'desconocida'])[1]
    declared = leading_int(next((c.get('B') for _, c in resumen if c.get('A') == 'Ejercicios base'), None))
    if declared is not None and declared != len(exercises):
        if declared == len(exercises) + len(dup_rows):
            warnings.append(f'La hoja Resumen declara {declared} = {len(exercises)} fichas únicas + {len(dup_rows)} filas copiadas; no falta ningún ejercicio.')
        else:
            warnings.append(f'La hoja Resumen declara {declared} ejercicios base, pero hay {len(exercises)} fichas únicas.')
    declared_variants = leading_int(next((c.get('B') for _, c in resumen if c.get('A') == 'Variantes fusionadas'), None))
    if declared_variants is not None and declared_variants != len(variants):
        warnings.append(f'La hoja Resumen declara {declared_variants} variantes, pero se han importado {len(variants)}.')

    meta = {
        'version': version,
        'sourceFile': path.name,
        'sheetRows': len(records),
        'uniqueExercises': len(exercises),
        'variants': len(variants),
        'matrixRows': sum(len(v) for v in matrix.values()),
        'muscles': len(muscles),
        'warnings': warnings,
    }

    ts = TEMPLATE.format(
        version=version,
        source=path.name,
        exercises=json.dumps(exercises, ensure_ascii=False, indent=2),
        variants=json.dumps(variants, ensure_ascii=False, indent=2),
        muscles=json.dumps(list(muscles.values()), ensure_ascii=False, indent=2),
        aliases=json.dumps(LEGACY_ID_ALIASES, ensure_ascii=False, indent=2),
        meta=json.dumps(meta, ensure_ascii=False, indent=2),
    )
    OUT.write_text(ts, encoding='utf-8')
    print(f'Biblioteca v{version}: {len(exercises)} fichas, {len(variants)} variantes, '
          f'{meta["matrixRows"]} filas de matriz, {len(muscles)} músculos -> {OUT.relative_to(ROOT)}')
    for w in warnings:
        print('  AVISO:', w)


TEMPLATE = '''// ─────────────────────────────────────────────────────────────────────
// GENERADO por scripts/import-biblioteca.py — NO EDITAR A MANO.
// Fuente de verdad: {source} (Biblioteca Inteligente v{version}).
// La Biblioteca describe; el Motor (fitkMotor.ts) decide. Para cambiar
// datos, edita el Excel y vuelve a ejecutar el importador.
// ─────────────────────────────────────────────────────────────────────

/** P=principal; S=secundario relevante; C=colaborador; E=estabilizador (LIB-MATRIX-LEVELS-101). */
export type MatrixLevel = 'P' | 'S' | 'C' | 'E';

/** Fila de la Matriz muscular: relevancia (nivel) y directitud son dimensiones distintas (MOTOR-MATRIX-DIRECT-102). */
export interface MuscleContribution {{
  /** Código del Diccionario muscular (el mismo en trabajo directo e indirecto, MOTOR-MATRIX-CROSSBLOCK-104). */
  code: string;
  level: MatrixLevel;
  direct: boolean;
  function: string;
  bias: string | null;
  confidence: string;
  notes: string | null;
}}

export interface MuscleEntry {{
  code: string;
  name: string;
  group: string;
  type: string;
  motorUse: string;
  notes: string | null;
}}

export interface RangeSpec {{
  min: number | null;
  max: number | null;
  unit: 'reps' | 'seconds' | 'steps';
  perSide: boolean;
  /** "Según capacidad/variante": el rango lo decide la capacidad del usuario (MOTOR-CAPACITY-016). */
  byCapacity: boolean;
  openEnded: boolean;
  raw: string;
}}

export interface LibraryExercise {{
  id: string;
  name: string;
  block: string;
  family: string;
  movementPattern: string;
  compatibleRoles: string[];
  /** Bloqueado por defecto: solo elegible si el usuario lo pide expresamente (MOTOR-NECK-OPTIN-094). */
  optIn: boolean;
  equipment: string;
  /** Alternativas de requisitos de equipo: basta con cumplir UNA (Hard Filter). */
  equipmentOptions: string[][];
  loadSource: string;
  laterality: string;
  primaryMuscle: string;
  /** Texto descriptivo de la Biblioteca; la contribución estructurada vive en `muscles`. */
  secondaryNotes: string | null;
  /** Matriz muscular de la ficha (MOTOR-MATRIX-097). */
  muscles: MuscleContribution[];
  accessibility: string;
  strengthRequirement: string;
  scalability: string;
  stability: string;
  localFatigue: string;
  systemicDemand: string;
  progressionSuitability: string;
  nearFailureSuitability: string;
  repSpec: RangeSpec;
  restSpec: RangeSpec;
  setupCost: string;
  executionTimeCost: string;
  densitySuitability: string;
  substitutionFamily: string;
  motorNotes: string | null;
}}

/** Configuración registrada dentro de una ficha (LIB-VARIANT-001): no es un ejercicio aparte. */
export interface LibraryVariant {{
  baseId: string;
  name: string;
  type: string;
  changes: string;
  rule: string;
}}

export const LIBRARY: LibraryExercise[] = {exercises};

export const VARIANTS: LibraryVariant[] = {variants};

/** Diccionario muscular: códigos comunes a todas las fichas. */
export const MUSCLES: MuscleEntry[] = {muscles};

/**
 * IDs de versiones anteriores que siguen siendo el mismo ejercicio
 * (renombrados o fusionados como configuración). Permiten leer planes,
 * historial y preferencias guardados con el ID viejo.
 */
export const LEGACY_ID_ALIASES: Record<string, string> = {aliases};

/** Metadatos de importación. `warnings` = contradicciones del Excel a revisar con producto. */
export const LIBRARY_META = {meta} as const;

/** ID actual de una ficha (traduce IDs antiguos; deja igual los desconocidos). */
export const resolveLibraryId = (id: string): string => LEGACY_ID_ALIASES[id] ?? id;

/** Busca por ID actual o antiguo. */
export const libraryById = new Map<string, LibraryExercise>([
  ...LIBRARY.map(e => [e.id, e] as [string, LibraryExercise]),
  ...Object.entries(LEGACY_ID_ALIASES).map(([old, id]) => [old, LIBRARY.find(e => e.id === id)!] as [string, LibraryExercise]),
]);
export const variantsFor = (id: string) => VARIANTS.filter(v => v.baseId === id);
export const muscleByCode = new Map(MUSCLES.map(m => [m.code, m]));

// Resumen en texto para el system prompt del Coach — misma fuente de verdad
// que el Motor; se regenera siempre desde LIBRARY.
export function libraryPromptSummary(): string {{
  const byBlock = new Map<string, string[]>();
  for (const ex of LIBRARY) {{
    if (!byBlock.has(ex.block)) byBlock.set(ex.block, []);
    byBlock.get(ex.block)?.push(ex.name);
  }}
  const lines = Array.from(byBlock.entries())
    .map(([block, names]) => `${{block.toUpperCase()}} (${{names.length}}): ${{names.join(', ')}}.`)
    .join('\\n');
  return `LISTA OFICIAL DE EJERCICIOS — BIBLIOTECA FIT-K v${{LIBRARY_META.version}} (obligatoria, ${{LIBRARY.length}} ejercicios):\\n${{lines}}\\nREGLA: Al crear entrenamientos o proponer/sustituir ejercicios de gimnasio, usa EXCLUSIVAMENTE ejercicios de esta lista, con estos nombres exactos. Si el usuario menciona un ejercicio que no está, sugiere el equivalente más cercano de la lista. Los ejercicios de CUELLO solo se incluyen si el usuario pide expresamente entrenar cuello.`;
}}
'''

if __name__ == '__main__':
    main()
