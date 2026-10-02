window.quizCourses = [
  {
    id: 'hico-foundations',
    title: 'Kom i gang med HICO',
    subtitle: 'Grunnlaget · Kurs 1',
    summary: 'Før du velger felt og menyer, forstå hva modellen beskriver. Dette kurset introduserer HICO, masterdata og hvordan S-Series-spesifikasjonene passer sammen.',
    start: 0,
    end: 10,
    foundation: [0, 2, 3, 7],
    concepts: [
      { term: 'HICO', definition: 'Et arbeidsverktøy for å strukturere og vedlikeholde informasjon som brukes i produktstøtte og logistikk.' },
      { term: 'Masterdata', definition: 'Gjenbrukbar informasjon om produkter og støttebehov. Start med den virkelige strukturen og informasjonen, ikke skjermbildene.' },
      { term: 'S-Series', definition: 'Et økosystem av standarder for ulike fagområder som kan dele og bygge videre på strukturerte data.' }
    ],
    matching: [
      { left: 'S3000L', right: 'Logistics and support analysis' },
      { left: 'S4000P', right: 'Predictive and preventive maintenance analysis' },
      { left: 'S5000F', right: 'Feedback' }
    ]
  },
  {
    id: 'psa-and-objects',
    title: 'PSA og dataobjektene',
    subtitle: 'Analyse og kilder · Kurs 2',
    summary: 'Se hvordan produktstøtteanalyse henger sammen med kilder, masterdata og HICO-objekter. Lær hvorfor PSA kan starte før alle produktnumre er klare.',
    start: 10,
    end: 20,
    foundation: [0, 5, 6, 7],
    concepts: [
      { term: 'PSA', definition: 'Product Support Analysis: analysearbeid som bygger grunnlaget for produktstøtte gjennom livsløpet.' },
      { term: 'Kildeinformasjon', definition: 'Leverandørdatablader og andre kilder kan registreres og brukes som grunnlag for analyse.' },
      { term: 'Dataobjekt', definition: 'Et HICO-objekt har en egen rolle. Et dokument i en publikasjon er ikke det samme som et masterdataobjekt.' }
    ]
  },
  {
    id: 'article-masterdata',
    title: 'Article og masterdata',
    subtitle: 'Gjenbruk og kontroll · Kurs 3',
    summary: 'Article er et sentralt gjenbruksobjekt. Her ser du hvordan artikler, artikkellister og materialprosjekter skiller seg fra hverandre.',
    start: 20,
    end: 30,
    foundation: [0, 2, 4, 6],
    concepts: [
      { term: 'Article', definition: 'Et masterdataobjekt for en identifiserbar del eller enhet som kan gjenbrukes på tvers av strukturer.' },
      { term: 'Article List', definition: 'En liste som samler artikler for en bestemt bruk; den er ikke selve artikkelen.' },
      { term: 'Revisjon', definition: 'Endringer må kunne spores. En ny revisjon bevarer historikken i stedet for å skjule den.' }
    ],
    matching: [
      { left: 'Article', right: 'Et gjenbrukbart masterdataobjekt' },
      { left: 'Article List', right: 'En samling av artikler for en bestemt bruk' },
      { left: 'Material Project', right: 'Prosjektområde for materialdata' }
    ]
  },
  {
    id: 'device-types',
    title: 'Device Type og Device Type Set',
    subtitle: 'Modellering av produkter · Kurs 4',
    summary: 'Device Types hjelper deg å modellere produktvarianter og struktur før alle artikler finnes. Device Type Sets samler typene som hører sammen.',
    start: 30,
    end: 40,
    foundation: [0, 1, 2, 3],
    concepts: [
      { term: 'Device Type', definition: 'En modellert type komponent eller enhet som kan representere produktet før alle konkrete Articles er tilgjengelige.' },
      { term: 'Device Type Set', definition: 'Et sett som organiserer Device Types for en bestemt modell eller bruk.' },
      { term: 'Breakdown Element', definition: 'Et element i produktnedbrytningen. Det beskriver strukturplassering, ikke bare en generell type.' }
    ],
    matching: [
      { left: 'Device Type', right: 'Modell av en type komponent eller enhet' },
      { left: 'Device Type Set', right: 'Samling av Device Types' },
      { left: 'Breakdown Element', right: 'Element i produktstrukturen' }
    ]
  },
  {
    id: 'pbs-and-lcn',
    title: 'PBS, SNS og LCN',
    subtitle: 'Produktstruktur og koder · Kurs 5',
    summary: 'Bygg en forståelig produktstruktur, og planlegg kodereglene før modellen vokser. Skill produktstruktur fra systematikk for teknisk innhold.',
    start: 40,
    end: 50,
    foundation: [1, 3, 5, 6],
    concepts: [
      { term: 'PBS', definition: 'Product Breakdown Structure: produktet organisert etter hvordan systemer og komponenter henger sammen.' },
      { term: 'SNS', definition: 'Standard Numbering System: systematisk inndeling av tekniske fagområder.' },
      { term: 'LCN', definition: 'Logical Control Number: en strukturkode der nivåer og lengder må planlegges for forventet størrelse.' }
    ],
    matching: [
      { left: 'PBS', right: 'Produktets strukturelle oppbygning' },
      { left: 'SNS', right: 'Systematisk inndeling av teknisk innhold' },
      { left: 'LCN', right: 'Logisk nummerering av nivåer i strukturen' }
    ]
  },
  {
    id: 'programs-and-concepts',
    title: 'Program, prosjekt og konsept',
    subtitle: 'Planlegging av støtte · Kurs 6',
    summary: 'Forstå forholdet mellom IPS Program, PSA Project og Material Project. Deretter ser du hvordan bibliotek, vedlikeholdsnivåer og ansvarsdeling henger sammen.',
    start: 50,
    end: 60,
    foundation: [1, 2, 3, 4],
    concepts: [
      { term: 'IPS Program', definition: 'Overordnet ramme som kan samle flere PSA Projects og felles støtteinformasjon.' },
      { term: 'PSA Project', definition: 'Prosjektområde for analyse av produktstøtte innenfor et IPS Program.' },
      { term: 'Maintenance Concept', definition: 'Beskriver hvordan og på hvilke nivåer vedlikehold er tenkt utført.' }
    ]
  },
  {
    id: 'maintenance-tasks-one',
    title: 'Maintenance Task: grunnlag',
    subtitle: 'Vedlikeholdsoppgaver · Kurs 7',
    summary: 'En Maintenance Task beskriver mer enn et komponentbytte. Lær forskjellen på oppgavetyper, og hvordan analyse og begrunnelse støtter forebyggende vedlikehold.',
    start: 60,
    end: 70,
    foundation: [1, 2, 6, 7],
    concepts: [
      { term: 'Maintenance Task', definition: 'En strukturert beskrivelse av vedlikeholdsarbeid, med relevante trinn, betingelser og støtteinformasjon.' },
      { term: 'Preventive task', definition: 'En oppgave som utføres planlagt for å redusere risiko for feil eller slitasje.' },
      { term: 'PMTR', definition: 'Preventive Maintenance Task Requirements: grunnlag for å analysere og begrunne forebyggende oppgaver.' }
    ],
    matching: [
      { left: 'Corrective task', right: 'Retter en feil eller gjenoppretter funksjon' },
      { left: 'Supporting task', right: 'Støtter en annen vedlikeholdsoppgave' },
      { left: 'Preventive task', right: 'Utføres planlagt for å forebygge feil' }
    ]
  },
  {
    id: 'maintenance-tasks-two',
    title: 'Maintenance Task: bruk og kobling',
    subtitle: 'Struktur og gjenbruk · Kurs 8',
    summary: 'Gjør oppgaver gjenbrukbare og knytt dem til riktig nivå i produktstrukturen. Se hvordan replaceable units, maintenance conditions og subtask-forhold påvirker modellen.',
    start: 70,
    end: 80,
    foundation: [0, 2, 3, 8],
    concepts: [
      { term: 'Replaceable unit', definition: 'En enhet som vedlikeholdskonseptet legger opp til å skifte som en samlet del.' },
      { term: 'Main Subtask', definition: 'Et hoved-/underoppgaveforhold som organiserer arbeid som hører sammen.' },
      { term: 'Gjenbruk', definition: 'En task kan kobles til et passende høyere strukturelement når det er faglig riktig.' }
    ]
  },
  {
    id: 'info-codes-patterns',
    title: 'Info Code og Logistic Pattern',
    subtitle: 'Teknisk innhold · Kurs 9',
    summary: 'Lær hvordan SNS og Info Code bidrar til å klassifisere teknisk innhold, og hvordan Logistic Pattern samler et gjenbrukbart ordforråd for analyse og publikasjon.',
    start: 80,
    end: 90,
    foundation: [1, 2, 4, 6],
    concepts: [
      { term: 'SNS', definition: 'Angir hvilken teknisk del eller hvilket fagområde innholdet gjelder.' },
      { term: 'Info Code', definition: 'Angir hvilken type informasjon en teknisk modul inneholder, for eksempel en bestemt presentasjon eller aktivitet.' },
      { term: 'Logistic Pattern', definition: 'Et gjenbrukbart mønster eller ordforråd for å beskrive logistikk- og støtteinformasjon.' }
    ],
    matching: [
      { left: 'SNS', right: 'Hvilket fagområde eller hvilken del innholdet gjelder' },
      { left: 'Info Code', right: 'Hvilken type informasjon modulen inneholder' },
      { left: 'Logistic Pattern', right: 'Gjenbrukbart ordforråd for logistikkdata' }
    ]
  },
  {
    id: 'publishing-and-import',
    title: 'Publisering, import og kontroll',
    subtitle: 'Kvalitetssikring · Kurs 10',
    summary: 'Avslutt med forholdet mellom masterdata og teknisk publikasjon. Øv på trygg import, kontroll av mapping og betydningen av prosesslogg og revisjon.',
    start: 90,
    end: 100,
    foundation: [0, 3, 4, 6],
    concepts: [
      { term: 'Data Module', definition: 'En modulær enhet med teknisk informasjon som kan vedlikeholdes og gjenbrukes i publikasjoner.' },
      { term: 'Check Only', definition: 'En kontrollkjøring som viser forventede endringer uten å opprette eller endre data.' },
      { term: 'Importlogg', definition: 'Viser hva importprosessen opprettet, oppdaterte, hoppet over eller ville ha endret.' }
    ],
    matching: [
      { left: 'Check Only', right: 'Forhåndskontroll uten å endre data' },
      { left: 'Prosesslogg', right: 'Sporer hva importen gjorde eller ville gjort' },
      { left: 'Revisjonskontroll', right: 'Bevarer historikk for endringer i data' }
    ]
  }
];
