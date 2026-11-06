export type ObjectType = 'candle' | 'arrow' | 'tree' | 'pavilion';

export interface OpticalParameters {
  objectDistance: number; // d_o in meters: 1.0 to 6.0
  objectHeight: number;   // h_o in meters: 0.5 to 2.0
  screenDistance: number; // d_i in meters: 0.1 to 1.0
  objectType: ObjectType;
  showRays: boolean;
  showSimilarTriangles: boolean;
  showDimensions: boolean;
}

export interface PresetScenario {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  params: Partial<OpticalParameters>;
}

export interface OpticalComputation {
  imageHeight: number;       // h_i in meters
  magnification: number;     // M = h_i / h_o = d_i / d_o
  objectRatio: number;       // h_o / d_o
  imageRatio: number;        // h_i / d_i
}

export const DEFAULT_PARAMETERS: OpticalParameters = {
  objectDistance: 3.0,
  objectHeight: 1.6,
  screenDistance: 0.5,
  objectType: 'candle',
  showRays: true,
  showSimilarTriangles: false,
  showDimensions: true,
};

export const PRESETS: PresetScenario[] = [
  {
    id: 'studio-standard',
    name: 'Standard Benchmark',
    subtitle: 'Balanced Classroom Demo',
    description: '3.0 m object distance with 0.5 m screen distance. Produces a 6:1 reduction.',
    params: {
      objectDistance: 3.0,
      objectHeight: 1.6,
      screenDistance: 0.5,
      objectType: 'candle',
    },
  },
  {
    id: 'test-case-1',
    name: 'Validation Test 1',
    subtitle: 'h_o = 1m, d_o = 2m, d_i = 0.5m',
    description: 'Test case: h_o = 1.0 m, d_o = 2.0 m, d_i = 0.5 m. Yields h_i = 0.250 m.',
    params: {
      objectDistance: 2.0,
      objectHeight: 1.0,
      screenDistance: 0.5,
      objectType: 'arrow',
    },
  },
  {
    id: 'test-case-2',
    name: 'Validation Test 2',
    subtitle: 'h_o = 1m, d_o = 4m, d_i = 0.5m',
    description: 'Test case: doubling d_o to 4.0 m halves image height to h_i = 0.125 m.',
    params: {
      objectDistance: 4.0,
      objectHeight: 1.0,
      screenDistance: 0.5,
      objectType: 'arrow',
    },
  },
  {
    id: 'vermeer-room',
    name: "Vermeer's Chamber",
    subtitle: '17th-Century Painting Room',
    description: 'A deep room with a distant subject and a large walk-in dark chamber box.',
    params: {
      objectDistance: 4.8,
      objectHeight: 1.8,
      screenDistance: 0.8,
      objectType: 'tree',
    },
  },
  {
    id: 'macro-close',
    name: 'Close-Up Projection',
    subtitle: 'Near Field Geometry',
    description: 'Subject brought close (1.2 m) with long box depth (0.9 m) to maximize projected size.',
    params: {
      objectDistance: 1.2,
      objectHeight: 0.8,
      screenDistance: 0.9,
      objectType: 'arrow',
    },
  },
  {
    id: 'distant-architectural',
    name: 'Distant Architectural',
    subtitle: 'Urban Surveying Scale',
    description: 'Distant 2.0 m tall structure viewed with a compact portable obscura box.',
    params: {
      objectDistance: 5.5,
      objectHeight: 2.0,
      screenDistance: 0.35,
      objectType: 'pavilion',
    },
  },
  {
    id: 'unit-scale',
    name: '1:1 Equidistant (M = 1)',
    subtitle: 'Equal Distance Boundary',
    description: 'Object distance equals screen distance (1.0 m each), yielding identical image size.',
    params: {
      objectDistance: 1.0,
      objectHeight: 1.0,
      screenDistance: 1.0,
      objectType: 'arrow',
    },
  },
];
