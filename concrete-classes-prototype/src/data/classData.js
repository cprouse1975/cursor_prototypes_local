/**
 * Concrete Classes data model
 *
 * A "Concrete Class" is a customer-facing label that describes a property of a
 * concrete mix in terms the customer cares about.  The actual materials batched
 * are linked at the mix-design level; the class is the translation layer.
 *
 * Example:
 *   Customer sees on Quote/Ticket/Invoice → "Admix Class: AEA+WRA"
 *   In the mix design               → Sika190 (WRA) + AER1465 (AEA)
 */

// ─── Class-type catalogue ─────────────────────────────────────────────────────

export const CLASS_TYPES = [
  {
    id: 'CONSISTENCE',
    label: 'Consistence',
    status: 'existing',
    description: 'Slump or flow code printed on the ticket (S1, S3, F3 …)',
    extraFields: [
      { key: 'workabilityType', label: 'Workability Type', hint: '01 = Slump · 02 = Flow' },
      { key: 'nominalWorkability', label: 'Nominal Workability', hint: 'Numeric target value' },
      { key: 'baseUom', label: 'Base UOM', hint: 'mm (slump) · mm (flow)' },
    ],
    example: 'S3',
  },
  {
    id: 'STRENGTH',
    label: 'Strength',
    status: 'existing',
    description: 'Compressive strength class (C20/25, C30/37 …)',
    extraFields: [
      { key: 'strengthValue', label: 'Strength Value', hint: 'Numeric cylinder / cube strength' },
      { key: 'strengthUom', label: 'Strength UOM', hint: 'MPa · N/mm²' },
    ],
    example: 'C30/37',
  },
  {
    id: 'AGG_SIZE',
    label: 'Aggregate Size',
    status: 'existing',
    description: 'Nominal maximum aggregate size class',
    extraFields: [
      { key: 'size', label: 'Size (mm)', hint: 'Nominal maximum aggregate size in mm' },
    ],
    example: '20MM',
  },
  {
    id: 'CEMENT',
    label: 'Cement',
    status: 'new',
    description:
      'Cement or combination class (CEM I, CIIIA …). Tells the customer the binder type; the mix design maps to actual cement materials.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
      { key: 'combinedPerformanceCategory', label: 'Combined Performance Category', hint: 'e.g. CEM II/B-S' },
    ],
    example: 'CIIIA',
  },
  {
    id: 'COARSE_AGG',
    label: 'Coarse Aggregate',
    status: 'new',
    description:
      'Coarse aggregate class linking to aggregate size. Controls which coarse materials are permitted in a mix family.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
      { key: 'aggregateSizeClassId', label: 'Aggregate Size Class', hint: 'Link to Aggregate Size class' },
      { key: 'maxStrength', label: 'Max Strength (MPa)', hint: 'Upper strength ceiling for this aggregate' },
    ],
    example: '20MM-LIMESTONE',
  },
  {
    id: 'FINE_AGG',
    label: 'Fine Aggregate',
    status: 'new',
    description: 'Fine aggregate (sand) class. Controls which fine materials are permitted.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
    ],
    example: 'NATURAL-SAND',
  },
  {
    id: 'WATER',
    label: 'Water',
    status: 'new',
    description: 'Water class. Classifies the water source or quality specification.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
    ],
    example: 'POTABLE',
  },
  {
    id: 'ADMIX',
    label: 'Admix',
    status: 'new',
    description:
      'Admixture class — the customer-facing label. The class name (e.g. AEA+WRA) appears on Quote / Ticket / Invoice. The actual admixtures batched (Sika190, AER1465 …) are linked in the mix design.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
    ],
    example: 'AEA+WRA',
  },
  {
    id: 'CHLORIDE',
    label: 'Chloride',
    status: 'new',
    description:
      'Chloride limit class (Cl 0.10, Cl 0.20 …). Uses the same extra fields as Cement class.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
      { key: 'combinedPerformanceCategory', label: 'Chloride Limit Code', hint: 'e.g. Cl 0.10' },
    ],
    example: 'Cl 0.40',
  },
  {
    id: 'EXPOSURE',
    label: 'Exposure',
    status: 'new',
    description:
      'Exposure or DC class. Each class carries a set of minimum specification constraints (cement class, aggregate size, min cement content, max w/c ratio).',
    extraFields: [
      {
        key: 'details',
        label: 'Constraint Details',
        hint: 'Array: { cementClassId, aggregateSizeClassId, minCement (kg/m³), maxWaterCementRatio }',
      },
    ],
    example: 'XC3',
  },
  {
    id: 'CONCRETE_TYPE',
    label: 'Concrete Type',
    status: 'new',
    description:
      'Concrete type or group (e.g. Ready-Mixed, Prescribed, Designed). Identity only — no extra numeric fields.',
    extraFields: [],
    example: 'RC',
  },
  {
    id: 'DESIGN_METHOD',
    label: 'Design Method',
    status: 'new',
    description:
      'Design method 1 or 2 per EN 206. Controls which mix-design workflow and batch-book rules apply.',
    extraFields: [
      { key: 'designMethodType', label: 'Design Method Type', hint: '01 = Method 1 · 02 = Method 2' },
    ],
    example: 'METHOD-1',
  },
  {
    id: 'BATCH_BOOK_TYPE',
    label: 'Batch Book Type',
    status: 'new',
    description:
      'Identifies which family of batch books a mix may use. Uses shared cement fields.',
    extraFields: [
      { key: 'baseMaterialClassId', label: 'Base Material Class', hint: 'Parent class for hierarchy' },
      { key: 'terminalClass', label: 'Terminal Class', hint: 'true if this class cannot be sub-classified' },
      { key: 'combinedPerformanceCategory', label: 'Batch Book Family', hint: 'e.g. STANDARD, RAPID' },
    ],
    example: 'STANDARD',
  },
  {
    id: 'MIX',
    label: 'Mix',
    status: 'existing',
    description:
      'Commercial mix family (C30, RC35, 1:1.5:3). The class header fields are stored here; full mix-design detail lives in Block 3.',
    extraFields: [
      { key: 'mixFamilyCode', label: 'Mix Family Code', hint: 'Commercial code e.g. C30, RC35' },
      { key: 'concreteTypeClassId', label: 'Concrete Type Class', hint: 'Link to Concrete Type class' },
      { key: 'designMethodClassId', label: 'Design Method Class', hint: 'Link to Design Method class' },
    ],
    example: 'RC35',
  },
];

// ─── Consistence classes (existing) ──────────────────────────────────────────

export const CONSISTENCE_CLASSES = [
  { id: 'S1', code: 'S1', description: 'Very stiff slump 10–40 mm', workabilityType: '01', nominalWorkability: 25, baseUom: 'mm' },
  { id: 'S2', code: 'S2', description: 'Stiff slump 50–90 mm', workabilityType: '01', nominalWorkability: 70, baseUom: 'mm' },
  { id: 'S3', code: 'S3', description: 'Medium slump 100–150 mm', workabilityType: '01', nominalWorkability: 125, baseUom: 'mm' },
  { id: 'S4', code: 'S4', description: 'Soft slump 160–210 mm', workabilityType: '01', nominalWorkability: 185, baseUom: 'mm' },
  { id: 'S5', code: 'S5', description: 'Very soft slump > 220 mm', workabilityType: '01', nominalWorkability: 230, baseUom: 'mm' },
  { id: 'F3', code: 'F3', description: 'Flow 450–600 mm', workabilityType: '02', nominalWorkability: 525, baseUom: 'mm' },
  { id: 'F4', code: 'F4', description: 'Flow 550–650 mm', workabilityType: '02', nominalWorkability: 600, baseUom: 'mm' },
  { id: 'F5', code: 'F5', description: 'Flow 660–750 mm', workabilityType: '02', nominalWorkability: 705, baseUom: 'mm' },
  { id: 'F6', code: 'F6', description: 'Flow > 760 mm', workabilityType: '02', nominalWorkability: 800, baseUom: 'mm' },
];

// ─── Strength classes (existing) ─────────────────────────────────────────────

export const STRENGTH_CLASSES = [
  { id: 'C16-20', code: 'C16/20', description: 'C16/20', strengthValue: 20, strengthUom: 'MPa' },
  { id: 'C20-25', code: 'C20/25', description: 'C20/25', strengthValue: 25, strengthUom: 'MPa' },
  { id: 'C25-30', code: 'C25/30', description: 'C25/30', strengthValue: 30, strengthUom: 'MPa' },
  { id: 'C30-37', code: 'C30/37', description: 'C30/37', strengthValue: 37, strengthUom: 'MPa' },
  { id: 'C35-45', code: 'C35/45', description: 'C35/45', strengthValue: 45, strengthUom: 'MPa' },
  { id: 'C40-50', code: 'C40/50', description: 'C40/50', strengthValue: 50, strengthUom: 'MPa' },
  { id: 'C45-55', code: 'C45/55', description: 'C45/55', strengthValue: 55, strengthUom: 'MPa' },
  { id: 'C50-60', code: 'C50/60', description: 'C50/60', strengthValue: 60, strengthUom: 'MPa' },
];

// ─── Aggregate size classes (existing) ───────────────────────────────────────

export const AGG_SIZE_CLASSES = [
  { id: '10MM', code: '10MM', description: '10 mm nominal', size: 10 },
  { id: '14MM', code: '14MM', description: '14 mm nominal', size: 14 },
  { id: '20MM', code: '20MM', description: '20 mm nominal', size: 20 },
  { id: '40MM', code: '40MM', description: '40 mm nominal', size: 40 },
];

// ─── Cement classes (NEW) ─────────────────────────────────────────────────────

export const CEMENT_CLASSES = [
  {
    id: 'CEMI',
    code: 'CEM I',
    description: 'Portland Cement',
    baseMaterialClassId: null,
    terminalClass: true,
    combinedPerformanceCategory: 'CEM I',
    actualMaterials: ['OPC (Ordinary Portland Cement)'],
  },
  {
    id: 'CIIA',
    code: 'CEM II/A',
    description: 'Portland composite cement (< 20% addition)',
    baseMaterialClassId: null,
    terminalClass: false,
    combinedPerformanceCategory: 'CEM II/A',
    actualMaterials: ['OPC + up to 20% GGBS / PFA / Limestone'],
  },
  {
    id: 'CIIB',
    code: 'CEM II/B',
    description: 'Portland composite cement (20–35% addition)',
    baseMaterialClassId: null,
    terminalClass: false,
    combinedPerformanceCategory: 'CEM II/B',
    actualMaterials: ['OPC + 20–35% GGBS / PFA / Limestone'],
  },
  {
    id: 'CIIIA',
    code: 'CEM III/A',
    description: '35–65% GGBS blend',
    baseMaterialClassId: null,
    terminalClass: true,
    combinedPerformanceCategory: 'CEM III/A',
    actualMaterials: ['50% OPC + 50% GGBS'],
    note: 'Example: 50% CEM I + 50% GGBS',
  },
  {
    id: 'CIIIB',
    code: 'CEM III/B',
    description: '66–80% GGBS blend',
    baseMaterialClassId: null,
    terminalClass: true,
    combinedPerformanceCategory: 'CEM III/B',
    actualMaterials: ['30% OPC + 70% GGBS'],
  },
  {
    id: 'CIVA',
    code: 'CEM IV/A',
    description: '11–35% pozzolan blend',
    baseMaterialClassId: null,
    terminalClass: true,
    combinedPerformanceCategory: 'CEM IV/A',
    actualMaterials: ['OPC + 11–35% PFA'],
  },
];

// ─── Coarse aggregate classes (NEW) ──────────────────────────────────────────

export const COARSE_AGG_CLASSES = [
  {
    id: '20MM-LIMESTONE',
    code: '20MM-LIMESTONE',
    description: '20 mm Crushed Limestone',
    baseMaterialClassId: null,
    terminalClass: true,
    aggregateSizeClassId: '20MM',
    maxStrength: 50,
    actualMaterials: ['20mm Limestone', '10mm Limestone'],
    note: 'The mix contains both 20mm and 10mm limestone fractions.',
  },
  {
    id: '20MM-GRAVEL',
    code: '20MM-GRAVEL',
    description: '20 mm Gravel / Uncrushed',
    baseMaterialClassId: null,
    terminalClass: true,
    aggregateSizeClassId: '20MM',
    maxStrength: 40,
    actualMaterials: ['20mm Gravel'],
  },
  {
    id: '10MM-LIMESTONE',
    code: '10MM-LIMESTONE',
    description: '10 mm Crushed Limestone',
    baseMaterialClassId: null,
    terminalClass: true,
    aggregateSizeClassId: '10MM',
    maxStrength: 50,
    actualMaterials: ['10mm Limestone'],
  },
  {
    id: '40MM-LIMESTONE',
    code: '40MM-LIMESTONE',
    description: '40 mm Crushed Limestone',
    baseMaterialClassId: null,
    terminalClass: true,
    aggregateSizeClassId: '40MM',
    maxStrength: 35,
    actualMaterials: ['40mm Limestone'],
  },
];

// ─── Fine aggregate classes (NEW) ────────────────────────────────────────────

export const FINE_AGG_CLASSES = [
  {
    id: 'NATURAL-SAND',
    code: 'NATURAL-SAND',
    description: 'Natural uncrushed sand',
    baseMaterialClassId: null,
    terminalClass: true,
    actualMaterials: ['Dune Sand', 'River Sand'],
  },
  {
    id: 'CRUSHED-SAND',
    code: 'CRUSHED-SAND',
    description: 'Manufactured / crushed fine aggregate',
    baseMaterialClassId: null,
    terminalClass: true,
    actualMaterials: ['Granite Crusher Fines'],
  },
];

// ─── Water classes (NEW) ─────────────────────────────────────────────────────

export const WATER_CLASSES = [
  {
    id: 'POTABLE',
    code: 'POTABLE',
    description: 'Potable / mains water',
    baseMaterialClassId: null,
    terminalClass: true,
    actualMaterials: ['Mains Water'],
  },
  {
    id: 'RECYCLED',
    code: 'RECYCLED',
    description: 'Recycled process water (compliant with EN 1008)',
    baseMaterialClassId: null,
    terminalClass: true,
    actualMaterials: ['Plant Wash-Out Water (treated)'],
  },
];

// ─── Admix classes (NEW) — key customer-facing translation ───────────────────
//
// The code/label is what the customer reads on their Quote / Ticket / Invoice.
// actualAdmixtures lists the products batched in the plant — the customer never
// needs to see these; they only need to know the class label.

export const ADMIX_CLASSES = [
  {
    id: 'NONE',
    code: 'NONE',
    description: 'No admixture',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: [],
    note: 'Plain concrete — no chemical admixtures added.',
  },
  {
    id: 'WRA',
    code: 'WRA',
    description: 'Water Reducing Agent (plasticiser)',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['Sika190'],
    note: 'Reduces water demand while maintaining workability.',
  },
  {
    id: 'AEA',
    code: 'AEA',
    description: 'Air Entraining Agent',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['AER1465'],
    note: 'Introduces micro air bubbles for freeze-thaw resistance.',
  },
  {
    id: 'AEA_WRA',
    code: 'AEA+WRA',
    description: 'Air Entraining Agent + Water Reducing Agent',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['AER1465', 'Sika190'],
    note: 'Both AEA and WRA are batched. Customer sees a single combined class label.',
  },
  {
    id: 'SUPERPLASTICISER',
    code: 'SUPERPLASTICISER',
    description: 'High-range water reducer (superplasticiser)',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['Sika ViscoCrete 25M'],
    note: 'Used for C40+ or self-compacting mixes requiring very high workability.',
  },
  {
    id: 'RETARDER',
    code: 'RETARDER',
    description: 'Set retarder',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['Sika Retarder HE'],
    note: 'Extended open time for large pours or hot weather.',
  },
  {
    id: 'ACCELERATOR',
    code: 'ACCELERATOR',
    description: 'Set accelerator',
    baseMaterialClassId: null,
    terminalClass: true,
    actualAdmixtures: ['Sika Rapid'],
    note: 'Faster strength gain for early striking or cold weather.',
  },
];

// ─── Chloride classes (NEW) ───────────────────────────────────────────────────

export const CHLORIDE_CLASSES = [
  { id: 'CL010', code: 'Cl 0.10', description: 'Max chloride 0.10% by mass of cement', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'Cl 0.10' },
  { id: 'CL020', code: 'Cl 0.20', description: 'Max chloride 0.20% by mass of cement', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'Cl 0.20' },
  { id: 'CL040', code: 'Cl 0.40', description: 'Max chloride 0.40% by mass of cement', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'Cl 0.40' },
];

// ─── Exposure classes (NEW) ───────────────────────────────────────────────────

export const EXPOSURE_CLASSES = [
  {
    id: 'X0',
    code: 'X0',
    description: 'No risk of corrosion or attack',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 260, maxWaterCementRatio: 0.70 }],
  },
  {
    id: 'XC1',
    code: 'XC1',
    description: 'Carbonation — dry or permanently wet',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 260, maxWaterCementRatio: 0.65 }],
  },
  {
    id: 'XC2',
    code: 'XC2',
    description: 'Carbonation — wet, rarely dry',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 280, maxWaterCementRatio: 0.60 }],
  },
  {
    id: 'XC3',
    code: 'XC3',
    description: 'Carbonation — moderate humidity',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 280, maxWaterCementRatio: 0.55 }],
  },
  {
    id: 'XC4',
    code: 'XC4',
    description: 'Carbonation — cyclic wet and dry',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 300, maxWaterCementRatio: 0.50 }],
  },
  {
    id: 'XF1',
    code: 'XF1',
    description: 'Freeze-thaw — moderate water saturation, no de-icing',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 300, maxWaterCementRatio: 0.55 }],
  },
  {
    id: 'XF3',
    code: 'XF3',
    description: 'Freeze-thaw — high water saturation, no de-icing',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 320, maxWaterCementRatio: 0.50 }],
  },
  {
    id: 'XF4',
    code: 'XF4',
    description: 'Freeze-thaw — high water saturation with de-icing salts',
    details: [{ cementClassId: 'CEMI', aggregateSizeClassId: '20MM', minCement: 340, maxWaterCementRatio: 0.45 }],
  },
  {
    id: 'DC1',
    code: 'DC-1',
    description: 'Design Chemical class 1 — low sulfate ground',
    details: [{ cementClassId: 'CIIIA', aggregateSizeClassId: '20MM', minCement: 290, maxWaterCementRatio: 0.55 }],
  },
  {
    id: 'DC2',
    code: 'DC-2',
    description: 'Design Chemical class 2',
    details: [{ cementClassId: 'CIIIA', aggregateSizeClassId: '20MM', minCement: 320, maxWaterCementRatio: 0.50 }],
  },
  {
    id: 'DC3',
    code: 'DC-3',
    description: 'Design Chemical class 3',
    details: [{ cementClassId: 'CIIIA', aggregateSizeClassId: '14MM', minCement: 360, maxWaterCementRatio: 0.45 }],
  },
  {
    id: 'DC4',
    code: 'DC-4',
    description: 'Design Chemical class 4 — aggressive ground',
    details: [{ cementClassId: 'CIIIB', aggregateSizeClassId: '14MM', minCement: 380, maxWaterCementRatio: 0.40 }],
  },
];

// ─── Concrete type classes (NEW) ─────────────────────────────────────────────

export const CONCRETE_TYPE_CLASSES = [
  { id: 'RC', code: 'RC', description: 'Reinforced Concrete' },
  { id: 'PC', code: 'PC', description: 'Plain Concrete' },
  { id: 'PAV', code: 'PAV', description: 'Pavement / Road Concrete' },
  { id: 'SCC', code: 'SCC', description: 'Self-Compacting Concrete' },
  { id: 'LW', code: 'LW', description: 'Lightweight Concrete' },
  { id: 'HW', code: 'HW', description: 'Heavyweight / Shielding Concrete' },
];

// ─── Design method classes (NEW) ─────────────────────────────────────────────

export const DESIGN_METHOD_CLASSES = [
  {
    id: 'METHOD-1',
    code: 'METHOD-1',
    description: 'Design Method 1 — designed concrete (performance specified)',
    designMethodType: '01',
  },
  {
    id: 'METHOD-2',
    code: 'METHOD-2',
    description: 'Design Method 2 — prescribed concrete (composition specified)',
    designMethodType: '02',
  },
];

// ─── Batch book type classes (NEW) ───────────────────────────────────────────

export const BATCH_BOOK_TYPE_CLASSES = [
  { id: 'STANDARD', code: 'STANDARD', description: 'Standard batch book family', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'STANDARD' },
  { id: 'RAPID', code: 'RAPID', description: 'Rapid-hardening batch book family', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'RAPID' },
  { id: 'SCC', code: 'SCC', description: 'Self-compacting concrete batch book family', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'SCC' },
  { id: 'SULFATE-RESIST', code: 'SULFATE-RESIST', description: 'Sulfate-resisting batch book family', baseMaterialClassId: null, terminalClass: true, combinedPerformanceCategory: 'SULFATE-RESIST' },
];

// ─── Example mix with all classes assembled ───────────────────────────────────

export const EXAMPLE_MIX = {
  code: 'RC35',
  description: 'Reinforced Concrete C35',
  classes: {
    concreteType: 'RC',
    strength: 'C35/45',
    consistence: 'S3',
    cementClass: 'CEM III/A',
    coarseAggClass: '20MM-LIMESTONE',
    fineAggClass: 'NATURAL-SAND',
    waterClass: 'POTABLE',
    admixClass: 'AEA+WRA',
    chlorideClass: 'Cl 0.40',
    exposureClass: 'XC3',
    designMethod: 'METHOD-1',
    batchBookType: 'STANDARD',
  },
  actualBatchMaterials: {
    cement: ['OPC 280 kg/m³', 'GGBS 280 kg/m³'],
    coarseAgg: ['20mm Limestone 650 kg/m³', '10mm Limestone 200 kg/m³'],
    fineAgg: ['River Sand 720 kg/m³'],
    water: ['Mains Water 175 L/m³'],
    admixtures: ['Sika190 (WRA) 1.2 L/m³', 'AER1465 (AEA) 0.35 L/m³'],
  },
};

// ─── Navigation ───────────────────────────────────────────────────────────────

export const NAV_STEPS = [
  { id: 'overview', label: 'Overview', path: '/', phase: 'Context' },
  { id: 'class-library', label: 'Class Library', path: '/class-library', phase: 'Context' },
  { id: 'admix', label: 'Admix Classes', path: '/admix', phase: 'New Classes' },
  { id: 'cement', label: 'Cement Classes', path: '/cement', phase: 'New Classes' },
  { id: 'coarse-fine', label: 'Coarse & Fine Agg', path: '/coarse-fine', phase: 'New Classes' },
  { id: 'exposure', label: 'Exposure & Chloride', path: '/exposure', phase: 'New Classes' },
  { id: 'design-method', label: 'Design Method & Batch Book', path: '/design-method', phase: 'New Classes' },
  { id: 'mix-builder', label: 'Mix Class Builder', path: '/mix-builder', phase: 'Assembly' },
];
