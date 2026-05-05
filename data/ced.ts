export type CEDAlignment = {
  moduleName: string;
  cedUnit: string;
  cedTopics: string[];
  sciencePracticeTags: string[];
  alignmentSummary: string;
  cedUrl?: string;
};

const apPhysicsEmCedPdfUrl =
  "https://apcentral.collegeboard.org/media/pdf/ap-physics-c-electricity-and-magnetism-course-and-exam-description.pdf";

export const cedAlignments: Record<string, CEDAlignment> = {
  magneticFlux: {
    moduleName: "Magnetic Flux Lab",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: ["13.1 Magnetic Flux"],
    sciencePracticeTags: [
      "1.A Representations",
      "1.B Quantitative Graphs",
      "2.D Predict Variable Changes",
    ],
    alignmentSummary:
      "Students manipulate magnetic field strength, loop area, angle, and turns to model how magnetic flux and flux linkage change.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  faradayLenz: {
    moduleName: "Faraday + Lenz Simulator",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: [
      "13.2 Electromagnetic Induction",
      "13.3 Induced Currents and Magnetic Forces",
    ],
    sciencePracticeTags: [
      "1.A Representations",
      "1.B Quantitative Graphs",
      "3.B Apply a Model",
      "3.C Justify with Evidence",
    ],
    alignmentSummary:
      "Students connect changing flux, induced emf, and induced current direction while comparing entering, inside, and leaving-field behavior.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  lenzTrainer: {
    moduleName: "Lenz's Law Direction Trainer",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: [
      "13.2 Electromagnetic Induction",
      "13.3 Induced Currents and Magnetic Forces",
    ],
    sciencePracticeTags: [
      "1.A Representations",
      "2.C Compare Quantities",
      "3.B Apply a Model",
      "3.C Justify with Evidence",
    ],
    alignmentSummary:
      "Students reason from field direction and flux change to induced field and current direction using Lenz's law and right-hand rule.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  inductance: {
    moduleName: "Inductance Visualizer",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: ["13.4 Inductance"],
    sciencePracticeTags: [
      "1.A Representations",
      "2.B Calculate/Estimate",
      "2.C Compare Quantities",
      "3.B Apply a Model",
    ],
    alignmentSummary:
      "Students model induced emf, magnetic energy storage, and geometry-based changes in solenoid inductance.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  lrCircuit: {
    moduleName: "LR Circuit Lab",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: ["13.5 Circuits with Resistors and Inductors (LR Circuits)"],
    sciencePracticeTags: [
      "1.B Quantitative Graphs",
      "2.C Compare Quantities",
      "2.D Predict Variable Changes",
      "3.B Apply a Model",
    ],
    alignmentSummary:
      "Students model LR transients, time constant behavior, voltage partition, and long-time steady-state behavior.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  lcOscillator: {
    moduleName: "LC Oscillator Lab",
    cedUnit: "Unit 13: Electromagnetic Induction",
    cedTopics: ["13.6 Circuits with Capacitors and Inductors (LC Circuits)"],
    sciencePracticeTags: [
      "1.B Quantitative Graphs",
      "2.C Compare Quantities",
      "3.B Apply a Model",
      "3.C Justify with Evidence",
    ],
    alignmentSummary:
      "Students model charge-current phase relationships and energy transfer between electric and magnetic fields in LC oscillations.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
  rcVsLr: {
    moduleName: "RC vs LR Comparison",
    cedUnit: "Units 11 and 13",
    cedTopics: [
      "11.8 Resistor-Capacitor (RC) Circuits",
      "13.5 Circuits with Resistors and Inductors (LR Circuits)",
    ],
    sciencePracticeTags: [
      "1.B Quantitative Graphs",
      "2.C Compare Quantities",
      "2.D Predict Variable Changes",
    ],
    alignmentSummary:
      "Students compare RC and LR exponential responses and identify which quantity cannot change instantly in each model.",
    cedUrl: apPhysicsEmCedPdfUrl,
  },
};

export const defaultModelAssumptions = [
  "Fields are uniform unless stated otherwise.",
  "Circuit elements are ideal unless resistance is explicitly included.",
  "Wire resistance is negligible unless modeled.",
  "The LC oscillator is ideal unless damping is explicitly added.",
  "Radiation losses are ignored.",
  "Lumped-circuit approximations are used.",
  "Signs follow the conventions displayed in each module.",
];
