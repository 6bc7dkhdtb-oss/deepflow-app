// ─────────────────────────────────────────────────────────────────────────────
// trainingModules.js — Source of truth für den Trainingsbereich.
//
// Es gibt genau 4 Trainings. Jedes startet mit demselben Aufwärm-Block
// (Zwerchfellatmung → Brustkorbdehnung) und führt danach in die Hauptübung,
// die – wo sinnvoll – in mehreren Stufen (`levels`) zum selbst Steigern vorliegt.
// Schritte/Stufen sind 1:1 aus dem Buch (Tom Sietas – DeepFlow, Atmungsübungen.md).
//
// Jeder Schritt trägt einen `timer`-Descriptor, den ActiveSession interpretiert:
//   'breathing'  { phases:[{type:'in'|'out'|'hold'|'pause'|'extra', duration, instruction}], totalSec, then? }
//   'countdown'  { duration }
//   'hold-table' { rounds:[{hold, rest}], holdEditable? }   literale Halte-/Pausenzeiten
//   'hold-reflex'{ rounds:[{extra, rest}], note }           halten bis Atemreiz, dann +extra Sek
//   'hold-max'   { note }                                   Maximalrunde – Stoppuhr bis „Beenden"
//   'walk-hold'  { rounds:[{steps, rest}] }                 X Schritte halten + Pause
//   'stages'     { stages:[…] }                             Stufen-Auswahl (Brustkorb)
//   'manual'     { }                                        reine Anleitung, weiter per Button
// ─────────────────────────────────────────────────────────────────────────────

export const APNOE_SAFETY = [
  'Niemals allein im Wasser trainieren – an Land ist Alleintraining ok.',
  'Bei Vorerkrankungen (Herz-Kreislauf, Lunge, Nervensystem) vorher ärztlich abklären.',
  'Bei Schwindel/Benommenheit sofort ruhig ausatmen und pausieren.',
  'Am besten nüchtern (≥5 Std. nichts gegessen), gut hydriert, morgens.',
]

// ════════════════════════════════════════════════════════════════════════════
// AUFWÄRMEN — vor jedem Training: Zwerchfellatmung → Brustkorbdehnung
// ════════════════════════════════════════════════════════════════════════════

// TB3: Brustkorbdehnung – Stufen 1–3, je Stufe die vier Dehnungsgruppen.
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

// TB1 (Zwerchfellatmung) + TB3 (Brustkorbdehnung) als gemeinsamer Aufwärm-Block.
const PREP_STEPS = [
  {
    title: 'Zwerchfellatmung – Hände platzieren',
    role: 'Aufwärmen',
    color: 'indigo',
    text: 'Leg dich entspannt auf den Rücken, gerne mit leicht erhöhten Knien. Eine Hand auf den Bauch, die andere auf die Brust. Die beiden Hände sind dein Feedback.',
    timer: { kind: 'manual' },
  },
  {
    title: 'Zwerchfellatmung – in den Bauch atmen',
    role: 'Aufwärmen',
    color: 'indigo',
    text: 'Langsam und tief durch die Nase einatmen – der Bauch hebt sich, die Brust bewegt sich nur minimal. Durch leicht geöffnete Lippen wieder ausströmen lassen, der Bauch senkt sich. Wiederhole, bis sich das Atemmuster natürlich anfühlt.',
    timer: { kind: 'breathing', phases: [
      { type: 'in',  duration: 4, instruction: 'In den Bauch einatmen' },
      { type: 'out', duration: 6, instruction: 'Durch die Lippen ausströmen' },
    ], totalSec: 300 },
  },
  {
    title: 'Brustkorbdehnung – Stufe wählen & dehnen',
    role: 'Aufwärmen',
    color: 'cyan',
    text: 'Kurz die Schultern vor und zurück kreisen. Wähle dann eine Intensitätsstufe (1 = Einstieg, 3 = fortgeschritten) und gehe geführt durch die vier Dehnungsgruppen. Ein flexibler Brustkorb schafft Raum für tiefere Atemzüge.',
    timer: { kind: 'stages', stages: BRUSTKORB_STAGES },
  },
]

// ════════════════════════════════════════════════════════════════════════════
// DIE 4 TRAININGS
// ════════════════════════════════════════════════════════════════════════════

export const TRAININGS = [
  // ── 1) Atemanhalten Grundlagen ────────────────────────────────────────────
  {
    id: 'atemanhalten-grundlagen',
    type: 'GRUND',
    name: 'Atemanhalten Grundlagen',
    goal: 'apnoe', color: 'blue',
    durationLabel: '~15 Min',
    shortDesc: 'Atemreiz kennenlernen und schrittweise länger halten – die Basis fürs Apnoe-Training.',
    safety: APNOE_SAFETY,
    levels: [
      {
        id: 1, name: 'Stufe 1 – Atemreiz kennenlernen',
        shortDesc: 'Bis zum Atemreiz halten, dann 10 Sek länger · 3 Runden',
        steps: [
          {
            title: 'Vollständig ausatmen',
            text: 'Atme einmal ganz aus – entspannt und vollständig, um CO₂ aus der Lunge zu entlassen. Dann tief und ruhig einatmen (3D-Atmung: Bauch, Flanken, Brustkorb).',
            timer: { kind: 'manual' },
          },
          {
            title: 'Tief einatmen & halten (3 Runden)',
            text: 'Halte die Luft an. Sobald du den ersten Atemreiz spürst – ein Ziehen im Bauch, Druck in der Brust oder das Gefühl, schlucken zu müssen – bleib noch 10 Sekunden ruhig in der Luftanhaltephase. Dann sanft ausatmen. Dazwischen je 1–2 Min normal weiteratmen.',
            timer: { kind: 'hold-reflex', rounds: [{ extra: 10, rest: 90 }, { extra: 10, rest: 90 }, { extra: 10, rest: 0 }], note: 'Schultern & Nacken locker lassen.' },
          },
        ],
      },
      {
        id: 2, name: 'Stufe 2 – Im Reiz bleiben',
        shortDesc: '15–30 Sek über den Atemreiz hinaus halten · 3 Runden',
        steps: [
          {
            title: 'Ausatmen & voll einatmen',
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
        id: 3, name: 'Stufe 3 – Deine Maximalrunde',
        shortDesc: '3 Runden, je länger – Runde 3 Maximalversuch (Stoppuhr)',
        extraSafety: ['Pulsoximeter nutzen – Sättigung über 85 % halten.', 'Runde 3: halten bis Maximum oder 85 % Sättigung – ruhig und fokussiert bleiben.'],
        steps: [
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
        id: 4, name: 'Stufe 4 – Milde Hyperventilation',
        shortDesc: 'Erweiterte Reizsetzung – Runde 3 mit 30 Sek leichtem Überatmen',
        extraSafety: ['Nur an Land. Kribbeln in Händen/Füßen/Gesicht = zu stark überventiliert → abbrechen.'],
        steps: [
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
    ],
  },

  // ── 2) CO₂-Tabelle ────────────────────────────────────────────────────────
  {
    id: 'co2-tabelle',
    type: 'CO2',
    name: 'CO₂-Tabelle',
    goal: 'apnoe', color: 'blue',
    durationLabel: '~12 Min',
    shortDesc: 'CO₂-Toleranz verschieben – feste Haltezeit, kürzer werdende Pausen.',
    safety: ['Bei Schwindel/Unwohlsein sofort beenden und ruhig weiteratmen.'],
    levels: [
      {
        id: 1, name: 'Stufe 1 – Toleranzgrenze',
        shortDesc: 'Feste Haltezeit, Pausen 60→15 s · 5 Runden',
        steps: [
          {
            title: 'Haltezeit wählen',
            text: 'Wähle eine Luftanhaltezeit, die du aktuell sicher halten kannst – z. B. 45 oder 60 Sekunden. Diese hältst du in allen Runden konstant; nur die Pausen werden kürzer. Stelle die Haltezeit gleich am Timer per +/- ein.',
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
        id: 2, name: 'Stufe 2 – Walk & Hold',
        shortDesc: 'Gehen + Luftanhalten · 6 Runden, kürzer werdende Pausen',
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
        id: 3, name: 'Stufe 3 – Stabil bei höherer Last',
        shortDesc: 'Walk & Hold mit 25 Schritten / zügiger · 6 Runden',
        safety: ['Fordern, nicht überfordern – du solltest jederzeit ruhig einatmen können.', 'Bei Unsicherheit Oximeter nutzen; Sättigung sollte sich in Bewegung schnell normalisieren.'],
        steps: [
          {
            title: 'Belastung erhöhen',
            text: 'Struktur wie Walk & Hold, aber höhere Anfangsbelastung: ein paar Schritte mehr beim Luftanhalten (25 statt 20) oder ein spürbar zügigeres Gehtempo. So steigt der CO₂-Druck ab Runde 1 schneller – du beginnst näher an deiner Reizzone. Ziel: diese Schwelle bewusst treffen und stabil bleiben.',
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
    ],
  },

  // ── 3) O₂-Tabelle (keine Stufen – Basis einstellbar) ──────────────────────
  {
    id: 'o2-tabelle',
    type: 'O2',
    name: 'O₂-Tabelle',
    goal: 'apnoe', color: 'teal',
    durationLabel: '~10 Min',
    shortDesc: 'Sauerstoff effizienter verwerten – zunehmende Haltezeiten, feste 10-Sek-Pausen.',
    safety: APNOE_SAFETY,
    steps: [
      {
        title: 'Basis wählen',
        text: 'Setz dich aufrecht und ruhig hin. Atme 1–2 Minuten gleichmäßig. Du hältst in jeder Runde etwas länger (je +5 Sek), die Pausen bleiben konstant bei 10 Sekunden. Wenn dir 30 Sekunden als Einstieg zu niedrig sind, verschiebe die Basis gleich am Timer per +/- nach oben.',
        timer: { kind: 'manual' },
      },
      {
        title: 'O₂-Tabelle – 5 Runden',
        text: 'Zunehmende Haltezeiten bei festen 10-Sek-Pausen: 30 → 35 → 40 → 45 → 50 Sek. Optional mit Oximeter: in Runde 1 bei 2–3 % Absenkung beginnen und je Runde um 2–3 % steigern. Halte die Pausen konstant – sie sind Teil des Reizes.',
        timer: { kind: 'hold-table', rounds: [
          { hold: 30, rest: 10 }, { hold: 35, rest: 10 }, { hold: 40, rest: 10 },
          { hold: 45, rest: 10 }, { hold: 50, rest: 0 },
        ], holdEditable: true },
      },
    ],
  },

  // ── 4) Atemmuskeltraining (Stufe wählen) ──────────────────────────────────
  {
    id: 'atemmuskeltraining',
    type: 'MUSKEL',
    name: 'Atemmuskeltraining',
    goal: 'basis', color: 'purple',
    durationLabel: '~10 Min',
    shortDesc: 'Atemmuskulatur mit Relaxator/Strohhalm kräftigen – eine Stufe pro Einheit.',
    levels: [
      {
        id: 1, name: 'Stufe 1 – Grundspannung',
        shortDesc: 'Relaxator/Strohhalm Stufe 1–2 · ruhiger Atemfluss',
        steps: [
          {
            title: 'Material & Einstellung',
            text: 'Nutze einen Relaxator (Stufe 1–2) oder einen sehr dünnen Strohhalm (ca. 2–4 mm). Relaxator zwischen die Lippen nehmen; Einatmung zunächst entspannt durch die Nase, Ausatmung komplett über das Gerät.',
            timer: { kind: 'manual' },
          },
          {
            title: 'Grundspannung aufbauen (5–8 Min)',
            text: 'Aufrecht hinsetzen. Tief durch die Nase einatmen, langsam und gleichmäßig durch den Widerstand ausatmen. In deinem natürlichen Rhythmus. Gleichmäßiger Atemfluss ohne Pressen – wenn du arbeiten musst, ist der Widerstand richtig.',
            timer: { kind: 'breathing', phases: [
              { type: 'in',  duration: 3, instruction: 'Durch die Nase ein' },
              { type: 'out', duration: 5, instruction: 'Durch den Widerstand aus' },
            ], totalSec: 360 },
          },
        ],
      },
      {
        id: 2, name: 'Stufe 2 – Atemkontrolle',
        shortDesc: 'Relaxator Stufe 2–3 · höherer Widerstand',
        steps: [
          {
            title: 'Material & Einstellung',
            text: 'Relaxator auf Stufe 2–3 stellen (oder gleichen dünnen Strohhalm). Atemvolumen und Tempo ähnlich wie Stufe 1 – der höhere Widerstand fordert dich stärker.',
            timer: { kind: 'manual' },
          },
          {
            title: 'Atemkontrolle intensivieren (5–8 Min)',
            text: 'Tief durch den Widerstand ein- und vollständig wieder ausatmen. 5–8 Minuten mit kurzen Pausen wenn nötig.',
            timer: { kind: 'breathing', phases: [
              { type: 'in',  duration: 4, instruction: 'Durch den Widerstand ein' },
              { type: 'out', duration: 5, instruction: 'Durch den Widerstand aus' },
            ], totalSec: 360 },
          },
        ],
      },
      {
        id: 3, name: 'Stufe 3 – Belastung steigern',
        shortDesc: 'Relaxator Stufe 4–5 · voller Zyklus in 4–5 Sek',
        steps: [
          {
            title: 'Material & Einstellung',
            text: 'Relaxator auf Stufe 4–5 stellen. Hoher Widerstand – Ziel ist ein voller Atemzyklus in nur 4–5 Sekunden bei vollem Atemvolumen.',
            timer: { kind: 'manual' },
          },
          {
            title: 'Belastung steigern (5–8 Min)',
            text: 'Tief durch den Relaxator ein- und ausatmen. Versuche, den gesamten Atemzyklus in nur 4–5 Sekunden zu absolvieren – bei vollem Atemvolumen. 5–8 Minuten wiederholen.',
            timer: { kind: 'breathing', phases: [
              { type: 'in',  duration: 2, instruction: 'Schnell & voll ein' },
              { type: 'out', duration: 2.5, instruction: 'Schnell & voll aus' },
            ], totalSec: 360 },
          },
        ],
      },
    ],
  },
]

// ════════════════════════════════════════════════════════════════════════════
// Zugriff & Session-Builder
// ════════════════════════════════════════════════════════════════════════════

const TRAINING_BY_ID = Object.fromEntries(TRAININGS.map(t => [t.id, t]))

export function getTraining(id) {
  return TRAINING_BY_ID[id] || null
}

// Wochenplan-Typ → Training
export const TYPE_TRAINING = {
  GRUND:  'atemanhalten-grundlagen',
  CO2:    'co2-tabelle',
  O2:     'o2-tabelle',
  MUSKEL: 'atemmuskeltraining',
}

export function getTrainingForType(type) {
  return getTraining(TYPE_TRAINING[type] || 'atemanhalten-grundlagen')
}

// Default-Stufe (mittlerer Einstieg = Stufe 1)
export function getDefaultLevelId(training) {
  return training?.levels?.[0]?.id ?? null
}

// Baut aus Training + gewählter Stufe die Session-Struktur für ActiveSession.
// Reihenfolge: Aufwärmen (Zwerchfell → Brustkorb) + Hauptschritte der Stufe.
export function buildTrainingSession(trainingId, levelId = null) {
  const t = getTraining(trainingId)
  if (!t) return null

  const level = t.levels
    ? (t.levels.find(l => l.id === levelId) || t.levels[0])
    : null
  const mainSteps = level ? level.steps : (t.steps || [])

  const safety = [...(t.safety || []), ...(level?.extraSafety || level?.safety || [])]

  const prep = PREP_STEPS.map((s, i) => ({
    id: `${t.id}-prep-${i}`,
    name: s.title,
    text: s.text,
    role: s.role,
    color: s.color,
    timer: s.timer,
  }))

  const main = mainSteps.map((s, i) => ({
    id: `${t.id}-main-${i}`,
    name: s.title,
    text: s.text,
    role: level ? level.name : 'Hauptübung',
    color: t.color,
    timer: s.timer,
  }))

  return {
    type: t.type,
    moduleId: t.id,
    trainingId: t.id,
    levelId: level ? level.id : null,
    label: t.name + (level ? ` · ${level.name.replace(/^Stufe \d+ – /, '')}` : ''),
    goal: t.goal,
    color: t.color,
    totalDuration: t.durationLabel,
    safety: safety.length ? safety : null,
    audioFile: t.audioFile || null,
    steps: [...prep, ...main],
  }
}
