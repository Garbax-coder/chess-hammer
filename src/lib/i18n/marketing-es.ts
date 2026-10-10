import type { MarketingCopy } from './marketing'

export const es: MarketingCopy = {
  nav: {
    guide: 'El método',
    signIn: 'Entrar',
    startFree: 'Empieza gratis',
    goToDashboard: 'Ir al panel',
    languageMenu: 'Idioma',
  },
  seo: {
    home: {
      title: 'Chess Hammer — Entrenador de táctica de ajedrez gratis',
      description:
        'Entrena la táctica de ajedrez con el método Woodpecker: los mismos puzzles de Lichess en tres rondas, cada vez más rápido. Gratis, sin publicidad.',
    },
    guide: {
      title: 'Método Woodpecker: guía y entrenamiento online gratis | Chess Hammer',
      description:
        'Qué es el método Woodpecker, por qué funciona repetir los mismos puzzles y cómo organizar las tres rondas. Con un entrenador online gratuito que lo aplica.',
    },
  },
  puzzle: {
    prompt: 'Juegan las negras: encuentra la jugada que gana material.',
    wrong: 'No es esa. Busca un jaque que ataque también otra pieza.',
    solved: 'Exacto: ataque doble con jaque, el caballo está perdido.',
    caption: 'Puzzle real de la base de datos de Lichess · rating 1500',
  },
  faqTitle: 'Preguntas frecuentes',
  faq: [
    {
      q: '¿Qué es el método Woodpecker?',
      a: 'Un método de entrenamiento táctico ideado por los grandes maestros Axel Smith y Hans Tikkanen: resuelves el mismo conjunto de puzzles varias veces, cada vez más rápido, hasta que los motivos tácticos se vuelven automáticos. Chess Hammer lo aplica, pero no está afiliado a los autores.',
    },
    {
      q: '¿Chess Hammer es gratis?',
      a: 'Sí: registro, entrenamiento, análisis con Stockfish y estadísticas son gratuitos y sin publicidad. El código es abierto (GPLv3).',
    },
    {
      q: '¿De dónde salen los puzzles?',
      a: 'De la base de datos pública de Lichess: más de 200.000 posiciones de partidas reales, elegidas según tu nivel y los temas que prefieras. Chess Hammer no está afiliado a Lichess.',
    },
    {
      q: '¿Cuánto tiempo hace falta al día?',
      a: 'Tú decides el ritmo. Normalmente 10 puzzles al día en la primera ronda, 20 en la segunda y 40 en la tercera, con unos días de descanso entre rondas: unos dos meses para un conjunto de 200.',
    },
    {
      q: '¿Hay que instalar algo?',
      a: 'No: Chess Hammer funciona en el navegador, en el ordenador y en el móvil. Basta con una cuenta con correo o Google.',
    },
  ],
  landing: {
    eyebrow: 'Entrenamiento táctico para ajedrecistas',
    title: 'Reconoce la táctica antes incluso de calcularla',
    subtitle:
      'Prueba este puzzle. En Chess Hammer no desaparece cuando lo resuelves: lo vuelves a encontrar dos veces más, con días de diferencia, hasta que la solución salta a la vista. Es el método Woodpecker, organizado para ti.',
    ctaPrimary: 'Crea tu conjunto gratis',
    ctaSecondary: 'Cómo funciona',
    note: 'Acceso con correo o Google · puzzles de la base de datos pública de Lichess',
    stats: [
      { value: '210.000', label: 'puzzles de partidas reales' },
      { value: '3 rondas', label: 'sobre el mismo conjunto' },
      { value: '0 €', label: 'sin publicidad' },
      { value: 'Código abierto', label: 'código público GPLv3' },
    ],
    howTitle: 'Cómo funciona',
    steps: [
      {
        title: 'Creas tu conjunto',
        text: 'Elige cuántos puzzles (normalmente 200) y qué temas: Chess Hammer los saca de la base de datos de Lichess según tu nivel.',
      },
      {
        title: 'Lo repites tres veces',
        text: 'Primera ronda con calma, luego cada vez más rápido: 10, 20 y 40 puzzles al día, con unos días de descanso entre rondas.',
      },
      {
        title: 'Mides tu progreso',
        text: 'Tiempos, errores y rating ELO ronda tras ronda: ve qué motivos tácticos se han vuelto automáticos y cuáles todavía no.',
      },
    ],
    featuresTitle: 'Todo lo que necesitas para entrenar, nada más',
    features: [
      {
        title: 'Repetición por rondas',
        text: 'El mismo conjunto, tres veces: la memoria de los motivos tácticos se construye repitiendo, no resolviendo siempre puzzles nuevos.',
      },
      {
        title: 'Análisis con Stockfish',
        text: 'Después de cada puzzle puedes analizar la posición con el motor, directamente en el navegador.',
      },
      {
        title: 'Estadísticas y rating',
        text: 'ELO, tiempos y porcentaje de aciertos por ronda y por tema, con el historial de cada sesión.',
      },
      {
        title: 'Práctica libre',
        text: 'Al completar la cuota del día, repasa los puzzles fallados sin tocar la sesión oficial.',
      },
    ],
    guideTeaser: {
      title: '¿Por qué funciona repetir los mismos puzzles?',
      text: 'La guía del método Woodpecker: de dónde viene, cómo se organizan las tres rondas y qué cambia frente a los puzzles al azar.',
      cta: 'Leer la guía',
    },
    finalTitle: 'Tu primer conjunto está listo en un minuto',
    finalCta: 'Empieza gratis',
  },
  guide: {
    kicker: 'Guía · Entrenamiento táctico · 6 minutos de lectura',
    title: 'El método Woodpecker, online y gratis',
    intro:
      'El mismo conjunto de puzzles, tres veces, cada vez más rápido. Es la forma más eficaz de convertir la táctica en reflejo, y Chess Hammer lo organiza por ti: cuota diaria, descansos entre rondas, tiempos y progreso.',
    ctaPrimary: 'Prueba el método gratis',
    ctaSecondary: 'Leer la guía',
    tocTitle: 'En esta página',
    whyTitle: 'Por qué funciona repetir los mismos puzzles',
    whyText:
      'En una partida, la táctica no se calcula desde cero: se reconoce. Un jugador fuerte ve el mate de Anastasia porque ya lo ha visto decenas de veces. El método ideado por los grandes maestros Axel Smith y Hans Tikkanen entrena justo eso: en lugar de resolver siempre puzzles nuevos, se repite el mismo conjunto hasta que la solución llega antes que el cálculo.',
    exampleLabel: 'Puzzle de Lichess · rating 1899',
    exampleTitle: 'Mate en dos con sacrificio',
    exampleText:
      'En la primera ronda lo calculas. En la tercera lo reconoces en dos segundos: dama a h7, el rey tiene que capturarla, torre a h4 mate.',
    roundsTitle: 'Las tres rondas, paso a paso',
    rounds: [
      {
        title: 'Ronda 1 · unas 3 semanas',
        pace: '10 puzzles al día',
        text: 'Resuelve los 200 puzzles del conjunto con calma, calculando cada variante. Los errores son normales: son el material del repaso.',
      },
      {
        title: 'Descanso · unos días',
        pace: 'ningún puzzle',
        text: 'Descansar entre rondas hace que la siguiente sea un verdadero recuerdo, no una repetición a corto plazo.',
      },
      {
        title: 'Ronda 2 · unos 10 días',
        pace: '20 puzzles al día',
        text: 'El mismo conjunto, al doble de ritmo. Muchas soluciones vuelven solas: el reconocimiento empieza a ocupar el lugar del cálculo.',
      },
      {
        title: 'Ronda 3 · unos 5 días',
        pace: '40 puzzles al día',
        text: 'El conjunto entero en pocos días. Aquí se ve el resultado: tiempos mucho más cortos y motivos tácticos que ves sin pensar.',
      },
    ],
    compareTitle: '¿Puzzles al azar o entrenamiento por rondas?',
    compareHead: { random: 'Puzzles al azar', ours: 'Chess Hammer' },
    compareRows: [
      {
        label: 'Cada posición la ves',
        random: 'una vez',
        ours: 'tres veces, cada vez más espaciadas',
      },
      { label: 'Objetivo', random: 'resolver', ours: 'reconocer sin calcular' },
      {
        label: 'Ritmo',
        random: 'al azar',
        ours: 'cuota diaria y descansos entre rondas',
      },
      {
        label: 'Progreso',
        random: 'el rating sube y baja',
        ours: 'tiempos y errores comparados ronda a ronda',
      },
    ],
    finalTitle: '¿Listo para tu primera ronda?',
    finalText:
      'Crea tu conjunto de 200 puzzles en un minuto. Gratis, sin publicidad, código abierto.',
    finalCta: 'Empezar la primera ronda',
  },
}
