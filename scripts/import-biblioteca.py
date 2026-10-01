#!/usr/bin/env python3
"""Importador de la Biblioteca Inteligente Fit-K -> src/lib/fitkLibrary.ts

El Excel es la fuente de verdad (FIT-K_Instrucciones.docx, sec. 19 y 23).
Este script NO interpreta metodología: normaliza los datos de la hoja
"Biblioteca" y "Variantes" y genera el módulo TypeScript que usa el Motor.

Uso:
    python3 scripts/import-biblioteca.py [ruta.xlsx]
    (por defecto: ../FIT-K_Biblioteca_InteligenteMOTOR.xlsx)

Contradicciones o datos imposibles NO se resuelven en silencio: se abortan
(si son ambiguos) o quedan registradas en LIBRARY_META.warnings.
"""
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = ROOT.parent / 'FIT-K_Biblioteca_InteligenteMOTOR.xlsx'
OUT = ROOT / 'src' / 'lib' / 'fitkLibrary.ts'
NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
REL_NS = '{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id'

# Categorías de equipamiento que entiende el Motor (Hard Filter de equipo).
# 'corporal' siempre está disponible.
EQUIPMENT_TOKENS = {
    'barra': 'barra', 'barra libre': 'barra', 'barra recta': 'barra', 'ez': 'barra',
    'barra dominadas': 'dominadas', 'barra agarre neutro': 'dominadas',
    'mancuerna': 'mancuernas', 'mancuernas': 'mancuernas', 'kettlebell': 'mancuernas',
    'carga': 'mancuernas', 'carga opcional': 'corporal', 'carga sobre rodillas': 'mancuernas',
    'máquina': 'maquina', 'maquina': 'maquina', 'máquina específica': 'maquina',
    'máquina/asistencia segura': 'maquina', 'asistencia segura': 'maquina',
    'polea específica': 'polea', 't-bar': 'maquina',
    'polea': 'polea', 'cable': 'polea', 'banda segura': 'banda',
    'smith': 'smith', 'multipower': 'smith', 'smith compatible': 'smith',
    'prensa': 'prensa', 'banco': 'banco', 'banco predicador': 'banco',
    'banco 45°': 'banco', 'cajón': 'banco', 'rack': 'rack',
    'paralelas': 'paralelas', 'asistida': 'paralelas',
    'banda': 'banda', 'minibanda': 'banda', 'ghd': 'ghd',
    'peso corporal': 'corporal', 'pared': 'corporal', 'asistencia': 'corporal',
    'apoyo': 'corporal',
}

LEVELS = {'Mínimo', 'Bajo', 'Baja', 'Bajo-Medio', 'Baja-Media', 'Medio', 'Media',
          'Medio-Alto', 'Media-Alta', 'Alto', 'Alta', 'Variable', 'No prioritario'}


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


def col_index(letters):
    n = 0
    for ch in letters:
        n = n * 26 + ord(ch) - 64
    return n


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


def parse_secondary(text):
    t = re.sub(r'\(.*?\)', '', text).strip()
    if not t or t in ('—', '-'):
        return []
    out = []
    for part in [p.strip() for p in t.split(';') if p.strip()]:
        m = re.match(r'^(.*?)\s+([\d.]+)$', part)
        if m:
            out.append({'muscle': m.group(1).strip(), 'coefficient': float(m.group(2))})
        else:
            out.append({'muscle': part, 'coefficient': 0})
    return out


# Sinónimos que en el Excel van unidos con '/' pero son UNA sola pieza de
# equipo: "Barra/EZ+banco" = (barra recta o EZ) + banco, no "barra" o "EZ+banco".
EQUIPMENT_SYNONYMS = [(r'barra\s*/\s*ez', 'barra'), (r'cajón\s*/\s*banco', 'banco')]


def parse_equipment(text, load_source, ex_id, warnings):
    """'Smith/barra+rack' -> [['smith'], ['barra','rack']] (alternativas de requisitos)."""
    t = text
    for pattern, repl in EQUIPMENT_SYNONYMS:
        t = re.sub(pattern, repl, t, flags=re.I)
    # En ejercicios de carga corporal con lastre opcional, la mancuerna no es requisito.
    optional_load = 'opcional' in load_source.lower()
    options = []
    for alt in [a.strip() for a in t.split('/') if a.strip()]:
        req = []
        for tok in [t.strip().lower() for t in alt.split('+') if t.strip()]:
            cat = EQUIPMENT_TOKENS.get(tok)
            if cat is None:
                # tolera prefijos ("máquina específica", "polea específica"...)
                cat = next((v for k, v in EQUIPMENT_TOKENS.items() if tok.startswith(k)), None)
            if cat is None:
                warnings.append(f'{ex_id}: equipo "{tok}" desconocido -> tratado como "maquina"')
                cat = 'maquina'
            if optional_load and cat == 'mancuernas' and '+' in alt:
                continue
            if cat != 'corporal' and cat not in req:
                req.append(cat)
        if req not in options:
            options.append(req)
    return options


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

    exercises = []
    for ex_id in order:
        line, r = by_id[ex_id]
        for f in ('Accesibilidad técnica', 'Fuerza requerida', 'Escalabilidad', 'Estabilidad', 'Fatiga local',
                  'Demanda sistémica', 'Progresabilidad', 'Adecuación cerca del fallo', 'Setup', 'Coste temporal', 'Densidad'):
            if r.get(f, '') not in LEVELS:
                warnings.append(f'{ex_id}: {f} con valor no reconocido "{r.get(f, "")}"')
        exercises.append({
            'id': ex_id,
            'name': r['Ejercicio'],
            'block': r['Bloque'],
            'family': r['Familia'],
            'movementPattern': r['Patrón'],
            'compatibleRoles': [x.strip() for x in r['Rol compatible'].split('/') if x.strip()],
            'equipment': r['Equipo'],
            'equipmentOptions': parse_equipment(r['Equipo'], r['Fuente carga'], ex_id, warnings),
            'loadSource': r['Fuente carga'],
            'laterality': r['Lateralidad'],
            'primaryMuscle': r['Músculo principal'],
            'secondaryMuscles': parse_secondary(r.get('Secundarios / contribución heurística', '')),
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
        if v.get('¿Nueva ficha?', '').lower().startswith('s'):
            warnings.append(f'Variante fila {line} marcada como nueva ficha: revisar con producto')
        variants.append({
            'baseId': base,
            'name': v.get('Variante/configuración', ''),
            'type': v.get('Tipo', ''),
            'changes': v.get('Qué cambia', ''),
            'rule': v.get('Regla', ''),
        })

    # --- versión declarada ---------------------------------------------
    resumen = sheets.get('Resumen', [])
    title = next((c.get('A', '') for _, c in resumen if 'Biblioteca' in c.get('A', '')), '')
    version = (re.search(r'v(\d+(?:\.\d+)*)', title) or [None, 'desconocida'])[1]
    declared = next((c.get('B') for _, c in resumen if c.get('A') == 'Ejercicios base'), None)
    if declared and declared.isdigit() and int(declared) != len(exercises):
        warnings.append(f'La hoja Resumen declara {declared} ejercicios base, pero hay {len(exercises)} fichas únicas.')

    meta = {
        'version': version,
        'sourceFile': path.name,
        'sheetRows': len(records),
        'uniqueExercises': len(exercises),
        'variants': len(variants),
        'warnings': warnings,
    }

    ts = TEMPLATE.format(
        version=version,
        source=path.name,
        exercises=json.dumps(exercises, ensure_ascii=False, indent=2),
        variants=json.dumps(variants, ensure_ascii=False, indent=2),
        meta=json.dumps(meta, ensure_ascii=False, indent=2),
    )
    OUT.write_text(ts, encoding='utf-8')
    print(f'Biblioteca v{version}: {len(exercises)} fichas, {len(variants)} variantes -> {OUT.relative_to(ROOT)}')
    for w in warnings:
        print('  AVISO:', w)


TEMPLATE = '''// ─────────────────────────────────────────────────────────────────────
// GENERADO por scripts/import-biblioteca.py — NO EDITAR A MANO.
// Fuente de verdad: {source} (Biblioteca Inteligente v{version}).
// La Biblioteca describe; el Motor (fitkMotor.ts) decide. Para cambiar
// datos, edita el Excel y vuelve a ejecutar el importador.
// ─────────────────────────────────────────────────────────────────────

export interface SecondaryMuscle {{
  muscle: string;
  /** Heurística de planificación (0.5 / 0), NO equivalencia fisiológica (LIB-INDIRECT-001). */
  coefficient: number;
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
  equipment: string;
  /** Alternativas de requisitos de equipo: basta con cumplir UNA (Hard Filter). */
  equipmentOptions: string[][];
  loadSource: string;
  laterality: string;
  primaryMuscle: string;
  secondaryMuscles: SecondaryMuscle[];
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

/** Metadatos de importación. `warnings` = contradicciones del Excel a revisar con producto. */
export const LIBRARY_META = {meta} as const;

export const libraryById = new Map(LIBRARY.map(e => [e.id, e]));
export const variantsFor = (id: string) => VARIANTS.filter(v => v.baseId === id);

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
  return `LISTA OFICIAL DE EJERCICIOS — BIBLIOTECA FIT-K v${{LIBRARY_META.version}} (obligatoria, ${{LIBRARY.length}} ejercicios):\\n${{lines}}\\nREGLA: Al crear entrenamientos o proponer/sustituir ejercicios de gimnasio, usa EXCLUSIVAMENTE ejercicios de esta lista, con estos nombres exactos. Si el usuario menciona un ejercicio que no está, sugiere el equivalente más cercano de la lista.`;
}}
'''

if __name__ == '__main__':
    main()
