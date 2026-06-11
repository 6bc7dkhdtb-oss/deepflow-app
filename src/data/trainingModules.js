// ─────────────────────────────────────────────────────────────────────────────
// trainingModules.js — Source of truth für den Trainingsbereich.
//
// Jeder Eintrag ist ein geführtes Modul, dessen Schritte 1:1 aus dem Buch
// (Tom Sietas – DeepFlow, siehe Atmungsübungen.md) übernommen sind. Jeder
// Schritt trägt einen `timer`-Descriptor, den ActiveSession interpretiert.
//
// timer.kind:
//   'breathing'  { phases:[{type:'in'|'out'|'hold'|'pause'|'extra', duration, instruction}], totalSec }
//   'countdown'  { duration }
//   'hold-table' { rounds:[{hold, rest}] }                literale Halte-/Pausenzeiten
//   'hold-reflex'{ rounds:[{extra, rest}], note }         halten bis Atemreiz, dann +extra Sek
//   'hold-max'   { warmup?, note }                        Maximalrunde – Stoppuhr bis „Beenden"
//   'walk-hold'  { rounds:[{steps, rest}] }               X Schritte halten + Pause
//   'stages'     { stages:[…] }                           Stufen-Auswahl (Brustkorb/Faszien)
//   'manual'     { }                                      reine Anleitung, weiter per Button
// ─────────────────────────────────────────────────────────────────────────────

export const GOALS = {
  apnoe:     { id: 'apnoe',     label: 'Atemhaltezeit', sub: 'Ziel: 3 Minuten',        color: 'blue'   },
  hrv:       { id: 'hrv',       label: 'HRV & Ruhe',    sub: 'Herz-Atem-Kohärenz',     color: 'teal'   },
  brustkorb: { id: 'brustkorb', label: 'Brustkorb',     sub: 'Beweglichkeit & Faszien', color: 'cyan'   },
  basis:     { id: 'basis',     label: 'Basis & Mental', sub: 'Grundlagen & Fokus',     color: 'indigo' },
}

const APNOE_SAFETY = [
  'Niemals allein im Wasser trainieren – an Land ist Alleintraining ok.',
  'Bei Vorerkrankungen (Herz-Kreislauf, Lunge, Nervensystem) vorher ärztlich abklären.',
  'Bei Schwindel/Benommenheit sofort ruhig ausatmen und pausieren.',
  'Am besten nüchtern (≥5 Std. nichts gegessen), gut hydriert, morgens.',
]

// ─── Hilfs-Builder für wiederkehrende Atemphasen ────────────────────────────
const breathing = (phases, totalSec) => ({ kind: 'breathing', phases, totalSec })

// ════════════════════════════════════════════════════════════════════════════
// ZIEL: ATEMHALTEZEIT — TB5 Atemanhalten 1–5, TB6 CO₂-Training 1–3
// ════════════════════════════════════════════════════════════════════════════

const APNOE_MODULES = [
  {
    id: 'tb5-atemanhalten-1',
    name: 'Atemanhalten 1 – Den Atemreiz kennenlernen',
    goal: 'apnoe', baustein: 'TB5', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: 'Atemreiz bewusst wahrnehmen und 10 Sek darüber hinaus halten · 3 Runden',
    source: 'Tom Sietas – DeepFlow',
    safety: APNOE_SAFETY,
    steps: [
      {
        title: 'Ankommen & ruhig atmen',
        text: 'Such dir einen ruhigen Ort. Setz dich aufrecht hin, Schultern leicht zurück, sodass du Raum im Brustkorb schaffst. Atme 1–2 Minuten ruhig, langsam und gleichmäßig. Lass dich in den Moment fallen.',
        timer: { kind: 'countdown', duration: 90 },
      },
      {
        title: 'Vollständig ausatmen',
        text: 'Atme einmal ganz aus – entspannt und vollständig, um CO₂ aus der Lunge zu entlassen.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Tief einatmen & halten (3 Runden)',
        text: 'Atme tief ein – entspannt, nicht forciert. Nutze die 3D-Atmung (Bauch, Flanken, Brustkorb) und halte die Luft an. Sobald du den ersten Atemreiz spürst – ein Ziehen im Bauch, Druck in der Brust oder das Gefühl, schlucken zu müssen – bleib noch 10 Sekunden ruhig in der Luftanhaltephase. Dann sanft ausatmen. Dazwischen je 1–2 Min normal weiteratmen.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 10, rest: 90 }, { extra: 10, rest: 90 }, { extra: 10, rest: 0 }], note: 'Schultern & Nacken locker lassen.' },
      },
    ],
  },
  {
    id: 'tb5-atemanhalten-2',
    name: 'Atemanhalten 2 – Im Reiz bleiben',
    goal: 'apnoe', baustein: 'TB5', color: 'blue',
    durationLabel: '~14 Min',
    shortDesc: '15–30 Sek über den Atemreiz hinaus halten · 3 Runden',
    source: 'Tom Sietas – DeepFlow',
    safety: APNOE_SAFETY,
    steps: [
      {
        title: 'Vorbereiten',
        text: 'Setz dich aufrecht hin, Schultern locker, Brustkorb frei. Lass dir 1–2 Minuten Zeit, um entspannt und gleichmäßig zu atmen.',
        timer: { kind: 'countdown', duration: 90 },
      },
      {
        title: 'Ausatmen & einatmen',
        text: 'Atme einmal tief und vollständig aus, um überschüssiges CO₂ loszuwerden. Atme danach ruhig, aber voll ein – mit der 3D-Atmung in Bauch, Flanken und Brustkorb.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Halten & im Reiz bleiben (3 Runden)',
        text: 'Halte die Luft an und bleib ganz ruhig. Sobald der Atemreiz kommt, verharre 15 bis 30 Sekunden bewusst in diesem Zustand. Der Schlüssel liegt in der Entspannung während des Unwohlseins – lass Nacken und Schultern gezielt locker. Atme dann sanft aus und entspann dich 1 Minute. Wiederhole dreimal mit 1–2 Min Pause.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 20, rest: 90 }, { extra: 25, rest: 90 }, { extra: 30, rest: 0 }], note: 'Erst Nacken/Schultern reagieren – bewusst loslassen.' },
      },
    ],
  },
  {
    id: 'tb5-atemanhalten-3-o2',
    name: 'Atemanhalten 3 – O₂-Tabelle',
    goal: 'apnoe', baustein: 'TB5', color: 'blue',
    durationLabel: '~10 Min',
    shortDesc: 'Zunehmende Haltezeiten (30→50 s), feste 10-Sek-Pausen – Sauerstoffverwertung',
    source: 'Tom Sietas – DeepFlow',
    safety: APNOE_SAFETY,
    steps: [
      {
        title: 'Vorbereiten',
        text: 'Setz dich aufrecht und ruhig hin. Atme 1–2 Minuten gleichmäßig. Wenn dir 30 Sekunden als Einstieg zu niedrig sind, beginne höher – aber lass die Pausen konstant bei 10 Sekunden.',
        timer: { kind: 'countdown', duration: 90 },
      },
      {
        title: 'O₂-Tabelle – 5 Runden',
        text: 'Du hältst in jeder Runde etwas länger die Luft an, die Pausen bleiben konstant bei 10 Sekunden: 30 → 35 → 40 → 45 → 50 Sek. Optional mit Oximeter: in Runde 1 bei 2–3 % Absenkung beginnen und je Runde um 2–3 % steigern.',
        timer: { kind: 'hold-table', rounds: [
          { hold: 30, rest: 10 }, { hold: 35, rest: 10 }, { hold: 40, rest: 10 },
          { hold: 45, rest: 10 }, { hold: 50, rest: 0 },
        ] },
      },
    ],
  },
  {
    id: 'tb5-atemanhalten-4-max',
    name: 'Atemanhalten 4 – Deine Maximalrunde',
    goal: 'apnoe', baustein: 'TB5', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: '3 Runden, je länger – Runde 3 Maximalversuch (Stoppuhr)',
    source: 'Tom Sietas – DeepFlow',
    safety: [...APNOE_SAFETY, 'Pulsoximeter nutzen – Sättigung über 85 % halten.', 'Runde 3: halten bis Maximum oder 85 % Sättigung – ruhig und fokussiert bleiben.'],
    steps: [
      {
        title: 'Vorbereiten',
        text: 'Ruhig 1–2 Minuten atmen, ankommen. Drei Runden mit jeweils 2 Minuten Pause dazwischen.',
        timer: { kind: 'countdown', duration: 90 },
      },
      {
        title: 'Runde 1 – bis Atemreiz +10 Sek',
        text: 'Luft anhalten bis zum Atemreiz – dann 10 Sekunden länger. Anschließend 2 Minuten Pause.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 10, rest: 120 }] },
      },
      {
        title: 'Runde 2 – bis Atemreiz +20–30 Sek',
        text: 'Wieder bis zum Atemreiz – dann 20 bis 30 Sekunden länger. Anschließend 2 Minuten Pause.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 25, rest: 120 }] },
      },
      {
        title: 'Runde 3 – Maximalversuch',
        text: 'Halte so lange du kannst oder bis 85 % Sauerstoffsättigung. Bleib ruhig und fokussiert. Sieh den Atemreiz nicht als Feind, sondern als Trainingspartner – wenn das Brennen und die Zwerchfellkontraktionen einsetzen, beginnt das eigentliche Training.',
        timer: { kind: 'hold-max', note: 'Stoppuhr läuft – „Beenden" drücken beim Ausatmen.' },
      },
    ],
  },
  {
    id: 'tb5-atemanhalten-5',
    name: 'Atemanhalten 5 – Milde Hyperventilation',
    goal: 'apnoe', baustein: 'TB5', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: 'Erweiterte Reizsetzung – Runde 3 mit 30 Sek leichtem Überatmen',
    source: 'Tom Sietas – DeepFlow',
    safety: [...APNOE_SAFETY, 'Nur an Land. Kribbeln in Händen/Füßen/Gesicht = zu stark überventiliert → abbrechen.'],
    steps: [
      {
        title: 'Vorbereiten',
        text: 'Ruhig 1–2 Minuten atmen. Drei Runden – die ersten beiden wie gewohnt.',
        timer: { kind: 'countdown', duration: 90 },
      },
      {
        title: 'Runde 1 – bis Atemreiz +10 Sek',
        text: 'Halte die Luft bis 10 Sekunden nach dem Atemreiz. Dann 2 Minuten Pause.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 10, rest: 120 }] },
      },
      {
        title: 'Runde 2 – bis Atemreiz +20–30 Sek',
        text: 'Halte die Luft 20 bis 30 Sekunden nach dem Atemreiz. Dann 1,5 Minuten Pause.',
        timer: { kind: 'hold-reflex', rounds: [{ extra: 25, rest: 90 }] },
      },
      {
        title: 'Runde 3 – 30 Sek leicht überatmen, dann Maximum',
        text: 'Atme 30 Sekunden lang leicht über: etwas tiefer und schneller als normal (ca. 3–4 Sek ein, 3–4 Sek aus, ~50–75 % deines Atemvolumens), aber kontrolliert und ohne Anstrengung. Dann einmal entspannt tief einatmen – und so lange halten, wie du kannst, oder bis 85 % Sättigung. In Runde 3 kann der Atemreiz deutlich später kommen – das ist gewollt.',
        timer: { kind: 'breathing', phases: [
          { type: 'in', duration: 3.5, instruction: 'Etwas tiefer einatmen (~60 %)' },
          { type: 'out', duration: 3.5, instruction: 'Gleichmäßig ausatmen' },
        ], totalSec: 30, then: 'hold-max' },
      },
    ],
  },

  // ── TB6 — CO₂-Sensitivität ──────────────────────────────────────────────
  {
    id: 'tb6-co2-1',
    name: 'CO₂-Training 1 – Toleranzgrenze verschieben',
    goal: 'apnoe', baustein: 'TB6', color: 'blue',
    durationLabel: '~10 Min',
    shortDesc: 'Feste Haltezeit, kürzer werdende Pausen (60→15 s) – CO₂-Toleranz',
    source: 'Tom Sietas – DeepFlow',
    safety: ['Bei Schwindel/Unwohlsein sofort beenden und ruhig weiteratmen.'],
    steps: [
      {
        title: 'Haltezeit wählen',
        text: 'Wähle eine Luftanhaltezeit, die du aktuell sicher halten kannst – z. B. 45 oder 60 Sekunden. Diese hältst du in allen Runden konstant; nur die Pausen werden kürzer.',
        timer: { kind: 'manual' },
      },
      {
        title: 'CO₂-Tabelle – 5 Runden',
        text: 'Konstante Haltezeit, abnehmende Pausen: 60 → 45 → 30 → 15 Sek, dann fertig. Je kürzer die Pause, desto intensiver der Atemreiz – besonders in den letzten beiden Runden. Halte Nacken und Schultern locker.',
        timer: { kind: 'hold-table', rounds: [
          { hold: 50, rest: 60 }, { hold: 50, rest: 45 }, { hold: 50, rest: 30 },
          { hold: 50, rest: 15 }, { hold: 50, rest: 0 },
        ], holdEditable: true },
      },
    ],
  },
  {
    id: 'tb6-co2-2-walk',
    name: 'CO₂-Training 2 – Walk & Hold',
    goal: 'apnoe', baustein: 'TB6', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: 'Gehen + Luftanhalten nach dem Ausatmen · 6 Runden, kürzer werdende Pausen',
    source: 'Tom Sietas – DeepFlow',
    safety: ['Nur auf ebenem Untergrund, niemals im Straßenverkehr.', 'Nur durch die Nase atmen – auch nach der Haltephase.', 'Bei Schwindel sofort stehen bleiben und ruhig weiteratmen.'],
    steps: [
      {
        title: 'Strecke & Vorbereitung',
        text: 'Wähle einen ebenen Weg ohne Verkehr. Atme ein paarmal ruhig durch die Nase. Pro Runde: normal einatmen, vollständig ausatmen, Luft anhalten – dann ~20 Schritte gehen, danach sanft durch die Nase wieder einatmen und im selben Tempo weitergehen.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Walk & Hold – 6 Runden',
        text: '20 Schritte mit angehaltenem Atem, dann Pause (gehend, normal atmend). Pausen werden kürzer: 60 → 50 → 40 → 30 → 25 → 20 Sek. Wenn du nach einer Haltephase schneller atmen musst, verlängere die nächste Pause wieder etwas.',
        timer: { kind: 'walk-hold', rounds: [
          { steps: 20, rest: 60 }, { steps: 20, rest: 50 }, { steps: 20, rest: 40 },
          { steps: 20, rest: 30 }, { steps: 20, rest: 25 }, { steps: 20, rest: 20 },
        ] },
      },
    ],
  },
  {
    id: 'tb6-co2-3',
    name: 'CO₂-Training 3 – Stabil bei höherer Last',
    goal: 'apnoe', baustein: 'TB6', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: 'Wie Walk & Hold, höhere Anfangsbelastung (25 Schritte/zügiger)',
    source: 'Tom Sietas – DeepFlow',
    safety: ['Fordern, nicht überfordern – du solltest jederzeit ruhig einatmen können.', 'Bei Unsicherheit Oximeter nutzen; Sättigung sollte sich in Bewegung schnell normalisieren.'],
    steps: [
      {
        title: 'Belastung erhöhen',
        text: 'Struktur wie Walk & Hold, aber höhere Anfangsbelastung: ein paar Schritte mehr beim Luftanhalten (z. B. 25 statt 20) oder ein spürbar zügigeres Gehtempo. So steigt der CO₂-Druck ab Runde 1 schneller – du beginnst näher an deiner Reizzone. Ziel: diese Schwelle bewusst treffen und stabil bleiben.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Walk & Hold (höhere Last) – 6 Runden',
        text: '25 Schritte mit angehaltenem Atem, verkürzte Erholung: 60 → 50 → 40 → 30 → 25 → 20 Sek. Wähle eine Last, bei der du ruhig bleiben kannst – wenn du nach dem Einatmen Luft schnappen musst, beim nächsten Mal runtergehen oder Pause verlängern.',
        timer: { kind: 'walk-hold', rounds: [
          { steps: 25, rest: 60 }, { steps: 25, rest: 50 }, { steps: 25, rest: 40 },
          { steps: 25, rest: 30 }, { steps: 25, rest: 25 }, { steps: 25, rest: 20 },
        ] },
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// ZIEL: HRV & RUHE — Kohärenz, Dreieck, Buteyko, Box
// ════════════════════════════════════════════════════════════════════════════

const HRV_MODULES = [
  {
    id: 'kohaerenzatmung',
    name: 'Kohärenzatmung',
    goal: 'hrv', baustein: 'standalone', color: 'teal',
    durationLabel: '5 Min',
    shortDesc: '5–6 Sek ein, 5–6 Sek aus – Herz & Atem in Resonanz, maximale HRV',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Aufrecht ankommen',
        text: 'Setz oder stell dich so hin, dass dein Oberkörper aufrecht und entspannt ist. Finde eine Position, in der du loslassen kannst.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Gleichmäßig atmen – 5 Min',
        text: 'Atme langsam und sanft durch die Nase ein (ca. 5–6 Sek) und genauso langsam wieder aus (5–6 Sek). Halte den Atem nicht an, lass ihn ruhig und kontinuierlich fließen. Spüre, wie sich Herzschlag und Atmung angleichen – dein Nervensystem balanciert sich aus.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',  duration: 5.5, instruction: 'Sanft durch die Nase einatmen' },
          { type: 'out', duration: 5.5, instruction: 'Gleichmäßig ausatmen' },
        ], totalSec: 300 },
      },
    ],
  },
  {
    id: 'dreiecksatmung',
    name: 'Dreiecksatmung',
    goal: 'hrv', baustein: 'standalone', color: 'teal',
    durationLabel: '3–5 Min',
    shortDesc: 'Einatmen – Ausatmen – Atempause. Verlängerte Pause aktiviert den Vagusnerv',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Bequeme Haltung finden',
        text: 'Sitzen, stehen oder liegen – wie es dir guttut. Falls ungestört, im Liegen für maximale Entspannung. Achte nur darauf, dass du dich wohlfühlst und loslassen kannst.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Dreieck atmen – 3–5 Min',
        text: 'Langsam und ruhig tief durch die Nase ein. Sanft und passiv wieder aus – alle Muskeln loslassen, auch die Atemmuskeln. Nach der Ausatmung einen Moment innehalten und nachspüren: Kopf, Nacken, Schultern, Bauch, Rücken, Beine bewusst loslassen. Die Pause nach dem Ausatmen verlängerst du allmählich auf 5–10 Sek, solange es angenehm bleibt. Kein Kämpfen, kein Atemreiz.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',    duration: 4, instruction: 'Langsam tief einatmen' },
          { type: 'out',   duration: 4, instruction: 'Passiv ausatmen, loslassen' },
          { type: 'pause', duration: 5, instruction: 'Leer halten – nachspüren' },
        ], totalSec: 240 },
      },
    ],
  },
  {
    id: 'buteyko',
    name: 'Buteyko-Protokoll',
    goal: 'hrv', baustein: 'standalone', color: 'teal',
    durationLabel: '10–15 Min',
    shortDesc: 'Weniger, sanfter, nasaler atmen + Atempause – erhöht CO₂-Toleranz im Alltag',
    source: 'Konstantin Buteyko / DeepFlow',
    steps: [
      {
        title: 'Leise nasal atmen – 10–15 Min',
        text: 'Einatmen durch die Nase (ca. 3–4 Sek), ausatmen durch die Nase (ca. 6 Sek), dann Atempause nach dem Ausatmen (5–10 Sek oder so lange angenehm). Achte auf eine ruhige, fast lautlose Atmung – der Atem darf flüstern, nicht arbeiten. Es geht nicht um Leistung, sondern um Rückkehr zur inneren Ruhe.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',    duration: 3.5, instruction: 'Leise durch die Nase ein' },
          { type: 'out',   duration: 6,   instruction: 'Sanft durch die Nase aus' },
          { type: 'pause', duration: 7,   instruction: 'Atempause – angenehm halten' },
        ], totalSec: 600 },
      },
    ],
  },
  {
    id: 'boxatmung',
    name: 'Boxatmung',
    goal: 'hrv', baustein: 'standalone', color: 'teal',
    durationLabel: '6–10 Runden',
    shortDesc: 'Vier gleiche Phasen à 4 Sek – Fokus & Nervensystem regulieren',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Aufrecht hinsetzen',
        text: 'Finde einen ruhigen Ort, an dem du 1–2 Minuten ungestört bist. Setz dich aufrecht hin und richte die Aufmerksamkeit auf deinen Atem.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Box atmen – 6–10 Runden',
        text: 'Stell dir ein Quadrat vor – jede Seite ist eine Phase à 4 Sek: Einatmen (1-2-3-4), Luft anhalten (1-2-3-4), Ausatmen (1-2-3-4), Atempause (1-2-3-4). Dann beginnt der nächste Zyklus.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',    duration: 4, instruction: 'Einatmen' },
          { type: 'hold',  duration: 4, instruction: 'Luft oben halten' },
          { type: 'out',   duration: 4, instruction: 'Ausatmen' },
          { type: 'pause', duration: 4, instruction: 'Atempause' },
        ], totalSec: 240 },
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// ZIEL: BRUSTKORB — TB3 Brustkorbdehnung (4 Gruppen × 3 Stufen), TB4 Faszien
// ════════════════════════════════════════════════════════════════════════════

// TB3: Stufen 1–3, je Stufe enthält die 4 Dehnungsgruppen auf diesem Niveau.
const BRUSTKORB_STAGES = [
  {
    id: 1, name: 'Stufe 1 – Einstieg', duration: '~10 Min', color: 'cyan',
    description: 'Grundpositionen der vier Dehnungsgruppen kennenlernen.',
    steps: [
      { title: 'Uddiyana Bandha – Rückenlage', duration: 90, text: 'Rückenlage, Beine angewinkelt, Becken zurückkippen (Hohlkreuz vermeiden). 1–2 Min entspannte Bauchatmung. Dann zügig und vollständig ausatmen, noch ein wenig mehr. Atem anhalten und Bauch kräftig nach innen und oben ziehen, als wolltest du das Zwerchfell einsaugen. 5–10 Sek halten, langsam lösen, einatmen. 3–5 Zyklen.' },
      { title: 'Seitliche Brustkorbdehnung', duration: 90, text: 'Aufrecht sitzen/stehen. Rechten Arm über den Kopf strecken, Oberkörper nach links neigen. Gezielt in die rechte Flanke atmen – die Rippen dehnen sich seitlich. 5 Atemzüge halten, Seite wechseln. 2–3 Durchgänge je Seite.' },
      { title: 'Vordere Brustkorbdehnung', duration: 90, text: 'Aufrecht stehen, Hände hinter dem Rücken verschränken, Arme leicht nach unten/hinten ziehen. Brustbein anheben, oberen Brustkorb öffnen, Schultern zurück und unten. Tief in den oberen Brustraum atmen. 5–8 ruhige Atemzüge.' },
      { title: 'Hintere Brustkorbdehnung', duration: 90, text: 'Aufrecht auf einem Stuhl sitzen, Füße stabil. Beine leicht öffnen, Oberkörper langsam nach vorne auf die Oberschenkel ablegen. Arme locker, Rücken sanft rund, Nacken entspannt. Gezielt in den hinteren Brustkorb atmen – zwischen den Schulterblättern. 5–8 Atemzüge.' },
    ],
  },
  {
    id: 2, name: 'Stufe 2 – Vertiefung', duration: '~12 Min', color: 'blue',
    description: 'Mit Rotation, Halten und aktiver Atemführung intensivieren.',
    steps: [
      { title: 'Uddiyana Bandha – Arme über Kopf', duration: 120, text: 'Wie Stufe 1. Nach dem Ausatmen die Arme über den Kopf nehmen und die Position 5–10 Sek halten. Langsam lösen, einatmen. 3–5 Zyklen.' },
      { title: 'Seitliche Dehnung – Rotation im Sitz', duration: 120, text: 'Schneidersitz, beide Arme nach oben, Wirbelsäule lang. Oberkörper langsam nach rechts drehen, rechte Hand hinter dir auf den Boden, linke außen am rechten Knie. Aufrichtung halten, Brustkorb offen. Bewusst in den linken Brustkorb atmen – die Rippen öffnen sich. Mit der Ausatmung etwas weiter aufdrehen. 3–4 Atemzüge, Seite wechseln. 2 Durchgänge je Seite.' },
      { title: 'Vordere Dehnung – Überkopf mit Rückneigung', duration: 90, text: 'Aufrecht, Füße hüftbreit. Hände über dem Kopf zu einer „Pistole" verschränken (Zeigefinger strecken, Daumen kreuzen). Gestreckte Arme über den Kopf, Kopf leicht nach hinten neigen, Oberkörper sanft folgen, Brustkorb öffnen, Ellbogen leicht zurück. Tief in die obere Lunge atmen. 4–6 Atemzüge.' },
      { title: 'Hintere Dehnung – C-Kurve mit Kreuzgriff', duration: 90, text: 'Aufrecht sitzen. Arme vor der Brust kreuzen, mit jeder Hand die gegenüberliegende Schulter greifen. Ellbogen leicht nach unten/vorne, oberer Rücken rundet sich zur C-Kurve. Kinn leicht zur Brust, aber aufgerichtet bleiben. In den Raum zwischen den Schulterblättern atmen. 5–8 Atemzüge.' },
    ],
  },
  {
    id: 3, name: 'Stufe 3 – Fortgeschritten', duration: '~15 Min', color: 'purple',
    description: 'Zwerchfellmassage, Rotationsöffnung, Rückbeuge, Kindhaltung.',
    steps: [
      { title: 'Uddiyana Bandha – mit Zwerchfellmassage', duration: 120, text: 'Wie Stufe 1. Nachdem du den Bauch nach innen/oben gezogen und das Zwerchfell eingesaugt hast: sanft hinter die unteren Rippenbögen greifen, Spannung des Zwerchfells spüren. Mit kreisenden Bewegungen der vier Finger massieren, Daumen gibt Gegendruck außen am Brustkorb. 5–10 Sek, dann einatmen. 3–5 Zyklen.' },
      { title: 'Seitliche Dehnung – Rotation mit seitlicher Öffnung', duration: 120, text: 'Beginn wie Stufe 2 (nach rechts gedreht, linke Hand am Knie, rechte hinter dir). Mit der Einatmung den rechten Arm lösen, über die Seite nach oben senkrecht über den Kopf strecken. Sanft zur linken Seite neigen – rechter Arm gestreckt, zieht aktiv über den Kopf, linker Arm stabilisiert am Knie. Bewusst in die rechte Flanke atmen. 4–6 tiefe Atemzüge, Seite wechseln. 2 Durchgänge je Seite.' },
      { title: 'Vordere Dehnung – Rückbeuge im Kniestand', duration: 120, text: 'Kniestand, Knie hüftbreit, Oberkörper lang. Langsam nach hinten lehnen und mit den Händen die Fersen greifen. Becken leicht nach vorne schieben, Brustkorb maximal nach oben öffnen. Tief in die obere Lunge atmen. 4–6 Atemzüge. WICHTIG: Rückbeuge über oberen Rücken/Brust aufbauen, nicht aus dem unteren Rücken kippen. Bei Unsicherheit Hände am unteren Rücken oder Yogablock nutzen.' },
      { title: 'Hintere Dehnung – Kindhaltung mit Rundrücken', duration: 120, text: 'Fersensitz, Oberkörper nach vorne sinken lassen. Arme nach vorne strecken oder angewinkelt unter die Stirn legen. Schulterblätter leicht auseinanderziehen, oberer Rücken rund. Bewusst in den oberen Rücken atmen – sanfte Dehnung zwischen den Schulterblättern. 5–8 Atemzüge.' },
    ],
  },
]

const FASZIEN_STAGES = [
  {
    id: 1, name: 'Stufe 1 – Faszienstreichung', duration: '~2 Min', color: 'cyan',
    description: 'Brustraum befreien – Selbstmassage zwischen den Rippen.',
    steps: [
      { title: 'Rechte Seite ausstreichen', duration: 60, text: 'Bequem aufrecht sitzen, Schultern locker. Fingerspitzen aufs Brustbein legen. Mit leicht gespreizten Fingern zwischen den Rippen nach außen streichen – sanfter, spürbarer Druck. Systematisch von oben nach unten über die ganze rechte Seite. An festen/empfindlichen Stellen verweilen, kreisend massieren. Zum Abschluss mit der flachen Hand über die ganze Seite streichen.' },
      { title: 'Linke Seite ausstreichen', duration: 60, text: 'Dasselbe auf der linken Seite. Danach beide Seiten vergleichen – die bearbeitete Seite fühlt sich oft weicher, freier und besser durchblutet an.' },
    ],
  },
  {
    id: 2, name: 'Stufe 2 – Faszien-Schwingung', duration: '~4 Min', color: 'blue',
    description: 'Rebound Breath – sanftes Federn löst Spannung.',
    steps: [
      { title: 'Federn & mitatmen (Durchgang 1)', duration: 90, text: 'Aufrecht und hüftbreit stehen, Knie leicht gebeugt, Schultern locker, Arme entspannt. Ganz sanft in den Knien federn – weich, rhythmisch, kein Hüpfen. Der ganze Körper schwingt mit, als würde ein Gummiband von den Füßen bis zum Scheitel vibrieren. Entspannt durch die Nase ein- und ausatmen, der Atem wird Teil der Bewegung. Mit jeder Ausatmung löst sich mehr Spannung.' },
      { title: 'Nachspüren & Durchgang 2', duration: 90, text: 'Schwingen langsam beenden, ruhig stehen, Augen gerne schließen. Nachspüren: Wie fühlen sich Brustkorb, Schultern, Füße an? Dann ein zweiter Durchgang. Mit jedem Durchgang wird der Körper freier, der Atem leichter.' },
    ],
  },
  {
    id: 3, name: 'Stufe 3 – Rückenfaszien mit Tennisball', duration: '~6 Min', color: 'purple',
    description: 'Gezielte Atemraumerweiterung – Ball entlang des Schulterblatts.',
    steps: [
      { title: 'Rechte Seite ausrollen', duration: 90, text: 'Rückenlage, Beine aufgestellt, Füße hüftbreit. Tennisball rechts zwischen Schulterblatt und Wirbelsäule platzieren. Becken leicht anheben, Gewicht vorsichtig auf den Ball verlagern. In kleinen, langsamen Bewegungen entlang des Schulterblatts auf und ab rollen (nur wenige Zentimeter). An verspannten Stellen verweilen, tief gegen den Ball atmen, mit jeder Ausatmung lösen. Optional: rechten Arm senkrecht nach oben heben.' },
      { title: 'Nachspüren', duration: 60, text: 'Kurz liegen bleiben und nachspüren, bevor du die Seite wechselst.' },
      { title: 'Linke Seite ausrollen', duration: 90, text: 'Ball auf die linke Seite legen und dasselbe wiederholen. Insgesamt je Seite 1–2 Minuten, gerne mehrere Durchgänge.' },
    ],
  },
]

const BRUSTKORB_MODULES = [
  {
    id: 'tb3-brustkorbdehnung',
    name: 'Brustkorbdehnung',
    goal: 'brustkorb', baustein: 'TB3', color: 'cyan',
    durationLabel: '10–15 Min',
    shortDesc: 'Vier Dehnungsgruppen in 3 Stufen – Zwerchfell & Interkostalmuskulatur',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Aufwärmen',
        text: 'Vor dem Dehnen kurz aufwärmen: langsam die Schultern vor und zurück kreisen, dann die Arme mitnehmen. Wähle danach eine Stufe.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Stufe wählen & dehnen',
        text: 'Wähle eine Intensitätsstufe (1 = Einstieg, 3 = fortgeschritten) und gehe geführt durch die vier Dehnungsgruppen.',
        timer: { kind: 'stages', stages: BRUSTKORB_STAGES },
      },
    ],
  },
  {
    id: 'tb4-faszien',
    name: 'Faszien-Beweglichkeit',
    goal: 'brustkorb', baustein: 'TB4', color: 'cyan',
    durationLabel: '5–12 Min',
    shortDesc: 'Faszien lösen in 3 Stufen – Streichung, Schwingung, Tennisball',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Stufe wählen & lösen',
        text: 'Wähle eine Stufe und folge der Anleitung. Nach den Übungen kurz nachspüren: Wie fühlt sich dein Brustkorb an? Hat sich der Atem verändert – mehr Weite, mehr Fluss?',
        timer: { kind: 'stages', stages: FASZIEN_STAGES },
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// ZIEL: BASIS & MENTAL — TB1 Zwerchfell, TB2 Atemmuskel, Vollatmung, DeepFlow, TB7/TB8 …
// ════════════════════════════════════════════════════════════════════════════

const BASIS_MODULES = [
  {
    id: 'tb1-zwerchfellatmung',
    name: 'Zwerchfellatmung trainieren',
    goal: 'basis', baustein: 'TB1', color: 'indigo',
    durationLabel: '5–8 Min',
    shortDesc: 'Bauch hebt sich, Brust bleibt ruhig – die natürliche Atmung zurücklernen',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Hände als Feedback platzieren',
        text: 'Leg dich entspannt auf den Rücken, gerne mit leicht erhöhten Knien. Eine Hand auf den Bauch, die andere auf die Brust.',
        timer: { kind: 'manual' },
      },
      {
        title: 'In den Bauch atmen – 5–8 Min',
        text: 'Langsam und tief durch die Nase einatmen – der Bauch hebt sich, die Brust bewegt sich nur minimal. Durch leicht geöffnete Lippen wieder ausströmen lassen, der Bauch senkt sich. Wiederhole, bis sich das Atemmuster natürlicher anfühlt.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',  duration: 4, instruction: 'In den Bauch einatmen' },
          { type: 'out', duration: 6, instruction: 'Durch die Lippen ausströmen' },
        ], totalSec: 300 },
      },
    ],
  },
  {
    id: 'tb2-atemmuskeltraining',
    name: 'Atemmuskeltraining',
    goal: 'basis', baustein: 'TB2', color: 'purple',
    durationLabel: '15–24 Min',
    shortDesc: 'Drei Stufen mit Relaxator/Strohhalm (2–4 mm) – Atemmuskulatur kräftigen',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Material vorbereiten',
        text: 'Nutze einen Relaxator oder einen sehr dünnen Strohhalm (ca. 2–4 mm), damit dein Atemmuskel gegen echten Widerstand arbeitet. Relaxator zwischen die Lippen nehmen, Widerstand einstellen; Einatmung zunächst entspannt durch die Nase, dann komplett über das Gerät atmen.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Stufe 1 – Grundspannung aufbauen (5–8 Min)',
        text: 'Aufrecht hinsetzen. Tief durch die Nase einatmen, langsam und gleichmäßig durch den Relaxator (Stufe 1–2) oder Strohhalm ausatmen. In deinem natürlichen Rhythmus für 5–8 Minuten. Gleichmäßiger Atemfluss ohne Pressen – wenn du arbeiten musst, ist der Widerstand richtig.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',  duration: 3, instruction: 'Durch die Nase ein' },
          { type: 'out', duration: 5, instruction: 'Durch den Widerstand aus' },
        ], totalSec: 360 },
      },
      {
        title: 'Stufe 2 – Atemkontrolle intensivieren (5–8 Min)',
        text: 'Tief durch den Relaxator (Stufe 2–3) ein- und vollständig wieder ausatmen. Atemvolumen und Tempo ähnlich wie Stufe 1 – der höhere Widerstand fordert dich stärker. 5–8 Minuten mit kurzen Pausen wenn nötig.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',  duration: 4, instruction: 'Durch den Widerstand ein' },
          { type: 'out', duration: 5, instruction: 'Durch den Widerstand aus' },
        ], totalSec: 360 },
      },
      {
        title: 'Stufe 3 – Belastung steigern (5–8 Min)',
        text: 'Tief durch den Relaxator (Stufe 4–5) ein- und ausatmen. Versuche, den gesamten Atemzyklus in nur 4–5 Sekunden zu absolvieren – bei vollem Atemvolumen. 5–8 Minuten wiederholen.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',  duration: 2, instruction: 'Schnell & voll ein' },
          { type: 'out', duration: 2.5, instruction: 'Schnell & voll aus' },
        ], totalSec: 360 },
      },
    ],
  },
  {
    id: 'zyklische-vollatmung',
    name: 'Zyklische Vollatmung',
    goal: 'basis', baustein: 'standalone', color: 'orange',
    durationLabel: '4–5 Min',
    shortDesc: 'Bauch → Brust → Extra-Atemzug, passiv aus – innerer Neustart',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      {
        title: 'Aufrichten',
        text: 'Im Sitzen oder Stehen, Oberkörper aufgerichtet, Schultern locker nach hinten, Brust leicht raus.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Vollatmung – 4–5 Min',
        text: 'Tief durch die Nase ein – zuerst in den Bauch, dann in die Brust. Wenn du voll bist, einen kleinen Extra-Atemzug obendrauf (wie ein Seufzer) – der Brustkorb weitet sich maximal. Dann loslassen: vollständig und passiv durch die Nase ausatmen, ohne Druck. Kurz nachspüren – du verspürst keinen Drang, sofort wieder einzuatmen. Wiederhole fließend für 4–5 Minuten.',
        timer: { kind: 'breathing', phases: [
          { type: 'in',    duration: 3, instruction: 'In den Bauch ein' },
          { type: 'in',    duration: 2, instruction: 'In die Brust weiten' },
          { type: 'extra', duration: 1, instruction: 'Kleiner Extra-Atemzug' },
          { type: 'out',   duration: 4, instruction: 'Passiv ausatmen' },
        ], totalSec: 270 },
      },
    ],
  },
  {
    id: 'tb7-bodyscan',
    name: 'Bodyscan',
    goal: 'basis', baustein: 'TB7', color: 'indigo',
    durationLabel: '10–15 Min',
    shortDesc: 'Aufmerksamkeit systematisch durch den Körper – loslassen Schritt für Schritt',
    source: 'Tom Sietas – DeepFlow',
    audioFile: '/audio/Body%20Scan.mp3',
    steps: [
      {
        title: 'Ankommen',
        text: 'Ruhiger Ort. Auf den Rücken legen oder bequem aufrecht sitzen. Augen schließen, einen Moment den Atem spüren, ohne ihn zu verändern. Einfach da sein.',
        timer: { kind: 'countdown', duration: 60 },
      },
      {
        title: 'Kopf & Gesicht',
        text: 'Aufmerksamkeit auf Gesicht: Stirn, Augen, Kiefer. Wo Spannung sitzt, beim Ausatmen sanft lösen. Weiter über Schädelkrone und Hinterkopf zum Nacken – Muskeln und Faszien mit jedem Ausatmen weicher werden lassen.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Durch den Körper wandern',
        text: 'Von Nacken zu Schultern, Armen, Brust, Bauch bis Becken, Oberschenkeln, Knien, Waden, Füßen. Jeweils einige Atemzüge bleiben. Spannung nicht bekämpfen – bewusst dorthin atmen und beim Ausatmen ein Stück loslassen. Gedanken einfach bemerken, ohne zu bewerten, und sanft zum Körper zurückkehren.',
        timer: { kind: 'manual' },
      },
      {
        title: 'Abschluss',
        text: 'Den ganzen Körper als Einheit wahrnehmen – wie weich die Muskeln, wie ruhig der Atem. Wenn du bereit bist, langsam die Augen öffnen, Arme und Beine bewegen, strecken.',
        timer: { kind: 'manual' },
      },
    ],
  },
]

// ─── Standalone mentale Techniken (manual, aus oberem MD-Teil) ───────────────
const MENTAL_MODULES = [
  {
    id: 'imagination-positiver-emotionen',
    name: 'Imagination positiver Emotionen',
    goal: 'basis', baustein: 'standalone', color: 'pink',
    durationLabel: '5–10 Min',
    shortDesc: 'Positive Erinnerung aktivieren und im Körper verankern',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Ankommen', text: 'Im Sitzen oder Liegen, Augen gerne schließen. Ein paarmal ruhig und tief durch die Nase ein- und ausatmen. Mit jeder Ausatmung mehr loslassen.', timer: { kind: 'manual' } },
      { title: 'Erinnerung aufrufen', text: 'Rufe eine Situation ins Gedächtnis, die dich mit Freude, Dankbarkeit oder Stolz erfüllt. Wenn du magst, lege eine oder beide Hände auf die Brust über dem Herzen. Tauche ein: Farben, Geräusche, Atmosphäre, vielleicht ein Geruch.', timer: { kind: 'manual' } },
      { title: 'Gefühl verstärken & mitnehmen', text: 'Lenke die Aufmerksamkeit auf das Gefühl – Wärme in der Brust, Kribbeln, Weite. Stell dir vor, es breitet sich wie eine Welle in jeder Zelle aus. Verweile einige Atemzüge. Dann langsam zurückkommen, Hände/Füße bewegen, Augen öffnen – und das Gefühl mitnehmen.', timer: { kind: 'manual' } },
    ],
  },
  {
    id: 'hand-auf-herz',
    name: 'Hand-auf-Herz-Technik',
    goal: 'basis', baustein: 'standalone', color: 'pink',
    durationLabel: '1–3 Min',
    shortDesc: 'Sofortige Beruhigung durch Berührung – aktiviert Oxytocin',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Hand aufs Herz', text: 'Tief einatmen und wahrnehmen, wie sich der Brustkorb hebt und senkt. Hand sanft auf die Mitte der Brust legen – Wärme der eigenen Berührung spüren. Langsam ausatmen und Spannung nach und nach loslassen. Wenn angenehm, beide Hände auflegen. Eine Minute so bleiben, auf Wärme und Atembewegung konzentriert.', timer: { kind: 'countdown', duration: 60 } },
    ],
  },
  {
    id: 'fuenf-finger-technik',
    name: '5-Finger-Technik',
    goal: 'basis', baustein: 'standalone', color: 'indigo',
    durationLabel: '1–2 Min',
    shortDesc: 'Fünf Finger, fünf Sinne – schnell zurück in den Moment',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Durch die Sinne gehen', text: 'Daumen – Sehen: fünf Dinge bewusst wahrnehmen (Farben, Formen, Bewegungen). Zeigefinger – Hören: Augen schließen, vier Geräusche. Mittelfinger – Fühlen: drei Körperempfindungen (Füße am Boden, Temperatur, Kleidung). Ringfinger – Riechen: zwei Gerüche. Kleiner Finger – Schmecken: den Mundraum wahrnehmen. Dauert nur 1–2 Minuten und bringt dich direkt in die Gegenwart.', timer: { kind: 'manual' } },
    ],
  },
  {
    id: 'gedankenstopp',
    name: 'Gedankenstopp',
    goal: 'basis', baustein: 'standalone', color: 'indigo',
    durationLabel: '2–5 Min',
    shortDesc: 'Mentale Notbremse – Gedankenspirale unterbrechen',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Eskalation erkennen', text: 'Achte darauf, wann die Gedanken zu rasen beginnen: Worst-Case-Szenarien, schnellerer Herzschlag, Anspannung, das Gefühl, den Überblick zu verlieren.', timer: { kind: 'manual' } },
      { title: 'STOPP & zurücktreten', text: 'Sag innerlich oder leise „STOPP!" – wie eine mentale Pause-Taste. Tritt gedanklich oder physisch einen kleinen Schritt zurück, verändere leicht die Körperhaltung.', timer: { kind: 'manual' } },
      { title: 'Atmen & neu fokussieren', text: 'Langsam einatmen, die Ausatmung bewusst verlängern – der Herzschlag beruhigt sich. Frag dich: Was ist jetzt die eine Sache, die ich tun kann? Was kann ich aktiv beeinflussen? Ersetze den panischen durch einen sachlichen Gedanken („Ich habe mich vorbereitet, ich kann das."). Bei Bedarf wiederholen.', timer: { kind: 'manual' } },
    ],
  },
  {
    id: 'reflexion-perspektivwechsel',
    name: 'Reflexion & Perspektivwechsel',
    goal: 'basis', baustein: 'standalone', color: 'indigo',
    durationLabel: '5–10 Min',
    shortDesc: 'Stressige Situation aus neuem Blickwinkel betrachten',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Situation & Reaktion', text: 'Denke an eine stressige Situation der letzten Woche, in der du dich angegriffen oder überfordert gefühlt hast. Welche Gedanken gingen dir durch den Kopf? Welche Emotionen lösten sie aus? Wie reagierte dein Körper?', timer: { kind: 'manual' } },
      { title: 'Alternative Sichtweise', text: 'Betrachte dieselbe Situation als unbeteiligter Beobachter oder Coach. Was würdest du einem guten Freund raten? Gab es etwas Positives oder etwas zu lernen? Wie hätte jemand mit großem Selbstvertrauen reagiert?', timer: { kind: 'manual' } },
      { title: 'Neuen Gedanken verankern', text: 'Formuliere einen neuen, hilfreichen Gedanken („Ich kann daraus lernen.", „Das sagt mehr über den anderen als über mich."). Lies ihn laut oder wiederhole ihn innerlich. Spüre den Effekt: Was verändert sich in Haltung, Atem, Emotionen?', timer: { kind: 'manual' } },
    ],
  },
  {
    id: 'fokus-briefing',
    name: 'Fokus setzen – Mentales Briefing',
    goal: 'basis', baustein: 'standalone', color: 'indigo',
    durationLabel: '5 Min',
    shortDesc: 'Morgens Intention und Schlüsselwort für den Tag setzen',
    source: 'Tom Sietas – DeepFlow',
    steps: [
      { title: 'Drei Atemzüge', text: 'Bevor du aufstehst, bleib noch liegen. Augen schließen, drei tiefe Atemzüge. Erlaube dir, einen Moment einfach da zu sein.', timer: { kind: 'manual' } },
      { title: 'Intention & Visualisierung', text: 'Frag dich: Wie möchte ich heute durch diesen Tag gehen? Entscheide dich für eine klare innere Ausrichtung. Visualisiere eine konkrete Situation (Meeting, Gespräch, Aufgabe) und sieh dich genauso agieren, wie du es dir vornimmst – ruhig, souverän, klar.', timer: { kind: 'manual' } },
      { title: 'Schlüsselwort verankern', text: 'Wähle ein Wort oder einen kurzen Satz, der deinen Fokus auf den Punkt bringt (Klarheit, Ruhe bewahren, Energie lenken). Wiederhole ihn dreimal in Gedanken. Erst dann steh bewusst auf.', timer: { kind: 'manual' } },
    ],
  },
  {
    id: 'farbraummeditation',
    name: 'Farbraummeditation',
    goal: 'basis', baustein: 'TB8', color: 'pink',
    durationLabel: '15–20 Min',
    shortDesc: 'Geführte Reise durch farbige Räume – Vertrauen, Liebe, Dankbarkeit verankern',
    source: 'Tom Sietas – DeepFlow',
    audioFile: '/audio/Farbraum%20Meditation.mp3',
    steps: [
      { title: 'Audio starten & ankommen', text: 'Diese Meditation lebt vom Gefühl und ist für die geführte Audioversion gedacht. Starte das Audio, leg oder setz dich bequem, Augen schließen. Lass dich auf Bilder, Klänge und Empfindungen ein.', timer: { kind: 'manual' } },
      { title: 'Verbundenheit spüren', text: 'Rufe einen Moment mit einem Menschen in Erinnerung, den du zutiefst liebst. Spüre die Verbundenheit, die Wärme, deinen Herzschlag. Lass das Gefühl sich ausbreiten – ohne Druck. Wenn es sich gut anfühlt, lege die Hand aufs Herz.', timer: { kind: 'manual' } },
      { title: 'Erster Raum – Blau (Vertrauen)', text: 'Nimm diesen Menschen an die Hand und betritt gemeinsam einen tiefblauen Raum. Alles ist blau – der Raum des Vertrauens. Mit jedem Atemzug wächst dein Vertrauen in dich selbst, ins Leben, in den nächsten Schritt. Folge der Audioführung durch die weiteren Räume.', timer: { kind: 'manual' } },
    ],
  },
]

// ─── DeepFlow-Methode: 6-Stufen-Sequenz (timer-getriebene Stufen) ───────────
const DEEPFLOW_MODULE = {
  id: 'deepflow-methode',
  name: 'DeepFlow-Methode',
  goal: 'basis', baustein: 'standalone', color: 'indigo',
  durationLabel: '~10 Min',
  shortDesc: '6-Stufen-Sequenz – Vollatmung, Dreieck, Emotion, Kohärenz, Fokus, Atemanhalten',
  source: 'Tom Sietas – DeepFlow',
  steps: [
    { title: 'Stufe 1 – Vollatmung', text: 'Tief durch die Nase ein (Bauch → Brust → kleiner Extra-Atemzug), Brustkorb maximal weiten. Vollständig passiv ausatmen und 5–10 Sek warten. Wiederhole, wobei du nach dem Ausatmen 10, dann 15 Sek innehältst.', timer: { kind: 'breathing', phases: [
        { type: 'in', duration: 3, instruction: 'Bauch → Brust' },
        { type: 'extra', duration: 1, instruction: 'Extra-Atemzug' },
        { type: 'out', duration: 4, instruction: 'Passiv ausatmen' },
        { type: 'pause', duration: 8, instruction: 'Innehalten' },
      ], totalSec: 120 } },
    { title: 'Stufe 2 – Dreiecksatmung', text: 'Langsam ein und ohne aktive Unterstützung wieder aus. Alle Muskeln loslassen. Nach der Ausatmung innehalten (anfangs 2–5 Sek), bei jeder Wiederholung etwas länger – so lange bequem. Mit jeder Ausatmung tiefer sinken.', timer: { kind: 'breathing', phases: [
        { type: 'in', duration: 4, instruction: 'Einatmen' },
        { type: 'out', duration: 4, instruction: 'Loslassen' },
        { type: 'pause', duration: 5, instruction: 'Innehalten' },
      ], totalSec: 120 } },
    { title: 'Stufe 3 – Positive Emotion', text: 'Rufe eine Situation voller Freude, Dankbarkeit oder Stolz ins Gedächtnis. Sieh die Farben, höre die Geräusche, spüre die Atmosphäre. Tauche ins Gefühl ein – Wärme in der Brust, ein Lächeln. Bleibe einige Atemzüge und lass es wachsen.', timer: { kind: 'countdown', duration: 60 } },
    { title: 'Stufe 4 – Kohärenzatmung', text: 'Sanft und gleichmäßig durch die Nase ein (ca. 5 Sek) und ebenso ruhig wieder aus (5 Sek). Nicht anhalten, kontinuierlich fließen lassen. Spüre, wie sich der Herzschlag anpasst und eine tiefe innere Ruhe entsteht.', timer: { kind: 'breathing', phases: [
        { type: 'in', duration: 5, instruction: 'Einatmen' },
        { type: 'out', duration: 5, instruction: 'Ausatmen' },
      ], totalSec: 60 } },
    { title: 'Stufe 5 – Fokus setzen', text: 'Setze die Kohärenzatmung fort. Mit welcher Energie möchtest du den Herausforderungen begegnen? Visualisiere eine konkrete Situation und dich, wie du ruhig, souverän, klar agierst. Wähle ein Schlüsselwort (Klarheit, Ruhe bewahren, Energie lenken) und wiederhole es dreimal in Gedanken.', timer: { kind: 'countdown', duration: 60 } },
    { title: 'Stufe 6 – Abschluss: Luft anhalten', text: 'Ein letztes Mal vollständig einatmen und die Luft passiv ausströmen lassen. Verweile 20–30 Sek in der Ausatmung, so lange angenehm. Spüre den Körper von Kopf bis Fuß – die Wärme, die entspannten Muskeln. Dann sanft einatmen und nachspüren.', timer: { kind: 'hold-reflex', rounds: [{ extra: 0, rest: 0 }], note: 'In der Ausatmung halten, 20–30 Sek.' } },
  ],
}

// ════════════════════════════════════════════════════════════════════════════
// Export-Katalog
// ════════════════════════════════════════════════════════════════════════════

export const MODULES = [
  ...APNOE_MODULES,
  ...HRV_MODULES,
  ...BRUSTKORB_MODULES,
  ...BASIS_MODULES,
  ...MENTAL_MODULES,
  DEEPFLOW_MODULE,
]

const MODULE_BY_ID = Object.fromEntries(MODULES.map(m => [m.id, m]))

export function getModule(id) {
  return MODULE_BY_ID[id] || null
}

// Empfohlenes Modul je Wochenplan-Typ (Tagesempfehlung)
export const TYPE_DEFAULT_MODULE = {
  CO2:    'tb6-co2-1',
  O2:     'tb5-atemanhalten-3-o2',
  MUSKEL: 'tb2-atemmuskeltraining',
  FLEX:   'kohaerenzatmung',
}

export function getRecommendedModule(type) {
  return getModule(TYPE_DEFAULT_MODULE[type] || 'kohaerenzatmung')
}

// Module nach Ziel gruppiert (für die Bibliothek) – einmal berechnet
const MODULES_BY_GOAL = (() => {
  const groups = { apnoe: [], hrv: [], brustkorb: [], basis: [] }
  for (const m of MODULES) (groups[m.goal] || groups.basis).push(m)
  return groups
})()

export function getModulesByGoal() {
  return MODULES_BY_GOAL
}

// Baut aus einem Modul die Session-Struktur für ActiveSession.
export function buildModuleSession(moduleId) {
  const m = getModule(moduleId)
  if (!m) return null
  return {
    type: m.id,
    moduleId: m.id,
    label: m.name,
    goal: m.goal,
    color: m.color,
    totalDuration: m.durationLabel,
    safety: m.safety || null,
    audioFile: m.audioFile || null,
    steps: m.steps.map((s, i) => ({
      id: `${m.id}-${i}`,
      name: s.title,
      text: s.text,
      role: m.baustein !== 'standalone' ? m.baustein : '',
      color: m.color,
      timer: s.timer,
    })),
  }
}
