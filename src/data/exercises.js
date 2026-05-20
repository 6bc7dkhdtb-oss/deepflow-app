export const CATEGORIES = [
  { id: 'alle', label: 'Alle' },
  { id: 'fokus', label: 'Fokus & Klarheit' },
  { id: 'entspannung', label: 'Entspannung & Stress' },
  { id: 'einschlafen', label: 'Einschlafen' },
  { id: 'energie', label: 'Energie & Aktivierung' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'apnoe', label: 'Apnoe-Vorbereitung' },
]

export const CATEGORY_COLORS = {
  fokus: { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30', dot: 'bg-blue-400' },
  entspannung: { bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30', dot: 'bg-teal-400' },
  einschlafen: { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30', dot: 'bg-purple-400' },
  energie: { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30', dot: 'bg-orange-400' },
  meditation: { bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30', dot: 'bg-indigo-400' },
  apnoe: { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30', dot: 'bg-cyan-400' },
}

// timerPattern phases: type = 'in' | 'out' | 'hold' | 'pause'
export const exercises = [
  {
    id: 'zyklische-vollatmung',
    name: 'Zyklische Vollatmung',
    category: 'energie',
    duration: '4–5 Minuten',
    shortDesc: 'Aktivierend – Energie & mentale Schärfe durch vollständige Atemzyklen',
    icon: '⚡',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Zyklische Vollatmung aktiviert deinen gesamten Körper und füllt die Lungen vollständig. Der kleine Extra-Atemzug am Ende stimuliert das sympathische Nervensystem und erzeugt sofortige Wachheit.',
    steps: [
      {
        title: 'Vorbereitung',
        text: 'Setz oder leg dich bequem hin. Schließe die Augen. Atme 2–3 Mal normal aus, um anzukommen.',
      },
      {
        title: 'Einatmen – Bauch zuerst',
        text: 'Atme tief durch die Nase ein. Beginne damit, den Bauch nach vorne zu schieben (Zwerchfellatmung), dann erweitere die Brust nach oben. Fülle die Lungen von unten nach oben komplett.',
      },
      {
        title: 'Der Extra-Atemzug',
        text: 'Wenn du denkst, du bist voll – schnapp noch einen kleinen Schluck Luft obendrauf. Dieser Extra-Atemzug öffnet die letzten Lungenabschnitte und stimuliert das Nervensystem.',
      },
      {
        title: 'Passiv ausatmen',
        text: 'Lass die Luft vollständig und passiv aus. Kein aktives Pressen – lass einfach los. Bauch und Brust sinken wie von selbst.',
      },
      {
        title: 'Rhythmus halten',
        text: 'Wiederhole diesen Zyklus fließend für 4–5 Minuten. Kein Anhalten zwischen den Atemzügen – kontinuierliche, runde Bewegung.',
      },
      {
        title: 'Abschluss',
        text: 'Beende mit einem tiefen Ausatmen. Spüre 30 Sekunden nach – du wirst Kribbeln, Wärme oder erhöhte Wachheit wahrnehmen. Das ist normal und gewollt.',
      },
    ],
    tips: [
      'Ideal morgens oder vor dem Sport',
      'Bei Schwindel: verlangsamen oder kurz pausieren',
      'Nicht nüchtern nach dem Aufstehen – erst Wasser trinken',
    ],
  },

  {
    id: 'dreiecksatmung',
    name: 'Dreiecksatmung',
    category: 'entspannung',
    duration: '3–5 Minuten',
    shortDesc: 'Beruhigend – Aktiviert den Vagusnerv durch verlängerte Pause nach dem Ausatmen',
    icon: '△',
    hasTimer: true,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Das Dreieck besteht aus drei gleichmäßigen Phasen: Einatmen – Ausatmen – Pause. Die Pause nach dem Ausatmen (Leerhalten) aktiviert gezielt den Vagusnerv und bremst das Nervensystem.',
    timerPattern: {
      defaultDuration: 300,
      phases: [
        { name: 'Einatmen', type: 'in', duration: 4, color: 'blue', instruction: 'Ruhig durch die Nase einatmen' },
        { name: 'Ausatmen', type: 'out', duration: 4, color: 'indigo', instruction: 'Sanft durch den Mund ausatmen' },
        { name: 'Pause', type: 'pause', duration: 4, color: 'purple', instruction: 'Lungen leer – entspannt halten' },
      ],
    },
    steps: [
      {
        title: 'Positionierung',
        text: 'Aufrecht sitzen oder liegen. Schultern entspannen, Kiefer lockerlassen. Hände auf die Oberschenkel oder den Bauch legen.',
      },
      {
        title: 'Einatmen (3–5 Sek)',
        text: 'Durch die Nase ruhig und gleichmäßig einatmen. Bauch hebt sich zuerst, dann die Brust. Keine Eile.',
      },
      {
        title: 'Ausatmen (3–5 Sek)',
        text: 'Durch leicht geöffnete Lippen oder die Nase ausatmen. Gleich lang wie das Einatmen. Körper entspannt sich beim Ausatmen.',
      },
      {
        title: 'Pause nach Ausatmen (3–5 Sek)',
        text: 'Halte die Lungen leer – entspannt, nicht gepresst. Das ist der Schlüssel dieser Übung. Keine Anspannung, einfach Offenheit halten.',
      },
      {
        title: 'Rhythmus',
        text: 'Halte alle drei Phasen gleich lang. Beginne mit 3 Sekunden, steigere auf 5 Sekunden. Nach 3–5 Minuten wirst du eine tiefe Ruhe spüren.',
      },
    ],
    tips: [
      'Alle Phasen gleich lang – das ist das Dreieck',
      'Die Pause nach dem Ausatmen hat den stärksten Beruhigungseffekt',
      'Perfekt bei akutem Stress oder vor schwierigen Gesprächen',
    ],
  },

  {
    id: 'kohaerenzatmung',
    name: 'Kohärenzatmung',
    category: 'entspannung',
    duration: '5 Minuten',
    shortDesc: 'Synchronisiert Herz und Gehirn – maximale Herzratenvariabilität bei 5–6 Atemzügen/Min',
    icon: '♡',
    hasTimer: true,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Bei 5–6 Atemzügen pro Minute (ca. 5,5 Sek ein, 5,5 Sek aus) tritt das Herz in einen Kohärenz-Zustand. Herzrhythmus, Atmung und Gehirnwellen synchronisieren sich – das erzeugt tiefe Ruhe bei gleichzeitiger Wachheit.',
    timerPattern: {
      defaultDuration: 300,
      phases: [
        { name: 'Einatmen', type: 'in', duration: 5.5, color: 'blue', instruction: 'Sanft und gleichmäßig einatmen' },
        { name: 'Ausatmen', type: 'out', duration: 5.5, color: 'teal', instruction: 'Vollständig und entspannt ausatmen' },
      ],
    },
    steps: [
      {
        title: 'Ankommen',
        text: 'Setz dich aufrecht hin. Hand auf das Herz legen. 1 Minute normal atmen und beobachten.',
      },
      {
        title: 'Rhythmus finden (5,5 + 5,5 Sek)',
        text: 'Starte den Timer. Atme genau im Takt: 5,5 Sekunden ein, 5,5 Sekunden aus. Kein Anhalten. Fließende Übergänge.',
      },
      {
        title: 'Herz einbeziehen',
        text: 'Stell dir vor, du atmest durch das Herz. Lenke deine Aufmerksamkeit auf den Herzbereich. Dies verstärkt die Kohärenz-Wirkung.',
      },
      {
        title: 'Positive Emotion aktivieren',
        text: 'Ruf ein Gefühl von Dankbarkeit oder Fürsorge auf. Denke an jemanden oder etwas, für das du dankbar bist. Halte dieses Gefühl während des Atemens.',
      },
      {
        title: '5 Minuten halten',
        text: 'Bleibe 5 volle Minuten im Rhythmus. Die ersten 2 Minuten sind Einstieg – danach wirst du in den Flow-Zustand gleiten.',
      },
    ],
    tips: [
      'Genau 5,5 Sek pro Phase – das ist die "Resonanzfrequenz" des Herzens',
      'Der Timer gibt Ton-Signale zum Wechseln',
      'Kombinierbar mit der HeartMath-Technik',
      'Mindestens täglich 5 Min für messbare HRV-Verbesserung',
    ],
  },

  {
    id: 'boxatmung',
    name: 'Boxatmung',
    category: 'fokus',
    duration: '6–10 Runden (ca. 4 Min)',
    shortDesc: 'Fokus & Kontrolle – vier gleiche Phasen à 4 Sek für mentale Klarheit',
    icon: '□',
    hasTimer: true,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Boxatmung (Navy SEAL Technik) besteht aus vier gleichen Phasen à 4 Sekunden. Sie reguliert das Nervensystem, schärft den Fokus und wird von Einsatzkräften zur Stressregulation eingesetzt.',
    timerPattern: {
      defaultDuration: 240,
      phases: [
        { name: 'Einatmen', type: 'in', duration: 4, color: 'blue', instruction: 'Tief durch die Nase einatmen' },
        { name: 'Halten', type: 'hold', duration: 4, color: 'cyan', instruction: 'Atem oben halten – entspannt' },
        { name: 'Ausatmen', type: 'out', duration: 4, color: 'indigo', instruction: 'Kontrolliert durch den Mund ausatmen' },
        { name: 'Pause', type: 'pause', duration: 4, color: 'purple', instruction: 'Lungen leer – ruhig halten' },
      ],
    },
    steps: [
      {
        title: 'Aufrechte Haltung',
        text: 'Sitz aufrecht, Schultern zurück. Aktive aber entspannte Körperhaltung. Augen können offen oder geschlossen sein.',
      },
      {
        title: 'Phase 1: Einatmen – 4 Sek',
        text: 'Langsam und gleichmäßig durch die Nase einatmen. Zähle innerlich bis 4. Bauch und Brust füllen sich.',
      },
      {
        title: 'Phase 2: Halten – 4 Sek',
        text: 'Atem oben halten bei gefüllten Lungen. Keine Anspannung – entspannt halten. Zähle bis 4.',
      },
      {
        title: 'Phase 3: Ausatmen – 4 Sek',
        text: 'Durch leicht geöffnete Lippen oder die Nase kontrolliert ausatmen. Gleichmäßiger, ruhiger Fluss.',
      },
      {
        title: 'Phase 4: Pause – 4 Sek',
        text: 'Lungen leer halten. Entspannt und ruhig. Keine Anspannung. Warte dann auf die nächste Einatmung.',
      },
      {
        title: '6–10 Runden',
        text: 'Wiederhole das Muster 6–10 Mal. Mit wachsender Übung kannst du auf 6 Sekunden pro Phase steigern.',
      },
    ],
    tips: [
      'Wird von Navy SEALs und Spezialeinheiten zur Stressregulation genutzt',
      'Auch als "taktische Atmung" bekannt',
      'Ideal vor Präsentationen, Prüfungen oder Hochdrucksituationen',
      'Steigere die Phasen schrittweise von 4 auf 6 Sekunden',
    ],
  },

  {
    id: 'buteyko',
    name: 'Buteyko-Atmung',
    category: 'entspannung',
    duration: '10–15 Minuten',
    shortDesc: 'Sanfte Reduktion der Atemtiefe – reguliert CO₂ und aktiviert Parasympathikus',
    icon: '~',
    hasTimer: true,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Buteyko-Methode trainiert das Atmen durch die Nase und reduziert das Atemvolumen. Die verlängerte Ausatmung und Pause senkt die Atemfrequenz, erhöht die CO₂-Toleranz und aktiviert tiefe Entspannung.',
    timerPattern: {
      defaultDuration: 600,
      phases: [
        { name: 'Einatmen', type: 'in', duration: 3.5, color: 'teal', instruction: 'Ruhig und leise durch die Nase' },
        { name: 'Ausatmen', type: 'out', duration: 6, color: 'indigo', instruction: 'Sanft und vollständig ausatmen' },
        { name: 'Pause', type: 'pause', duration: 7, color: 'purple', instruction: 'Entspannte Atempause halten' },
      ],
    },
    steps: [
      {
        title: 'Nur durch die Nase',
        text: 'Mund schließen. Ausschließlich durch die Nase atmen – ein- und ausatmen. Wenn die Nase verstopft ist, erst einen Buteyko-Nasen-Öffnungsatemzug machen.',
      },
      {
        title: 'Einatmen reduzieren (3–4 Sek)',
        text: 'Atme weniger als du "willst". Die Einatmung soll kleiner und leiser werden. Du solltest nach 2–3 Min leichten Hunger nach Luft spüren – das ist gewollt.',
      },
      {
        title: 'Ausatmen verlängern (6 Sek)',
        text: 'Die Ausatmung ist länger als die Einatmung. Lass alle Luft raus – ohne Pressen, einfach fließen lassen.',
      },
      {
        title: 'Kontrollierte Pause (5–10 Sek)',
        text: 'Nach dem Ausatmen: Nase zuhalten (oder offen lassen) und entspannt warten. Nicht bis zur Grenze – nur angenehme Pause. Dies ist die "kontrollierte Pause" nach Buteyko.',
      },
      {
        title: '10–15 Minuten wiederholen',
        text: 'Halte das Muster konstant. Du wirst nach 5–7 Minuten eine zunehmende Entspannung und Wärme im Körper spüren.',
      },
    ],
    tips: [
      'Die Methode wurde von Dr. Konstantin Buteyko in den 1950ern entwickelt',
      'Besonders effektiv bei Asthma, Angstzuständen und Schlafproblemen',
      'Der Lufthunger ist das Zeichen, dass es wirkt – aber niemals bis zur Atemnot',
      'Täglich 2× 15 Minuten für optimale Wirkung',
    ],
  },

  {
    id: 'deepflow-methode',
    name: 'DeepFlow Methode',
    category: 'meditation',
    duration: '10 Minuten',
    shortDesc: '6-stufige Tiefenmeditation – kombiniert alle Kerntechniken für maximalen Flow-Zustand',
    icon: '◈',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die DeepFlow Methode ist die Kernübung aus dem Buch. Sie kombiniert sechs Techniken zu einer 10-minütigen Sequenz, die dich in einen tiefen Meditationszustand führt – mit abschließendem Atemanhalten für maximale innere Stille.',
    steps: [
      {
        title: 'Stufe 1: Zyklische Vollatmung (2 Min)',
        text: 'Beginne mit 2 Minuten zyklischer Vollatmung. Tief ein (Bauch → Brust → Extra-Atemzug), dann passiv aus. Aktiviere Körper und Geist. Dein Nervensystem läuft hoch.',
      },
      {
        title: 'Stufe 2: Dreiecksatmung (2 Min)',
        text: 'Wechsle zur Dreiecksatmung: Einatmen – Ausatmen – Pause nach Ausatmen. Gleiche Längen. Bringe das aktivierte Nervensystem in Balance. Übergang von Aktivierung zu Kontrolle.',
      },
      {
        title: 'Stufe 3: Positive Emotionen (1 Min)',
        text: 'Rufe eine starke positive Erinnerung auf. Visualisiere die Details – wo warst du, was sahst und spürtest du? Lass das Gefühl in deinem Herzbereich entstehen und stärker werden. Verankere es.',
      },
      {
        title: 'Stufe 4: Kohärenzatmung (3 Min)',
        text: 'Atme im Kohärenz-Rhythmus: 5,5 Sekunden ein, 5,5 Sekunden aus. Halte das positive Gefühl aus Stufe 3 im Herz. Erlebe die Synchronisation von Herz, Atmung und Geist.',
      },
      {
        title: 'Stufe 5: Intention setzen (1 Min)',
        text: 'Im Kohärenz-Zustand: Formuliere deine Intention für diesen Tag oder diese Woche in einem Satz. Atme weiter ruhig. Wiederhole die Intention 3–4 Mal innerlich. Sie verankert sich tief.',
      },
      {
        title: 'Stufe 6: Atemanhalten (1 Min)',
        text: 'Atme tief durch die Nase ein, dann vollständig aus – und halte. So lange es sich angenehm anfühlt, maximal bis zum ersten starken Atemreiz. Tauche in die innere Stille. Dann langsam tief einatmen.',
      },
    ],
    tips: [
      'Diese Sequenz nicht unterbrechen – das Zusammenspiel der Stufen ist entscheidend',
      'Ideal morgens für den optimalen Tagesstart',
      'Du kannst Stufe 6 mehrfach wiederholen für tiefere Stille',
      'Mit Headphones und ruhiger Musik noch wirkungsvoller',
    ],
  },

  {
    id: 'bodyscan',
    name: 'Bodyscan',
    category: 'meditation',
    duration: '10–20 Minuten',
    shortDesc: 'Systematischer Körperscan – Bewusstsein und Entspannung von Kopf bis Fuß',
    icon: '⬡',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Der Bodyscan ist eine klassische Achtsamkeitsmeditation, die Körperbewusstsein und Entspannung verbindet. Du wanderst mit deiner Aufmerksamkeit durch den Körper, nimmst wahr – und lässt los.',
    steps: [
      {
        title: 'Hinlegen und ankommen',
        text: 'Leg dich flach auf den Rücken, Arme leicht vom Körper, Handflächen nach oben. Augen schließen. 5 tiefe Atemzüge. Spüre das Gewicht deines Körpers.',
      },
      {
        title: 'Scheitel und Stirn',
        text: 'Bringe deine Aufmerksamkeit zum Scheitel des Kopfes. Nimm wahr, was du dort spürst – Druck, Kribbeln, Wärme oder nichts. Dann wandere zur Stirn: Kannst du jede Falte loslassen? Stirn glatt werden lassen.',
      },
      {
        title: 'Gesicht – Augen, Kiefer, Hals',
        text: 'Augen: entspannen. Wangen: loslassen. Kiefer: leicht öffnen, Zähne nicht aufeinanderbeißen. Lippen: entspannen. Dann Hals und Nacken – spüre und entspanne aktiv Spannung weg.',
      },
      {
        title: 'Schultern und Arme',
        text: 'Schultern fallen schwer. Lasse jeden Versuch los, sie zu halten. Wandere den rechten Arm entlang: Oberarm, Ellbogen, Unterarm, Handgelenk, alle 5 Finger einzeln. Dann links.',
      },
      {
        title: 'Brust, Bauch, Rücken',
        text: 'Nimm die Bewegung des Atems in der Brust wahr. Dann Bauch: er hebt und senkt sich. Rücken: Wo berührt er den Boden? Wo ist Spannung? Lass sie einfach sein.',
      },
      {
        title: 'Becken und Beine',
        text: 'Hüften und Gesäß: loslassen. Oberschenkel, Knie, Waden, Knöchel – langsam wandern. Fersen auf dem Boden. Zehen: entspanne alle 10 Zehen bewusst.',
      },
      {
        title: 'Gesamtwahrnehmung',
        text: 'Jetzt nimm den Körper als Ganzes wahr. Kein Teil mehr, nur das Gesamtgefühl. Atme ruhig. Bleibe 2–3 Minuten in diesem Gesamtzustand. Dann langsam die Augen öffnen.',
      },
    ],
    tips: [
      'Urteile nicht – nur wahrnehmen und loslassen',
      'Einschlafen ist in Ordnung – zeigt tiefe Entspannung',
      'Auch als Einschlafhilfe am Abend sehr effektiv',
      'Beim Schmerz: Neugierig beobachten, nicht kämpfen',
    ],
  },

  {
    id: 'atemanhalten-grundlagen',
    name: 'Atemanhalten Grundlagen',
    category: 'apnoe',
    duration: '15–20 Minuten',
    shortDesc: 'Atemreiz kennenlernen – erste Schritte zur kontrollierten Apnoe-Fähigkeit',
    icon: '◎',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Der erste und wichtigste Schritt im Apnoe-Training ist das Kennenlernen des Atemreizes. Du lernst, den Reiz zu erkennen, zu akzeptieren und kontrolliert darüber hinauszugehen – ohne Panik, mit Bewusstsein.',
    steps: [
      {
        title: 'Sicherheitsregel',
        text: 'WICHTIG: Diese Übung immer nur an Land oder sitzend/liegend auf dem Boden. Niemals im Wasser alleine. Niemals im Wasser ohne Aufsicht. Atemanhalten im Wasser erfordert einen ausgebildeten Buddy.',
      },
      {
        title: 'Entspannungsatmung (3 Min)',
        text: 'Beginne mit 3 Minuten ruhiger Atmung. Kohärenz-Rhythmus (5,5+5,5 Sek) oder einfach langsam und tief. Ziel: Herzrate senken, Geist beruhigen. Keine hektischen Gedanken.',
      },
      {
        title: 'Letzter Atemzug',
        text: 'Atme tief durch die Nase ein – voll, aber nicht bis zur Schmerzgrenze. Lippen schließen. Nase entspannt halten. Starte deine mentale Uhr.',
      },
      {
        title: 'Die ersten 20 Sekunden',
        text: 'Fokussiere dich auf Entspannung. Kein Kämpfen, keine Anspannung. Lass alle Muskeln locker. Der Atemreiz ist noch nicht aktiv – genieße die Stille.',
      },
      {
        title: 'Den Atemreiz erkennen (Zwerchfellkontraktionen)',
        text: 'Du wirst ein Ziehen oder Zucken im Zwerchfell spüren – das ist das CO₂-Signal. Nicht Panik, nicht Gefahr. Nur Information. Zähle: Wann beginnt der erste Reiz?',
      },
      {
        title: '10 Sekunden über den Reiz hinaus',
        text: 'Bleibe genau 10 Sekunden bewusst nach dem ersten starken Atemreiz. Bleibe entspannt, entspanne Gesicht und Schultern aktiv. Diese 10 Sekunden sind das Training. Dann ausatmen.',
      },
      {
        title: 'Erholung und 3 Runden',
        text: 'Erholung: 2 Minuten normale Atmung. Dann nochmals. Ziel: 3 Runden pro Session. Notiere nach jeder Runde wie lange du gehalten hast und wann der Reiz begann.',
      },
    ],
    tips: [
      'Niemals Hyperventilieren vor dem Atemanhalten – gefährlich!',
      'Der Atemreiz ist KEIN Zeichen von Sauerstoffmangel – es ist CO₂',
      'Entspannung verlängert die Zeit mehr als Willenskraft',
      'Das Apnoe-Trainingsmodul dieser App führt dich strukturiert weiter',
    ],
  },

  {
    id: 'imagination-positiver-emotionen',
    name: 'Imagination positiver Emotionen',
    category: 'meditation',
    duration: '5–10 Minuten',
    shortDesc: 'Positive Erinnerungen aktivieren und im Körper verankern – emotionaler Reset',
    icon: '✦',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Emotionen sind körperliche Zustände. Du kannst sie bewusst erzeugen – unabhängig von äußeren Umständen. Diese Übung trainiert die Fähigkeit, positive innere Zustände auf Abruf zu aktivieren.',
    steps: [
      {
        title: 'Ruhige Atmung',
        text: 'Schließe die Augen. Atme 1–2 Minuten ruhig und tief. Kohärenz-Rhythmus (5,5+5,5 Sek) oder natürlich. Warte, bis du ruhig und präsent bist.',
      },
      {
        title: 'Eine starke Erinnerung wählen',
        text: 'Rufe eine echte Erinnerung auf, in der du dich wirklich gut gefühlt hast. Freude, Liebe, Stolz, Dankbarkeit, Begeisterung. Je konkreter desto besser. Wo warst du?',
      },
      {
        title: 'Die Szene visualisieren',
        text: 'Gehe in die Erinnerung hinein wie in einen Film. Was siehst du um dich herum? Welche Farben, welches Licht? Wer ist dabei? Welche Geräusche hörst du? Mach es so lebhaft wie möglich.',
      },
      {
        title: 'Das Gefühl spüren',
        text: 'Richte die Aufmerksamkeit auf dein Körpergefühl. Wo im Körper spürst du das positive Gefühl? Im Herz? Im Bauch? In der Brust? Lass es sich ausbreiten.',
      },
      {
        title: 'Das Gefühl verstärken',
        text: 'Stelle dir vor, das Gefühl sei ein Licht oder eine Wärme. Lass es in jeder Ausatmung stärker werden. Du hast die Kontrolle – du kannst es heller machen.',
      },
      {
        title: 'Im Körper verankern',
        text: 'Lege eine Hand auf die Stelle im Körper, wo du das Gefühl am stärksten spürst. Atme 5 Mal bewusst dorthin. Sage dir innerlich: "Dieses Gefühl ist verfügbar. Jederzeit." Das ist dein Anker.',
      },
      {
        title: 'Rückkehr',
        text: 'Atme tief ein. Streck dich. Öffne die Augen. Das Gefühl bleibt als Residuum. Du kannst es jederzeit durch den Hand-Anker wieder aktivieren.',
      },
    ],
    tips: [
      'Je regelmäßiger du übst, desto schneller geht der Zustandswechsel',
      'Kombiniere mit der Kohärenzatmung für maximale Tiefe',
      'Nutze denselben Anker-Punkt jedes Mal für stärkere Konditionierung',
      'Auch als Vorbereitung auf Apnoe-Training sehr wirksam',
    ],
  },

  {
    id: 'fokus-briefing',
    name: 'Fokus Briefing',
    category: 'fokus',
    duration: '5 Minuten',
    shortDesc: '5-Min Morgenroutine – klare Intention und ein Schlüsselwort für den Tag setzen',
    icon: '◎',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Das Fokus Briefing ist eine 5-minütige Morgenroutine, die deinen Tag bewusst startet. Du setzt eine klare Intention und wählst ein Schlüsselwort, das dich den ganzen Tag in deinem Zustand hält.',
    steps: [
      {
        title: 'Ruhige Atmung – 1 Min',
        text: 'Setze dich aufrecht hin, bevor du in den Tag startest. 1 Minute Kohärenzatmung oder einfach tiefes, langsames Atmen. Lass die Nacht los.',
      },
      {
        title: 'Rückblick – Was lasse ich hinter mir?',
        text: 'Frage dich: Was war gestern unfertig, belastend oder störend? Schreibe es auf oder benenne es innerlich. Dann: Bewusste Entscheidung, es heute hinter dir zu lassen.',
      },
      {
        title: 'Intention formulieren',
        text: 'Formuliere eine klare Absicht: "Heute möchte ich …" Nicht eine To-do-Liste. Eine Aussage darüber, wer du heute sein möchtest oder was dir wirklich wichtig ist. Ein Satz genügt.',
      },
      {
        title: 'Schlüsselwort wählen',
        text: 'Wähle ein Wort, das deine heutige Intention verkörpert. Beispiele: Ruhe, Fokus, Präsenz, Energie, Verbindung, Kreativität. Dieses Wort ist dein Anker für den Tag.',
      },
      {
        title: 'Schlüsselwort verankern',
        text: 'Spreche das Wort 3 Mal innerlich oder leise aus. Atme dazwischen tief. Spüre was das Wort in dir auslöst. Schreibe es auf dein Handgelenk oder als Notiz aufs Handy.',
      },
      {
        title: 'Abschluss',
        text: 'Ein tiefer Einatemzug. Beim Ausatmen: loslassen. Du bist bereit. Das Briefing ist abgeschlossen.',
      },
    ],
    tips: [
      'Täglich zur selben Zeit durchführen – am besten vor dem ersten Bildschirm',
      'Das Schlüsselwort sichtbar aufschreiben (Notiz, Whiteboard, Handrücken)',
      'Wenn du abschweifst: Schlüsselwort innerlich wiederholen',
      'Kombiniere mit der DeepFlow Methode für eine 15-Min Morgenroutine',
    ],
  },

  {
    id: '4-7-8-atmung',
    name: '4-7-8 Einschlafen',
    category: 'einschlafen',
    duration: '4–8 Runden',
    shortDesc: 'Natürliches Beruhigungsmittel – verlangsamt Herzrate und schaltet Geist ab',
    icon: '◐',
    hasTimer: true,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die 4-7-8 Atmung (nach Dr. Andrew Weil) ist eine der wirksamsten Techniken zum Einschlafen. Die lange Ausatmung und das ausgedehnte Halten beruhigen das Nervensystem in Minuten.',
    timerPattern: {
      defaultDuration: 240,
      phases: [
        { name: 'Einatmen', type: 'in', duration: 4, color: 'blue', instruction: 'Ruhig durch die Nase' },
        { name: 'Halten', type: 'hold', duration: 7, color: 'indigo', instruction: 'Atem oben sanft halten' },
        { name: 'Ausatmen', type: 'out', duration: 8, color: 'purple', instruction: 'Vollständig durch den Mund ausatmen' },
      ],
    },
    steps: [
      {
        title: 'Im Bett liegen',
        text: 'Leg dich auf den Rücken. Zunge hinter den oberen Schneidezähnen am Gaumen. Augen schließen. 1–2 normale Atemzüge.',
      },
      {
        title: '4 Sek einatmen',
        text: 'Ruhig durch die Nase einatmen. 4 Sekunden. Keine Eile – gleichmäßig und tief.',
      },
      {
        title: '7 Sek halten',
        text: 'Atem oben halten. 7 Sekunden. Entspannt – keine Anspannung. Die Zunge bleibt am Gaumen.',
      },
      {
        title: '8 Sek ausatmen',
        text: 'Durch leicht geöffnete Lippen ausatmen. 8 Sekunden. Zischen oder sanftes "Ffff". Lunge vollständig leeren.',
      },
      {
        title: '4–8 Runden',
        text: 'Wiederhole 4–8 Mal. Viele Menschen schlafen bereits nach 4 Runden ein. Wenn nicht: weitermachen oder zum Bodyscan wechseln.',
      },
    ],
    tips: [
      'Die Ratio 4:7:8 ist entscheidend – nicht die absoluten Zeiten',
      'Auch mit doppelten Zeiten (8:14:16) möglich',
      'Falls Schwindel: Tempo reduzieren, kleiner atmen',
      'Täglich einsetzen – Wirkung verstärkt sich mit Übung',
    ],
  },

  {
    id: 'brustkorbdehnung',
    name: 'Brustkorbdehnung',
    category: 'apnoe',
    duration: '10–15 Minuten',
    shortDesc: 'Drei Dehnungsübungen für mehr Lungenvolumen – Uddiyana Bandha und Seitdehnungen',
    icon: '❋',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Ein flexibler Brustkorb ist die Voraussetzung für große Lungenvolumina. Diese drei Übungen dehnen Zwerchfell, Rippenmuskeln und Brustwirbelsäule systematisch – und erhöhen direkt das nutzbare Atemvolumen.',
    steps: [
      {
        title: 'Uddiyana Bandha – Stufe 1: Grundposition',
        text: 'Stehe aufrecht, Füße schulterbreit. Atme vollständig aus – bis die Lungen leer sind. Beuge dich leicht nach vorne, Hände auf die Oberschenkel. Erschaffe nun ein falsches Einatmen: Ziehe den Bauch nach innen und oben, als würdest du einatmen – ohne Luft hereinzulassen. Du wirst eine tiefe Hohlkehle spüren.',
      },
      {
        title: 'Uddiyana Bandha – Stufe 2: Halten und Intensivieren',
        text: 'Halte den Bandha 5–10 Sekunden. Dann tief einatmen und normal weiterpusten. Drei Runden. Steigere das Halten schrittweise auf 15–20 Sekunden. Uddiyana Bandha massiert Zwerchfell und Bauchorgane und dehnt den unteren Rippenbogen.',
      },
      {
        title: 'Uddiyana Bandha – Stufe 3: Im Stehen',
        text: 'Führe die Übung jetzt aufrecht durch ohne Abstützen. Arme locker an den Seiten. Dies erfordert mehr Körperkontrolle. 3–5 Runden à 10–15 Sekunden Halten.',
      },
      {
        title: 'Seitliche Brustkorbdehnung – Stufe 1: Einseitig',
        text: 'Stehe aufrecht. Hebe den rechten Arm über den Kopf, beugle dich kontrolliert nach links. Atme tief in die rechte Seite des Brustkorbs – du spürst die Dehnung zwischen den Rippen. 5 tiefe Atemzüge halten, dann Seite wechseln.',
      },
      {
        title: 'Seitliche Brustkorbdehnung – Stufe 2: Mit Ausatmungsarm',
        text: 'Beim Ausatmen lass den gehobenen Arm aktiv tiefer sinken und verstärke die Seitwärtsbeugung. Die Dehnung intensiviert sich in der Ausatmung. 5 Atemzüge pro Seite, 2–3 Durchgänge.',
      },
      {
        title: 'Seitliche Brustkorbdehnung – Stufe 3: Beide Arme oben',
        text: 'Falte die Hände über dem Kopf, beuge nach rechts und dann nach links. Bewusstes Einatmen in die jeweilige Dehnung. 10 Wiederholungen pro Seite mit vollem Atemzug.',
      },
      {
        title: 'Vordere Brustkorbdehnung – Stufe 1: Brustöffner',
        text: 'Stehe oder sitze aufrecht. Verschränke die Hände hinter dem Rücken. Drücke die Schultern nach hinten und unten, hebe den Brustkorb nach vorne und oben. Atme tief in die Brust ein. 5–8 tiefe Atemzüge.',
      },
      {
        title: 'Vordere Brustkorbdehnung – Stufe 2: Intensivierung',
        text: 'Zusätzlich zum Brustöffner: Kopf leicht nach hinten neigen, Kinn zur Decke. Die Vorderseite des Halses und das Sternum öffnen sich weiter. Atemzüge in den oberen Brustbereich lenken. 5 Atemzüge.',
      },
      {
        title: 'Hintere Brustkorbdehnung – Stufe 3: Rundrücken',
        text: 'Setze dich, falte die Hände vor dem Bauch, runde den Rücken maximal. Kinn zur Brust. Atme jetzt in den Rücken – spüre, wie sich die hinteren Rippenbögen öffnen. 5–8 tiefe Atemzüge in den Rücken. Dies ist die häufig vernachlässigte Dimension.',
      },
    ],
    tips: [
      'Uddiyana Bandha niemals nach dem Essen – mindestens 3–4 Std. Abstand',
      'Bei Schwindel beim Uddiyana: Pause, normal atmen',
      'Regelmäßiges Dehnen erhöht das Lungenvolumen messbar über Monate',
      'Kombiniere mit der Zyklischen Vollatmung direkt danach',
    ],
  },

  {
    id: 'fuenf-finger-technik',
    name: '5-Finger-Technik',
    category: 'entspannung',
    duration: '1–2 Minuten',
    shortDesc: '5 Sinne als Anker – sofortige Erdung im Jetzt durch bewusste Sinneswahrnehmung',
    icon: '✋',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die 5-Finger-Technik nutzt die fünf Sinne als Anker in die Gegenwart. Bei Stress oder Überflutung durch Gedanken holt sie dich sofort ins Jetzt zurück – wirkungsvoll, unauffällig, jederzeit einsetzbar.',
    steps: [
      {
        title: 'Vorbereitung',
        text: 'Halte eine Hand offen vor dir oder lege sie auf den Oberschenkel. Atme einmal tief aus. Gehe jetzt Finger für Finger durch, ohne zu eilen.',
      },
      {
        title: 'Daumen – SEHEN',
        text: 'Berühre den Daumen und frage: Was sehe ich gerade wirklich? Benenne 3 Dinge, die du jetzt konkret siehst – Farben, Formen, Bewegungen. Nicht interpretieren, nur benennen. "Ich sehe die weiße Wand. Den Schatten des Fensters. Die Körnung des Tisches."',
      },
      {
        title: 'Zeigefinger – HÖREN',
        text: 'Berühre den Zeigefinger. Was hörst du gerade? Lausche bewusst: Geräusche nah und fern, laut und leise. Benenne 3 Geräusche konkret. Auch Stille ist ein Klang.',
      },
      {
        title: 'Mittelfinger – FÜHLEN',
        text: 'Berühre den Mittelfinger. Was spürst du körperlich? Die Kleidung auf der Haut, den Druck des Stuhls, die Temperatur der Luft. Nicht Emotionen – körperliche Empfindungen. Benenne 3.',
      },
      {
        title: 'Ringfinger – RIECHEN',
        text: 'Berühre den Ringfinger. Welche Gerüche nimmst du wahr? Auch wenn es schwach ist – nimm dir Zeit. Raumluft, eigene Haut, Kaffee, Holz. Benenne was da ist, auch wenn es "nichts Besonderes" ist.',
      },
      {
        title: 'Kleiner Finger – SCHMECKEN',
        text: 'Berühre den kleinen Finger. Was schmeckst du? Den letzten Schluck Kaffee, Zahnpasta, nichts, neutrales Mundgefühl. Lasse die Aufmerksamkeit kurz auf der Zunge ruhen.',
      },
      {
        title: 'Abschluss – Atemzug',
        text: 'Alle fünf Finger wurden besucht. Lege jetzt beide Hände auf die Knie. Ein langer, tiefer Atemzug. Beim Ausatmen: spüre, wie du geerdet und präsent bist. Der Gedankensturm ist leiser.',
      },
    ],
    tips: [
      'Funktioniert auch in Meetings – diskret mit einer Hand unter dem Tisch',
      'Bei Panikattacken: sofort starten, nicht warten bis es schlimmer wird',
      'Kombination mit 4-7-8 Atmung danach verstärkt die Wirkung',
      'Kinder können die Technik ab ca. 6 Jahren lernen',
    ],
  },

  {
    id: 'gedankenstopp',
    name: 'Gedankenstopp',
    category: 'fokus',
    duration: '2–5 Minuten',
    shortDesc: 'Gedankenspirale unterbrechen – 6 Schritte von der Eskalation zum klaren Fokus',
    icon: '⊘',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Gedankenspiralen entstehen, wenn ein negativer Gedanke den nächsten auslöst – bis Körper und Geist im Alarmzustand sind. Der Gedankenstopp unterbricht diesen Kreislauf mit einem gezielten mentalen Eingriff.',
    steps: [
      {
        title: 'Schritt 1: Eskalation erkennen',
        text: 'Beobachte, wann Gedanken eskalieren. Typische Zeichen: du grübelst im Kreis, denkst in Katastrophenszenarien ("Was wäre wenn…"), spürst zunehmende körperliche Anspannung, Herzrasen oder Enge in der Brust. Das Erkennen ist der erste und wichtigste Schritt.',
      },
      {
        title: 'Schritt 2: STOPP-Signal setzen',
        text: 'Sobald du die Eskalation erkennst: Sage innerlich oder laut das Wort "STOPP". Klar. Direkt. Nicht als Frage, als Aussage. Du kannst gleichzeitig eine Hand flach auf die Brust legen oder auf den Tisch schlagen – der körperliche Anker verstärkt das Signal.',
      },
      {
        title: 'Schritt 3: Einen Schritt zurücktreten',
        text: 'Stelle dir bildlich vor, du trittst einen Schritt zurück aus der Situation. Du bist jetzt Beobachter deiner Gedanken, nicht Teil des Strudels. Die Gedanken sind wie Wolken, die du von einem Berg aus siehst – du bist nicht die Wolke.',
      },
      {
        title: 'Schritt 4: Tief atmen',
        text: 'Jetzt: Ein langer, tiefer Atemzug durch die Nase. Halte kurz an. Langsam durch den Mund ausatmen – doppelt so lang wie das Einatmen. Wiederhole 3 Mal. Das Nervensystem wechselt den Gang.',
      },
      {
        title: 'Schritt 5: Fokus neu setzen',
        text: 'Frage dich nach dem Ausatmen: "Was ist jetzt – in diesem Moment – wirklich wahr?" Nicht was könnte sein, nicht was gestern war. Was ist jetzt konkret, faktisch, real? Benenne es in einem Satz.',
      },
      {
        title: 'Schritt 6: Weiter oder wiederholen',
        text: 'Wenn der Gedankenfluss wieder klar ist: weiter machen. Wenn der Sog zurückkommt: sofort wieder ab Schritt 2. Je häufiger du übst, desto kleiner wird das Zeitfenster, in dem die Spirale dich hat.',
      },
    ],
    tips: [
      'Übe zuerst bei kleinen Ärgernissen – nicht bei der größten Krise',
      'Das körperliche STOPP-Signal (Hand, Armband tippen) verstärkt die Unterbrechung',
      'Kombiniere mit dem Fokus Briefing morgens, um den Tag robuster zu starten',
      'Perfekt als Vorbereitung vor Apnoe-Training – kein mentales Rauschen',
    ],
  },

  {
    id: 'atemmuskeltraining',
    name: 'Atemmuskeltraining',
    category: 'apnoe',
    duration: '5–8 Minuten pro Stufe',
    shortDesc: 'Zwerchfell und Atemhilfsmuskel stärken – mit Relaxator oder Strohhalm',
    icon: '◈',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Atemmuskeltraining erhöht die Kraft und Ausdauer des Zwerchfells und der Atemhilfsmuskulatur. Dies verlängert die Apnoe-Zeit und verbessert die Effizienz aller Atemübungen. Ein Relaxator oder dicker Strohhalm erhöht den Atemwiderstand.',
    steps: [
      {
        title: 'Material',
        text: 'Besorge einen Relaxator (spezieller Atemtrainer) oder nutze einen dickeren Trinkhalm (ca. 5–8mm Durchmesser). Das Ziel ist erhöhter Widerstand beim Ein- und/oder Ausatmen.',
      },
      {
        title: 'Stufe 1: Grundspannung aufbauen (5 Min)',
        text: 'Setze den Strohhalm oder Relaxator ein. Atme ruhig und gleichmäßig ein und aus – durch das Hilfsmittel. Das Einatmen erfordert mehr Kraft als gewohnt. Spüre, wie das Zwerchfell arbeitet. Halte Tempo niedrig, Atemzüge vollständig. 5 Minuten im normalen Alltagsrhythmus atmen.',
      },
      {
        title: 'Stufe 1: Wahrnehmung',
        text: 'Nach 2–3 Minuten wirst du eine leichte Ermüdung der Atemmuskeln spüren – das ist das Zeichen, dass es wirkt. Bleibe entspannt, kein Verkrampfen. Schultern nicht hochziehen.',
      },
      {
        title: 'Stufe 2: Atemkontrolle intensivieren (5–8 Min)',
        text: 'Nutze jetzt bewusste Atemrhythmen: 4 Sek einatmen (durch Strohhalm), 6 Sek ausatmen (durch Strohhalm). Der Widerstand in beiden Phasen trainiert sowohl Einatmungs- als auch Ausatmungsmuskel. 5–8 Minuten halten.',
      },
      {
        title: 'Stufe 2: Progression',
        text: 'Wenn der Rhythmus leicht fällt: Verlängere auf 5+8 Sek oder 6+10 Sek. Ziel ist, dass die Muskeln am Ende der Einheit leicht ermüdet, aber nicht erschöpft sind.',
      },
      {
        title: 'Stufe 3: Belastung steigern (5–8 Min)',
        text: 'Führe jetzt Zyklische Vollatmung durch den Strohhalm durch: Tief einatmen (Bauch → Brust), kleiner Extra-Schluck, passiv ausatmen. Der erhöhte Widerstand bei vollem Atem fordert die Atemmuskulatur maximal. 3–5 Minuten.',
      },
      {
        title: 'Stufe 3: Abschluss',
        text: 'Lege den Strohhalm weg. Atme 1–2 Minuten normal ohne Hilfsmittel. Du wirst spüren, wie die Atmung jetzt leichter und tiefer wirkt – der Kontrasteffekt. Notiere deine Trainingszeit.',
      },
    ],
    tips: [
      'Relaxatoren bei Apnoe-Ausrüstern oder online erhältlich (ca. 10–15 €)',
      'Alternativ: Tauchschnorchel mit gedrosseltem Einlass',
      'Täglich 10 Min reichen für messbare Verbesserung nach 4–6 Wochen',
      'Nie unmittelbar vor Apnoe-Training – Atemmuskel sollten ausgeruht sein',
    ],
  },

  {
    id: 'farbraummeditation',
    name: 'Farbraummeditation',
    category: 'meditation',
    duration: '15–20 Minuten',
    shortDesc: 'Geführte Reise durch 4 Farbräume – mit einem geliebten Menschen verbinden',
    icon: '◌',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Farbraummeditation ist eine tiefe Visualisierungsübung aus dem DeepFlow-System. Du reist gemeinsam mit einem geliebten Menschen durch vier Farbräume, die jeweils eine innere Qualität verkörpern. Diese Meditation ist ideal mit einer eigenen Audiodatei als Begleitung.',
    steps: [
      {
        title: 'Vorbereitung & Audiodatei',
        text: 'Diese Meditation ist für die Begleitung durch eine Audiodatei konzipiert. Lade deine Audiodatei im Player unten hoch und starte sie, wenn du die Augen schließt. Ohne Audio: Lies jeden Schritt vor dem Schließen der Augen und verweile je 3–4 Minuten.',
      },
      {
        title: 'Ankunft & Begleitung wählen',
        text: 'Lege oder setze dich bequem. Schließe die Augen. Atme 5 Mal tief ein und aus. Denke an eine Person, die du liebst oder der du vertraust – sie wird dich durch die Farbräume begleiten. Stelle dir vor, diese Person steht ruhig neben dir.',
      },
      {
        title: 'Blauer Raum – Vertrauen',
        text: 'Stell dir einen weiten, ruhigen blauen Raum vor. Alles ist in sanftes Blau getaucht – Wände, Boden, Licht. Blau ist die Farbe des Vertrauens, des Himmels und des tiefen Wassers. Gehe mit deiner Begleitperson in diesen Raum. Was fühlst du hier? Welches Vertrauen kannst du loslassen, das du noch festgehalten hast?',
      },
      {
        title: 'Zweiter Farbraum – [folgt in Audiodatei]',
        text: 'Die weiteren drei Farbräume und ihre spezifischen Qualitäten sind in der begleitenden Audiodatei enthalten. Verweile in jedem Raum so lange, wie sich richtig anfühlt. Lass die Farben in dich einsinken – nimm die Gefühle und Bilder wahr, ohne sie zu bewerten.',
      },
      {
        title: 'Begleitung verabschieden',
        text: 'Am Ende der Reise: Verabschiede dich von deiner Begleitperson mit einem inneren Dankgefühl. Was hat die gemeinsame Reise gezeigt? Was nimmst du mit?',
      },
      {
        title: 'Rückkehr',
        text: 'Atme tief durch die Nase ein. Spüre den Körper, die Unterlage, den Raum. Bewege langsam Finger und Zehen. Öffne die Augen. Nimm dir 2–3 Minuten, bevor du aufstehst.',
      },
    ],
    tips: [
      'Audiodatei im Player unten laden für die vollständige geführte Version',
      'Ideal am Abend oder nach intensivem Training',
      'Die Begleitperson kann auch eine verstorbene, imaginäre oder symbolische Figur sein',
      'Tagebuch danach: Was hast du in den Räumen erlebt?',
    ],
  },

  {
    id: 'hand-auf-herz',
    name: 'Hand-auf-Herz-Technik',
    category: 'entspannung',
    duration: '1–3 Minuten',
    shortDesc: 'Selbstmitgefühl aktivieren – Wärme und Beruhigung durch Herzberührung',
    icon: '♡',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Hand auf dem Herzen aktiviert das Selbstfürsorge-System im Gehirn. Schon die physische Berührung über dem Herzen senkt Cortisol und aktiviert Oxytocin – auch wenn du dich selbst berührst. Einfach, überall anwendbar, sofort wirksam.',
    steps: [
      {
        title: 'Hand auf Herz legen',
        text: 'Lege eine Hand flach auf deine Brust – über das Herz. Spüre den Kontakt: die Wärme der Hand, die Bewegung des Brustkorbs, den Herzschlag, wenn er spürbar ist. Keine spezielle Haltung nötig.',
      },
      {
        title: 'Wärme spüren und einatmen',
        text: 'Atme langsam und tief ein. Stelle dir vor, die Wärme deiner Hand fließt beim Einatmen in den Herzbereich – wie warmes Licht, das sich ausbreitet. Keine Anstrengung – nur wahrnehmen und empfangen.',
      },
      {
        title: 'Langsam ausatmen',
        text: 'Atme noch langsamer aus, als du eingeatmet hast. Beim Ausatmen: lass alles los, was du trägst. Die Hand bleibt auf dem Herzen. Spüre, wie sich Schultern und Kiefer entspannen.',
      },
      {
        title: 'Freundlicher innerer Satz (optional)',
        text: 'Wenn es sich richtig anfühlt: Sage dir innerlich einen freundlichen Satz. Zum Beispiel: "Es ist okay, so zu sein, wie ich bin." Oder: "Ich bin auf meiner Seite." Keine Bewertung, ob es "funktioniert" – nur sein lassen.',
      },
      {
        title: '1 Minute – oder so lange wie nötig',
        text: 'Bleibe mindestens 1 Minute so. Viele Menschen spüren nach 60 Sekunden eine spürbare Verschiebung – von Anspannung zu einer weicheren Offenheit. Wenn du mehr Zeit hast: bleib länger.',
      },
    ],
    tips: [
      'Kann unauffällig unter dem Tisch oder in der Tasche in der Westentasche durchgeführt werden',
      'Besonders wirksam bei Selbstkritik und inneren Vorwürfen',
      'Aus der Selbstmitgefühlsforschung von Dr. Kristin Neff belegt',
      'Variante: Beide Hände übereinander legen für intensivere Wirkung',
    ],
  },

  {
    id: 'reflexion-perspektivwechsel',
    name: 'Reflexion & Perspektivwechsel',
    category: 'fokus',
    duration: '5–10 Minuten',
    shortDesc: 'Stressige Situation analysieren und durch neuen Blickwinkel auflösen',
    icon: '⟳',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Viele Stresssituationen entstehen nicht durch das Ereignis selbst, sondern durch die Interpretation, die wir ihm geben. Diese Übung macht den Interpretationsprozess bewusst und öffnet Raum für neue, hilfreiche Sichtweisen.',
    steps: [
      {
        title: 'Schritt 1: Stressige Situation analysieren',
        text: 'Wähle eine konkrete Situation, die dich belastet oder in der du feststeckst. Beschreibe sie in 2–3 Sätzen so neutral und sachlich wie möglich – als wärst du Journalist, der berichtet. Nur Fakten, keine Bewertungen.',
      },
      {
        title: 'Schritt 2: Gedanken und Emotionen benennen',
        text: 'Was denkst du über diese Situation? Welche automatischen Gedanken kommen? ("Das ist unfair", "Ich schaffe das nie", "Die anderen denken schlecht über mich".) Schreibe oder denke jeden Gedanken explizit. Dann: Welche Emotion verbindest du damit? Wut, Angst, Enttäuschung, Scham?',
      },
      {
        title: 'Schritt 3: Alternative Sichtweise entwickeln',
        text: 'Jetzt der entscheidende Schritt: Frage dich – wie würde jemand, der dich liebt und klug ist, diese Situation sehen? Oder: Wie wirst du in 5 Jahren darauf zurückblicken? Oder: Was könnte diese Situation mir beibringen? Nimm dir Zeit. Zwinge nichts.',
      },
      {
        title: 'Schritt 4: Neuen Gedanken formulieren',
        text: 'Formuliere einen neuen, realistisch-positiven Gedanken über die Situation. Nicht falscher Optimismus, sondern eine breitere Wahrheit. Beispiel: Statt "Ich habe versagt" → "Ich habe etwas gelernt, das ich vorher nicht wusste."',
      },
      {
        title: 'Schritt 5: Effekt spüren und verankern',
        text: 'Sage den neuen Gedanken 3 Mal innerlich. Wie verändert sich dein Körpergefühl? Spüre die Wirkung physisch. Atme tief ein und aus. Der neue Gedanke ist nicht Selbstbetrug – er ist eine weitere Wahrheit, die du zuvor nicht gesehen hast.',
      },
    ],
    tips: [
      'Schreiben verstärkt die Wirkung erheblich – Stift und Papier nutzen',
      'Nicht bei akuter emotionaler Flut – erst Emotionen beruhigen (Hand-auf-Herz), dann reflektieren',
      'Kombiniere mit dem Fokus Briefing am Morgen',
      'Je öfter geübt, desto schneller entsteht der Perspektivwechsel spontan im Alltag',
    ],
  },

  {
    id: 'zwerchfellatmung-training',
    name: 'Zwerchfellatmung Training',
    category: 'apnoe',
    duration: '5–10 Minuten',
    shortDesc: 'Zwerchfell isolieren und stärken – Bauch hebt sich, Brust bleibt ruhig',
    icon: '⊙',
    hasTimer: false,
    source: 'Tom Sietas – Deine Atmung ändert alles',
    intro: 'Die Zwerchfellatmung ist die effizienteste und gesündeste Atemform – und gleichzeitig für viele Menschen ungewohnt. Dieses Training isoliert das Zwerchfell, sodass du bewusst lernst, tief und effizient zu atmen.',
    steps: [
      {
        title: 'Ausgangslage',
        text: 'Lege dich auf den Rücken, Knie leicht angewinkelt. Entspanne alle Muskeln. Lege eine Hand flach auf den Bauch (Nabelbereich) und die andere auf die Brust. Diese beiden Hände sind dein Feedback-System.',
      },
      {
        title: 'Wahrnehmung der aktuellen Atmung',
        text: 'Atme zunächst ganz normal. Welche Hand hebt sich mehr – Bauch oder Brust? Die meisten Erwachsenen atmen überwiegend in die Brust (Stressatemmuster). Das ist der Ausgangspunkt.',
      },
      {
        title: 'Zwerchfell aktivieren',
        text: 'Atme jetzt bewusst so ein, dass sich NUR die Bauchhand hebt. Die Brust bleibt ruhig – die Brusthand bewegt sich kaum. Stelle dir vor, du füllst zuerst den Bauch wie einen Ballon, bevor die Brust folgt.',
      },
      {
        title: 'Korrekte Einatmung üben',
        text: 'Einatmen (4 Sek): Bauch hebt sich nach oben und außen. Brust bleibt still. Falls die Brust sich hebt: Bauchhand leicht drücken als Gegenwiderstand. Ausatmen (6 Sek): Bauch senkt sich passiv. Keine Muskeln pressen.',
      },
      {
        title: 'Intensivierung: Aktives Bauchsenken',
        text: 'In der Ausatmung: Ziehe den Bauch aktiv nach innen und oben (sanftes Uddiyana). Dies kräftigt das Zwerchfell in beiden Bewegungsrichtungen. 10 Atemzüge mit bewusstem Bauchziehen beim Ausatmen.',
      },
      {
        title: 'Im Sitzen und Stehen',
        text: 'Sobald du die Bewegung im Liegen sicher hast: übe im Sitzen, dann im Stehen. Im Alltag ist das Sitzen die häufigste Position. Das Ziel: Zwerchfellatmung als Standard-Atemmuster – automatisch, ohne Nachdenken.',
      },
      {
        title: 'Integration in den Alltag',
        text: 'Setze dir einen Handywecker für dreimal täglich: In diesen Momenten 10 bewusste Zwerchfellatemzüge. Nach 3–4 Wochen wird die Zwerchfellatmung zur neuen Normalität.',
      },
    ],
    tips: [
      'Täglich 5 Minuten reichen – Konstanz schlägt Intensität',
      'Überprüfe im Liegen wöchentlich deinen Fortschritt',
      'Kombination mit Atemmuskeltraining für maximale Apnoe-Vorbereitung',
      'Bei anhaltender Brustatmung trotz Training: Atemphysiotherapeuten konsultieren',
    ],
  },
]
