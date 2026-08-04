export const LOCALE_COOKIE = "antidoto:locale:v1";
export const LOCALE_STORAGE_KEY = "antidoto:locale:v1";
export const SUPPORTED_LOCALES = ["es", "en"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export type Messages = {
  header: {
    skip: string;
    brandLabel: string;
    arcade: string;
    manifesto: string;
    method: string;
    primaryNav: string;
    language: string;
    spanish: string;
    english: string;
  };
  motion: { pause: string; activate: string };
  /** Cromo de interfaz compartido por el arcade y las mecánicas de juego. */
  chrome: {
    brandMark: string;
    brandSub: string;
    brandEyebrow: string;
    progress: (current: number, total: number) => string;
    processingAnswer: string;
    answerReceived: string;
    sharedAs: string;
    verdictOptions: string;
    youChose: string;
    real: string;
    aiGenerated: string;
    imageUnavailable: string;
    publishedFrom: string;
    headlineToClassify: string;
    classifiableCard: string;
    dropToCancel: string;
    dropToSubmit: string;
    classificationOptions: string;
    journalism: string;
    clickbaitLabel: string;
    dragLeft: string;
    dragRight: string;
    youClassified: string;
    usingVia: string;
    sourceSwipe: string;
    sourceButton: string;
    sourceKeyboard: string;
    sourceCard: string;
    radarCategories: string;
    reliable: string;
    doubtful: string;
    fraudulent: string;
    reliableHint: string;
    doubtfulHint: string;
    fraudulentHint: string;
    messagesInOrder: string;
    careActions: string;
    fromLabel: string;
    timeRemaining: string;
    earlyWarning: (time: string) => string;
    postNumber: (n: string) => string;
    siftHints: string;
    quickSift: string;
    timeExpiredBody: string;
    feedActions: string;
    verify: string;
    share: string;
    discard: string;
    verifyHint: string;
    shareHint: string;
    discardHint: string;
    expiredByTime: string;
    decisionAccepted: (label: string) => string;
    verificationReady: string;
    motionClockNote: string;
    mastermindLabel: string;
    sessionSelections: string;
    stepOf: (current: number, total: number, label: string) => string;
    completeSimulation: (total: number) => string;
    optionsFor: (step: string) => string;
    educationalSimulation: string;
    autopsyOfFakeNews: string;
    autopsyDisclaimerDefault: string;
    simulatedReach: string;
    reachOf: (value: number) => string;
    reachMeter: string;
    reachNote: string;
    fictionalCommentsLabel: string;
    nothingPublished: string;
    stepObjective: string;
    stepEmotion: string;
    stepHeadline: string;
    stepEvidence: string;
    ofWord: string;
  };
  home: {
    kicker: string;
    heroLines: readonly [string, string, string, string];
    lede: string;
    chooseMission: string;
    seeMethod: string;
    signalAlert: string;
    signalShare: string;
    signalSource: string;
    signalVerified: string;
    signalTrace: string;
    signalContext: string;
    signalTape: string;
    missionCount: (count: number) => string;
    missionCountLabel: string;
    marquee: string;
    missionSection: string;
    missionTitle: string;
    missionDescription: string;
    manifestoSection: string;
    manifestoTitle: string;
    manifestoBody: string;
    manifestoDeclaration: string;
    methodSection: string;
    methodTitle: string;
    footer: string;
    backToTop: string;
    sift: readonly [
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
      { title: string; description: string },
    ];
  };
  games: {
    missionOpen: string;
    preparing: string;
    practice: string;
    enter: string;
    openLabel: (name: string) => string;
    upcoming: string;
    mission: string;
    training: string;
    objective: string;
    mechanic: string;
    backToArcade: string;
    navigation: string;
    missionReady: string;
    missionInProgress: string;
    scene: (current: number, total: number) => string;
    reviewFeedback: string;
    gameFinished: string;
    gameExpired: string;
    advancing: string;
    continue: string;
    nextScene: string;
    groupMechanic: string;
    groupStart: string;
    groupActions: Record<"forward" | "verify" | "pause", string>;
    groupActionDescriptions: Record<"forward" | "verify" | "pause", string>;
  };
  feedback: {
    region: string;
    nextAction: string;
    correct: string;
    review: string;
    hint: string;
    timeUp: string;
    accepted: string;
    signalToReview: string;
    whatToDo: string;
    keySignal: string;
    moreSignals: string;
    revealedAnswer: string;
    showDetails: string;
    hideDetails: string;
    result: string;
    explanation: string;
    recommendation: string;
  };
  form: {
    aliasLabel: string;
    aliasHint: string;
    aliasRequired: string;
    startFailed: string;
    starting: string;
    startMission: string;
  };
  leaderboard: {
    scope: string;
    title: string;
    supporting: string;
    empty: string;
    unavailable: string;
    retry: string;
    actions: string;
    caption: (limit: number) => string;
    position: string;
    alias: string;
    game: string;
    points: string;
    comparison: string;
    completed: string;
    normalized: (value: number) => string;
  };
  result: {
    result: string;
    completed: string;
    expired: string;
    alias: string;
    answers: (answered: number, total: number) => string;
    learning: string;
    score: string;
    points: string;
    correct: string;
    notApplicable: string;
    errors: string;
    bonuses: string;
    penalties: string;
    time: string;
    scoreAriaLabel: string;
    limit: (seconds: number) => string;
    used: (used: number, limit: number) => string;
    simulatedReach: (reach: number) => string;
    rankingOptional: string;
    rankingNote: string;
    actions: string;
  };
  state: {
    errorSignal: string;
    errorTitle: string;
    errorBody: string;
    retry: string;
    notFoundSignal: string;
    notFoundTitle: string;
    notFoundBody: string;
    loadingCode: string;
    loadingTitle: string;
    loadingBody: string;
    gameLoadingTitle: string;
    gameLoadingBody: string;
    gameNotFoundTitle: string;
    gameNotFoundBody: string;
    secureEyebrow: string;
    secureExpiredTitle: string;
    secureMissingTitle: string;
    secureExpired: string;
    secureMissing: string;
    consultRanking: string;
    startAnother: string;
    resultUnavailable: string;
    backToMission: string;
  };
  errors: {
    invalidAlias: string;
    blockedAlias: string;
    optionNotSelected: string;
    safeSession: string;
    resultPending: string;
    rankingEmpty: string;
    rankingUnavailable: string;
    unexpected: string;
  };
  gameLabels: Record<string, string>;
  mechanics: Record<string, string>;
};

function spanishMessages(): Messages {
  return {
    header: {
      skip: "Saltar al contenido",
      brandLabel: "Antídoto, ir al arcade",
      arcade: "Arcade",
      manifesto: "Manifiesto",
      method: "Método",
      primaryNav: "Navegación principal",
      language: "Idioma",
      spanish: "Español",
      english: "Inglés",
    },
    motion: { pause: "Pausar animación", activate: "Activar animación" },
    chrome: {
      brandMark: "ANTÍDOTO",
      brandSub: "Arcade MIL",
      brandEyebrow: "Antídoto / Arcade MIL",
      progress: (current, total) => `Progreso: ${current} de ${total}`,
      processingAnswer: "Procesando respuesta",
      answerReceived: "Respuesta recibida",
      sharedAs: "Se comparte como",
      verdictOptions: "Opciones de veredicto",
      youChose: "Elegiste",
      real: "Real",
      aiGenerated: "Generada por IA",
      imageUnavailable: "La imagen no está disponible; puedes responder con el texto del caso.",
      publishedFrom: "Se publica desde",
      headlineToClassify: "Titular a clasificar",
      classifiableCard: "Tarjeta clasificable",
      dropToCancel: "Suelta aquí para cancelar; cruza la marca para enviar.",
      dropToSubmit: "Suelta más allá de la marca para enviar.",
      classificationOptions: "Opciones de clasificación",
      journalism: "Periodismo",
      clickbaitLabel: "Clickbait",
      dragLeft: "Arrastra a la izquierda o pulsa ←",
      dragRight: "Arrastra a la derecha o pulsa →",
      youClassified: "Clasificaste",
      usingVia: "mediante",
      sourceSwipe: "gesto",
      sourceButton: "botón",
      sourceKeyboard: "teclado",
      sourceCard: "Tarjeta de fuente",
      radarCategories: "Categorías del radar",
      reliable: "Confiable",
      doubtful: "Dudosa",
      fraudulent: "Fraudulenta",
      reliableHint: "Verificable, con autor y rendición de cuentas",
      doubtfulHint: "Opinión, sátira o información incompleta",
      fraudulentHint: "Engaño deliberado: suplantación o estafa",
      messagesInOrder: "Mensajes en orden",
      careActions: "Acciones de cuidado",
      fromLabel: "Desde",
      timeRemaining: "Tiempo restante",
      earlyWarning: (time) => `Quedan ${time}. Decide o la partida expira.`,
      postNumber: (n) => `Publicación ${n}`,
      siftHints: "Pistas de verificación SIFT",
      quickSift: "Verificación rápida · SIFT",
      timeExpiredBody:
        "El tiempo se agotó. La partida expiró y la última decisión aceptada conserva su feedback.",
      feedActions: "Acciones del feed",
      verify: "Verificar",
      share: "Compartir",
      discard: "Descartar",
      verifyHint: "−4 s para revisar las pistas SIFT",
      shareHint: "Amplifica si es oficial o útil",
      discardHint: "Frena lo falso, reciclado o satírico",
      expiredByTime: "La partida expiró por tiempo.",
      decisionAccepted: (label) => `Decisión aceptada: ${label}.`,
      verificationReady: "Verificación lista; revisa las pistas y decide.",
      motionClockNote:
        "La pausa visual no detiene el reloj: el tiempo autoritativo sigue corriendo.",
      mastermindLabel: "Mente Maestra",
      sessionSelections: "Selecciones de esta sesión",
      stepOf: (current, total, label) => `Paso ${current} de ${total}: ${label}`,
      completeSimulation: (total) => `Simulación completa · ${total} pasos`,
      optionsFor: (step) => `Opciones del paso ${step}`,
      educationalSimulation: "Simulación educativa",
      autopsyOfFakeNews: "Autopsia de tu fake news",
      autopsyDisclaimerDefault:
        "Simulación educativa: no se publica contenido externo ni se crea una cuenta real. El alcance simulado explica el mecanismo; no es un premio.",
      simulatedReach: "Alcance simulado",
      reachOf: (value) => `${value} de 95`,
      reachMeter: "Medidor de alcance simulado",
      reachNote: "Este medidor es ficticio y no suma puntos. No hay publicación externa.",
      fictionalCommentsLabel: "Comentarios ficticios",
      nothingPublished: "No se publicó nada fuera de esta simulación.",
      stepObjective: "Objetivo",
      stepEmotion: "Emoción",
      stepHeadline: "Titular",
      stepEvidence: "Prueba",
      ofWord: "de",
    },
    home: {
      kicker: "UNESCO Youth Hackathon 2026 / Arcade MIL",
      heroLines: ["La mentira", "es viral.", "La verdad", "se entrena."],
      lede: "Juega a detectar lo que intenta engañarte.",
      chooseMission: "Elegir misión",
      seeMethod: "Ver el método SIFT",
      signalAlert: "ALERTA",
      signalShare: "¡COMPÁRTELO YA!",
      signalSource: "fuente: «me llegó»",
      signalVerified: "VERIFICADO",
      signalTrace: "RASTREA LA FUENTE",
      signalContext: "contexto + fecha + autor",
      signalTape: "NO TODO LO VIRAL ES VERDAD",
      missionCount: (count) => `${count} misiones disponibles`,
      missionCountLabel: "misiones para mirar mejor",
      marquee: "OBSERVA ✦ VERIFICA ✦ DECIDE ✦ COMPARTE CON CUIDADO ✦",
      missionSection: "01 / Elige tu misión",
      missionTitle: "Entrena el ojo. Rompe la cadena.",
      missionDescription:
        "Seis experiencias breves. Cada una entrena una señal distinta y te devuelve una explicación antes de avanzar.",
      manifestoSection: "02 / Manifiesto",
      manifestoTitle: "Dudar también es una habilidad.",
      manifestoBody:
        "La desinformación busca velocidad. Antídoto entrena una pausa: mirar mejor, preguntar de dónde viene y decidir con evidencia.",
      manifestoDeclaration: "No se trata de desconfiar de todo. Se trata de verificar mejor.",
      methodSection: "03 / Método de bolsillo",
      methodTitle: "SIFT antes de compartir.",
      footer: "ANTÍDOTO / Una pausa puede cortar la cadena.",
      backToTop: "Volver arriba ↑",
      sift: [
        { title: "Frena", description: "Frena antes de reaccionar o compartir." },
        { title: "Investiga", description: "Pregunta quién está detrás de la información." },
        { title: "Busca cobertura", description: "Compara con fuentes mejores y diversas." },
        { title: "Rastrea", description: "Vuelve al contexto y a la fuente original." },
      ],
    },
    games: {
      missionOpen: "Misión abierta",
      preparing: "En preparación",
      practice: "Práctica",
      enter: "Entrar al juego",
      openLabel: (name) => `Abrir ${name}`,
      upcoming: "Próximamente",
      mission: "Misión",
      training: "Entrenamiento MIL",
      objective: "Objetivo",
      mechanic: "Mecánica",
      backToArcade: "Volver al arcade",
      navigation: "Navegación de la misión",
      missionReady: "Misión lista",
      missionInProgress: "Misión en curso",
      scene: (current, total) => `Escena ${current} de ${total}`,
      reviewFeedback: "Revisa el feedback antes de continuar",
      gameFinished: "Partida terminada",
      gameExpired: "Partida expirada",
      advancing: "Avanzando…",
      continue: "Continuar",
      nextScene: "Preparando la siguiente escena…",
      groupMechanic: "decisión grupal · 6 escenas · máximo 12 puntos",
      groupStart: "Entrar al chat familiar",
      groupActions: { forward: "Reenviar", verify: "Verificar", pause: "Frenar" },
      groupActionDescriptions: { forward: "Amplifica sin comprobar", verify: "Contrasta y corrige", pause: "Detiene la cadena" },
    },
    feedback: {
      region: "Feedback educativo",
      nextAction: "Siguiente acción",
      correct: "Respuesta correcta",
      review: "Respuesta para revisar",
      hint: "Pista para seguir",
      timeUp: "Tiempo terminado",
      accepted: "Decisión aceptada",
      signalToReview: "Una señal para revisar",
      whatToDo: "Qué hacer:",
      keySignal: "Señal clave:",
      moreSignals: "Más señales",
      revealedAnswer: "Respuesta revelada:",
      showDetails: "Ver detalle",
      hideDetails: "Ocultar detalle",
      result: "Resultado",
      explanation: "Explicación",
      recommendation: "Recomendación",
    },
    form: {
      aliasLabel: "Elige un alias temporal",
      aliasHint: "Entre 3 y 40 caracteres. No uses datos personales reales.",
      aliasRequired: "Escribe un alias para empezar.",
      startFailed: "No se pudo iniciar la misión. Intenta de nuevo.",
      starting: "Iniciando…",
      startMission: "Empezar misión",
    },
    leaderboard: {
      scope: "Secundario / Opcional",
      title: "Ranking global secundario",
      supporting: "Esta lectura es opcional y no es un objetivo de aprendizaje ni un requisito para jugar.",
      empty: "Todavía no hay resultados elegibles en el ranking.",
      unavailable: "El ranking no está disponible ahora.",
      retry: "Reintentar lectura",
      actions: "Acciones del ranking",
      caption: (limit) => `Hasta ${limit} resultados elegibles. La comparación normalizada no sustituye la puntuación educativa de cada juego.`,
      position: "Posición",
      alias: "Alias",
      game: "Juego",
      points: "Puntos",
      comparison: "Comparación",
      completed: "Completado",
      normalized: (value) => `${value} por ciento`,
    },
    result: {
      result: "Resultado",
      completed: "Partida completada",
      expired: "Partida expirada",
      alias: "Alias",
      answers: (answered, total) => `Respuestas aceptadas: ${answered} de ${total}`,
      learning: "Aprendizaje",
      score: "Puntuación",
      points: "Puntos",
      correct: "Aciertos",
      notApplicable: "No aplica",
      errors: "Errores",
      bonuses: "Bonos",
      penalties: "Penalizaciones",
      time: "Tiempo",
      scoreAriaLabel: "Puntuación de la partida",
      limit: (seconds) => `Límite ${seconds}s`,
      used: (used, limit) => `${used}s de ${limit}s`,
      simulatedReach: (reach) => `Alcance simulado: ${reach}. No forma parte de la puntuación ni del ranking.`,
      rankingOptional: "Consultar ranking global (opcional)",
      rankingNote: "El ranking es una lectura secundaria y no es requisito para jugar ni para ver este resultado.",
      actions: "Acciones del resultado",
    },
    state: {
      errorSignal: "SEÑAL INTERRUMPIDA",
      errorTitle: "Algo hizo ruido.",
      errorBody: "No pudimos cargar esta vista. Tu siguiente intento puede recuperarla.",
      retry: "Reintentar",
      notFoundSignal: "ERROR / 404",
      notFoundTitle: "Esa señal no existe.",
      notFoundBody: "La ruta se perdió, pero puedes volver al arcade y elegir una misión válida.",
      loadingCode: "ANTÍDOTO / CARGANDO",
      loadingTitle: "Afinando la mirada.",
      loadingBody: "Preparando el arcade…",
      gameLoadingTitle: "Preparando tu misión.",
      gameLoadingBody: "Cargando la misión…",
      gameNotFoundTitle: "Juego no encontrado.",
      gameNotFoundBody: "Ese código no corresponde a una misión disponible. Vuelve al arcade para elegir un juego válido.",
      secureEyebrow: "Estado seguro",
      secureExpiredTitle: "Partida expirada.",
      secureMissingTitle: "Partida no recuperable.",
      secureExpired: "La partida expiró de forma segura. Puedes volver al arcade e iniciar otra.",
      secureMissing: "No hay una partida recuperable en este navegador. Puedes volver al arcade e iniciar otra.",
      consultRanking: "Consultar ranking",
      startAnother: "Iniciar otra partida",
      resultUnavailable: "Todavía no hay resultado",
      backToMission: "Volver a la misión",
    },
    errors: {
      invalidAlias: "Escribe un alias válido para empezar.",
      blockedAlias: "Ese alias no está permitido. Elige otro.",
      optionNotSelected: "Selecciona una opción antes de responder.",
      safeSession: "No hay una partida recuperable en este navegador. Puedes consultar el ranking o iniciar otra.",
      resultPending: "El resultado estará disponible cuando termine la partida.",
      rankingEmpty: "Todavía no hay resultados elegibles en el ranking.",
      rankingUnavailable: "El ranking no está disponible ahora. Puedes reintentar sin afectar tu partida.",
      unexpected: "Ocurrió un problema inesperado. Reintenta o vuelve al inicio.",
    },
    gameLabels: {
      "real-o-ia": "¿Real o IA?",
      grupo: "El Grupo",
      "clickbait-swipe": "Clickbait Swipe",
      "radar-de-fuentes": "Radar de Fuentes",
      "feed-60": "Feed 60”",
      "mente-maestra": "Mente Maestra",
    },
    mechanics: {
      image_verdict: "veredicto de imagen",
      group_decision: "decisión grupal",
      headline_classification: "clasificación de titulares",
      source_classification: "clasificación de fuentes",
      timed_feed: "feed cronometrado",
      guided_autopsy: "autopsia guiada",
    },
  };
}

function englishMessages(): Messages {
  const es = spanishMessages();
  return {
    ...es,
    header: {
      ...es.header,
      skip: "Skip to content",
      brandLabel: "Antidoto, go to arcade",
      manifesto: "Manifesto",
      method: "Method",
      primaryNav: "Primary navigation",
      language: "Language",
      spanish: "Spanish",
      english: "English",
    },
    motion: { pause: "Pause animation", activate: "Activate animation" },
    chrome: {
      brandMark: "ANTIDOTO",
      brandSub: "MIL Arcade",
      brandEyebrow: "Antidoto / MIL Arcade",
      progress: (current, total) => `Progress: ${current} of ${total}`,
      processingAnswer: "Processing answer",
      answerReceived: "Answer received",
      sharedAs: "Shared as",
      verdictOptions: "Verdict options",
      youChose: "You chose",
      real: "Real",
      aiGenerated: "AI-generated",
      imageUnavailable: "The image is unavailable; you can answer using the case text.",
      publishedFrom: "Published from",
      headlineToClassify: "Headline to classify",
      classifiableCard: "Classifiable card",
      dropToCancel: "Drop here to cancel; cross the mark to submit.",
      dropToSubmit: "Drop beyond the mark to submit.",
      classificationOptions: "Classification options",
      journalism: "Journalism",
      clickbaitLabel: "Clickbait",
      dragLeft: "Drag left or press ←",
      dragRight: "Drag right or press →",
      youClassified: "You classified",
      usingVia: "using",
      sourceSwipe: "a gesture",
      sourceButton: "a button",
      sourceKeyboard: "the keyboard",
      sourceCard: "Source card",
      radarCategories: "Radar categories",
      reliable: "Reliable",
      doubtful: "Doubtful",
      fraudulent: "Fraudulent",
      reliableHint: "Verifiable, with an author and accountability",
      doubtfulHint: "Opinion, satire, or incomplete information",
      fraudulentHint: "Deliberate deception: impersonation or fraud",
      messagesInOrder: "Messages in order",
      careActions: "Care actions",
      fromLabel: "From",
      timeRemaining: "Time remaining",
      earlyWarning: (time) => `${time} left. Decide or the game expires.`,
      postNumber: (n) => `Post ${n}`,
      siftHints: "SIFT verification clues",
      quickSift: "Quick check · SIFT",
      timeExpiredBody:
        "Time ran out. The game expired and the last accepted decision keeps its feedback.",
      feedActions: "Feed actions",
      verify: "Verify",
      share: "Share",
      discard: "Discard",
      verifyHint: "−4 s to review SIFT clues",
      shareHint: "Amplify if it is official or useful",
      discardHint: "Stop what is false, recycled, or satirical",
      expiredByTime: "The game expired because time ran out.",
      decisionAccepted: (label) => `Decision accepted: ${label}.`,
      verificationReady: "Verification ready; review the clues and decide.",
      motionClockNote:
        "Pausing motion does not stop the clock: authoritative time keeps running.",
      mastermindLabel: "Mastermind",
      sessionSelections: "Selections in this session",
      stepOf: (current, total, label) => `Step ${current} of ${total}: ${label}`,
      completeSimulation: (total) => `Complete simulation · ${total} steps`,
      optionsFor: (step) => `Options for ${step}`,
      educationalSimulation: "Educational simulation",
      autopsyOfFakeNews: "Autopsy of your fake news",
      autopsyDisclaimerDefault:
        "Educational simulation: no external content is published and no real account is created. Simulated reach explains the mechanism; it is not a prize.",
      simulatedReach: "Simulated reach",
      reachOf: (value) => `${value} of 95`,
      reachMeter: "Simulated reach meter",
      reachNote: "This meter is fictional and does not add points. Nothing is published externally.",
      fictionalCommentsLabel: "Fictional comments",
      nothingPublished: "Nothing was published outside this simulation.",
      stepObjective: "Objective",
      stepEmotion: "Emotion",
      stepHeadline: "Headline",
      stepEvidence: "Evidence",
      ofWord: "of",
    },
    home: {
      ...es.home,
      kicker: "UNESCO Youth Hackathon 2026 / MIL Arcade",
      heroLines: ["The lie", "goes viral.", "Truth", "is trained."],
      lede: "Play to spot what is trying to fool you.",
      chooseMission: "Choose a mission",
      seeMethod: "See the SIFT method",
      signalAlert: "ALERT",
      signalShare: "SHARE IT NOW!",
      signalSource: "source: “it reached me”",
      signalVerified: "VERIFIED",
      signalTrace: "TRACE THE SOURCE",
      signalContext: "context + date + author",
      signalTape: "NOT EVERYTHING VIRAL IS TRUE",
      missionCount: (count) => `${count} missions available`,
      missionCountLabel: "missions to see better",
      marquee: "OBSERVE ✦ VERIFY ✦ DECIDE ✦ SHARE WITH CARE ✦",
      missionSection: "01 / Choose your mission",
      missionTitle: "Train your eye. Break the chain.",
      missionDescription: "Six short experiences. Each trains a different signal and gives you an explanation before you move on.",
      manifestoSection: "02 / Manifesto",
      manifestoTitle: "Doubt is a skill too.",
      manifestoBody: "Misinformation wants speed. Antidoto trains a pause: look closer, ask where it came from, and decide with evidence.",
      manifestoDeclaration: "This is not about distrusting everything. It is about verifying better.",
      methodSection: "03 / Pocket method",
      methodTitle: "Use SIFT before you share.",
      footer: "ANTIDOTO / One pause can break the chain.",
      backToTop: "Back to top ↑",
      sift: [
        { title: "Stop", description: "Pause before reacting or sharing." },
        { title: "Investigate", description: "Ask who is behind the information." },
        { title: "Find coverage", description: "Compare it with better, diverse sources." },
        { title: "Trace", description: "Return to the context and original source." },
      ],
    },
    games: {
      ...es.games,
      missionOpen: "Mission open",
      preparing: "In preparation",
      practice: "Practice",
      enter: "Enter game",
      openLabel: (name) => `Open ${name}`,
      upcoming: "Coming soon",
      mission: "Mission",
      training: "MIL training",
      objective: "Objective",
      mechanic: "Mechanic",
      backToArcade: "Back to arcade",
      navigation: "Mission navigation",
      missionReady: "Mission ready",
      missionInProgress: "Mission in progress",
      scene: (current, total) => `Scene ${current} of ${total}`,
      reviewFeedback: "Review the feedback before continuing",
      gameFinished: "Game finished",
      gameExpired: "Game expired",
      advancing: "Advancing…",
      continue: "Continue",
      nextScene: "Preparing the next scene…",
      groupMechanic: "group decision · 6 scenes · 12 points maximum",
      groupStart: "Enter the family chat",
      groupActions: { forward: "Forward", verify: "Verify", pause: "Stop" },
      groupActionDescriptions: { forward: "Amplifies without checking", verify: "Checks and corrects", pause: "Stops the chain" },
    },
    feedback: {
      ...es.feedback,
      region: "Educational feedback",
      nextAction: "Next action",
      correct: "Correct answer",
      review: "Answer to review",
      hint: "Clue to follow",
      timeUp: "Time is up",
      accepted: "Decision accepted",
      signalToReview: "A signal to review",
      whatToDo: "What to do:",
      keySignal: "Key signal:",
      moreSignals: "More signals",
      revealedAnswer: "Revealed answer:",
      showDetails: "View details",
      hideDetails: "Hide details",
      result: "Result",
      explanation: "Explanation",
      recommendation: "Recommendation",
    },
    form: {
      aliasLabel: "Choose a temporary alias",
      aliasHint: "3 to 40 characters. Do not use real personal data.",
      aliasRequired: "Enter an alias to start.",
      startFailed: "The mission could not start. Try again.",
      starting: "Starting…",
      startMission: "Start mission",
    },
    leaderboard: {
      ...es.leaderboard,
      scope: "Secondary / Optional",
      title: "Secondary global leaderboard",
      supporting: "This view is optional and is not a learning goal or a requirement to play.",
      empty: "There are no eligible leaderboard results yet.",
      unavailable: "The leaderboard is unavailable right now.",
      retry: "Retry reading",
      actions: "Leaderboard actions",
      caption: (limit) => `Up to ${limit} eligible results. Normalized comparison does not replace each game's educational score.`,
      position: "Position",
      alias: "Alias",
      game: "Game",
      points: "Points",
      comparison: "Comparison",
      completed: "Completed",
      normalized: (value) => `${value} percent`,
    },
    result: {
      ...es.result,
      result: "Result",
      completed: "Game completed",
      expired: "Game expired",
      alias: "Alias",
      answers: (answered, total) => `Accepted answers: ${answered} of ${total}`,
      learning: "Learning",
      score: "Score",
      points: "Points",
      correct: "Correct",
      notApplicable: "Not applicable",
      errors: "Errors",
      bonuses: "Bonuses",
      penalties: "Penalties",
      time: "Time",
      scoreAriaLabel: "Game score",
      limit: (seconds) => `Limit ${seconds}s`,
      used: (used, limit) => `${used}s of ${limit}s`,
      simulatedReach: (reach) => `Simulated reach: ${reach}. It is not part of the score or leaderboard.`,
      rankingOptional: "View global leaderboard (optional)",
      rankingNote: "The leaderboard is secondary and is not required to play or view this result.",
      actions: "Result actions",
    },
    state: {
      ...es.state,
      errorSignal: "SIGNAL INTERRUPTED",
      errorTitle: "Something made noise.",
      errorBody: "We could not load this view. Your next attempt may recover it.",
      retry: "Try again",
      notFoundSignal: "ERROR / 404",
      notFoundTitle: "That signal does not exist.",
      notFoundBody: "The route was lost, but you can return to the arcade and choose a valid mission.",
      loadingCode: "ANTIDOTO / LOADING",
      loadingTitle: "Sharpening your eye.",
      loadingBody: "Preparing the arcade…",
      gameLoadingTitle: "Preparing your mission.",
      gameLoadingBody: "Loading the mission…",
      gameNotFoundTitle: "Game not found.",
      gameNotFoundBody: "That code does not match an available mission. Return to the arcade and choose a valid game.",
      secureEyebrow: "Secure state",
      secureExpiredTitle: "Game expired.",
      secureMissingTitle: "Game not recoverable.",
      secureExpired: "The game expired safely. You can return to the arcade and start another.",
      secureMissing: "There is no recoverable game in this browser. You can return to the arcade and start another.",
      consultRanking: "View leaderboard",
      startAnother: "Start another game",
      resultUnavailable: "There is no result yet",
      backToMission: "Back to mission",
    },
    errors: {
      ...es.errors,
      invalidAlias: "Enter a valid alias to start.",
      blockedAlias: "That alias is not allowed. Choose another.",
      optionNotSelected: "Select an option before answering.",
      safeSession: "There is no recoverable game in this browser. You can view the leaderboard or start another.",
      resultPending: "The result will be available when the game ends.",
      rankingEmpty: "There are no eligible leaderboard results yet.",
      rankingUnavailable: "The leaderboard is unavailable right now. You can retry without affecting your game.",
      unexpected: "Something unexpected happened. Try again or return home.",
    },
    gameLabels: {
      "real-o-ia": "Real or AI?",
      grupo: "The Group",
      "clickbait-swipe": "Clickbait Swipe",
      "radar-de-fuentes": "Source Radar",
      "feed-60": "60” Feed",
      "mente-maestra": "Mastermind",
    },
    mechanics: {
      image_verdict: "image verdict",
      group_decision: "group decision",
      headline_classification: "headline classification",
      source_classification: "source classification",
      timed_feed: "timed feed",
      guided_autopsy: "guided autopsy",
    },
  };
}

const MESSAGES: Record<Locale, Messages> = {
  es: spanishMessages(),
  en: englishMessages(),
};

export function resolveLocale(value: unknown): Locale {
  return value === "en" || value === "EN" ? "en" : "es";
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
