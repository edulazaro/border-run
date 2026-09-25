import type { Locale } from "../shell/i18n";

const ES = {
  tobacco: "TABACO",
  slow: "¡LENTO!",
  waitDrop: "Espera el punto de descarga...",
  dropHere: "¡DESCARGA!",
  dropAhead: "DESCARGA >>>",
  dropMissed: "<<< ¡PERDIDO!",
  trunkFull: "¡MALETERO LLENO!",
  dragHint: "ARRASTRA PARA MOVER EL COCHE",
  quotes: [
    "Ese lleva más de 4 cartones...",
    "En mis tiempos pasábamos 20",
    "¡Corre que viene la poli!",
    "Eso no cabe en el maletero",
    "Mi nieto es más rápido",
    "¿Llevas tabaco rubio o negro?",
    "La frontera está chunga hoy",
  ],
  description:
    "Cruza la frontera con el máximo de tabaco posible. La policía andorrana te está buscando. Más de 4 cartones y el coche va más lento.",
  subtitle: "Contrabandista de tabaco",
  record: "Récord",
  level: "NIVEL",
  reachedLevel: (n: number) => `Nivel ${n}`,
  caughtPolice: "¡Te ha pillado la policía!",
  crashed: "¡Has chocado!",
  delivered: (n: number) => (n === 1 ? "1 cartón entregado" : `${n} cartones entregados`),
  newRecord: "¡Nuevo récord!",
  howTo: "Cómo jugar",
  chipMove: "FLECHAS",
  chipDrag: "ARRASTRA",
  chipTobacco: "TABACO",
  chipPolice: "POLICÍA",
  chipTrucks: "CAMIONES",
  helpMove: "Mueve el coche por la carretera para esquivar obstáculos.",
  helpTobacco:
    "Recoge cartones de tabaco (máximo 8, con más de 4 vas más lento). Llévalos a la furgoneta de DESCARGA, en el carril de arriba, para sumar 150 m por cartón.",
  helpPolice: "Esquiva los coches de policía. Si te pillan, Game Over.",
  helpTrucks: "Los camiones son lentos pero grandes. Cuidado también con los conos.",
  helpKeys: "P o Esc: pausa. M: silenciar.",
};

export type Texts = typeof ES;

const CA: Texts = {
  tobacco: "TABAC",
  slow: "LENT!",
  waitDrop: "Espera el punt de descàrrega...",
  dropHere: "DESCARREGA!",
  dropAhead: "DESCÀRREGA >>>",
  dropMissed: "<<< PERDUT!",
  trunkFull: "MALETER PLE!",
  dragHint: "ARROSSEGA PER MOURE EL COTXE",
  quotes: [
    "Aquell porta més de 4 cartrons...",
    "En el meu temps en passàvem 20",
    "Corre que ve la poli!",
    "Això no cap al maleter",
    "El meu nét és més ràpid",
    "Portes tabac ros o negre?",
    "La frontera està xunga avui",
  ],
  description:
    "Creua la frontera amb el màxim de tabac possible. La policia andorrana t'està buscant. Més de 4 cartrons i el cotxe va més lent.",
  subtitle: "Contrabandista de tabac",
  record: "Rècord",
  level: "NIVELL",
  reachedLevel: (n: number) => `Nivell ${n}`,
  caughtPolice: "T'ha enxampat la policia!",
  crashed: "Has xocat!",
  delivered: (n: number) => (n === 1 ? "1 cartró entregat" : `${n} cartrons entregats`),
  newRecord: "Nou rècord!",
  howTo: "Com jugar",
  chipMove: "FLETXES",
  chipDrag: "ARROSSEGA",
  chipTobacco: "TABAC",
  chipPolice: "POLICIA",
  chipTrucks: "CAMIONS",
  helpMove: "Mou el cotxe per la carretera per esquivar obstacles.",
  helpTobacco:
    "Recull cartrons de tabac (màxim 8, amb més de 4 vas més lent). Porta'ls a la furgoneta de DESCÀRREGA, al carril de dalt, per sumar 150 m per cartró.",
  helpPolice: "Esquiva els cotxes de policia. Si t'enxampen, Game Over.",
  helpTrucks: "Els camions són lents però grans. Compte també amb els cons.",
  helpKeys: "P o Esc: pausa. M: silenciar.",
};

const EN: Texts = {
  tobacco: "TOBACCO",
  slow: "SLOW!",
  waitDrop: "Wait for the drop-off point...",
  dropHere: "UNLOAD!",
  dropAhead: "DROP-OFF >>>",
  dropMissed: "<<< MISSED!",
  trunkFull: "TRUNK FULL!",
  dragHint: "DRAG TO STEER THE CAR",
  quotes: [
    "That one's carrying more than 4 cartons...",
    "In my day we smuggled 20",
    "Run, the cops are coming!",
    "That won't fit in the trunk",
    "My grandson drives faster",
    "Blond or dark tobacco?",
    "The border's rough today",
  ],
  description:
    "Cross the border with as much tobacco as you can carry. The Andorran police are after you. More than 4 cartons and the car slows down.",
  subtitle: "Tobacco smuggler",
  record: "Best",
  level: "LEVEL",
  reachedLevel: (n: number) => `Level ${n}`,
  caughtPolice: "The police caught you!",
  crashed: "You crashed!",
  delivered: (n: number) => (n === 1 ? "1 carton delivered" : `${n} cartons delivered`),
  newRecord: "New record!",
  howTo: "How to play",
  chipMove: "ARROWS",
  chipDrag: "DRAG",
  chipTobacco: "TOBACCO",
  chipPolice: "POLICE",
  chipTrucks: "TRUCKS",
  helpMove: "Steer the car along the road to dodge obstacles.",
  helpTobacco:
    "Pick up tobacco cartons (8 max, more than 4 slows you down). Take them to the DROP-OFF van in the top lane for 150 m per carton.",
  helpPolice: "Dodge the police cars. If they catch you, Game Over.",
  helpTrucks: "Trucks are slow but big. Watch out for the cones too.",
  helpKeys: "P or Esc: pause. M: mute.",
};

/** Every string the game shows, in each language. */
export const TEXT: Record<Locale, Texts> = { es: ES, ca: CA, en: EN };

/** Road signs along the CG-1. Real Andorran signs are in Catalan in every language. */
export const SIGNS = ["CG-1", "FRONTERA", "SANT JULIÀ DE LÒRIA", "ESPANYA", "LA SEU D'URGELL"];
