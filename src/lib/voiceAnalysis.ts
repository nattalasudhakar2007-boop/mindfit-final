// --- Pitch Detection (YIN algorithm with parabolic interpolation) ---

export function detectPitch(buffer: Float32Array, sampleRate: number): number {
  const SIZE = buffer.length;
  const halfSize = Math.floor(SIZE / 2);

  // Check signal level
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // ignore silence/background noise

  // YIN difference function
  const minLag = Math.floor(sampleRate / 500); // max 500 Hz (human voice ceiling)
  const maxLag = Math.floor(sampleRate / 70);  // min 70 Hz (human voice floor)
  const diff = new Float32Array(halfSize);

  for (let tau = 0; tau < halfSize; tau++) {
    let sum = 0;
    for (let i = 0; i < halfSize; i++) {
      const d = buffer[i] - buffer[i + tau];
      sum += d * d;
    }
    diff[tau] = sum;
  }

  // Cumulative mean normalized difference (CMND)
  const cmnd = new Float32Array(halfSize);
  cmnd[0] = 1;
  let runningSum = 0;
  for (let tau = 1; tau < halfSize; tau++) {
    runningSum += diff[tau];
    cmnd[tau] = diff[tau] / (runningSum / tau);
  }

  // Find first dip below threshold (stricter for accuracy)
  const threshold = 0.1;
  let bestTau = -1;
  for (let tau = minLag; tau < Math.min(maxLag, halfSize); tau++) {
    if (cmnd[tau] < threshold) {
      // Find local minimum
      while (tau + 1 < Math.min(maxLag, halfSize) && cmnd[tau + 1] < cmnd[tau]) tau++;
      bestTau = tau;
      break;
    }
  }

  // Reject if no clear pitch found (don't fallback — prevents noise misdetection)
  if (bestTau === -1) return -1;

  // Parabolic interpolation for sub-sample accuracy
  if (bestTau > 0 && bestTau < halfSize - 1) {
    const s0 = cmnd[bestTau - 1];
    const s1 = cmnd[bestTau];
    const s2 = cmnd[bestTau + 1];
    const denom = 2 * (s0 - 2 * s1 + s2);
    if (denom !== 0) {
      const adjustment = (s0 - s2) / denom;
      if (Math.abs(adjustment) < 1) {
        return sampleRate / (bestTau + adjustment);
      }
    }
  }

  return sampleRate / bestTau;
}

// --- Spectral Features ---

export function computeSpectralCentroid(freqData: Uint8Array, sampleRate: number, fftSize: number): number {
  let weightedSum = 0;
  let totalMagnitude = 0;
  const binWidth = sampleRate / fftSize;

  for (let i = 0; i < freqData.length; i++) {
    const magnitude = freqData[i];
    const freq = i * binWidth;
    weightedSum += magnitude * freq;
    totalMagnitude += magnitude;
  }

  return totalMagnitude > 0 ? weightedSum / totalMagnitude : 0;
}

export function computeSpectralFlux(current: Uint8Array, previous: Uint8Array | null): number {
  if (!previous) return 0;
  let flux = 0;
  for (let i = 0; i < current.length; i++) {
    const diff = current[i] - previous[i];
    if (diff > 0) flux += diff * diff;
  }
  return Math.sqrt(flux / current.length);
}

// --- Outlier Filtering ---

function filterOutliers(values: number[]): number[] {
  if (values.length < 4) return values;
  const sorted = [...values].sort((a, b) => a - b);
  const q1 = sorted[Math.floor(sorted.length * 0.25)];
  const q3 = sorted[Math.floor(sorted.length * 0.75)];
  const iqr = q3 - q1;
  const lower = q1 - 1.5 * iqr;
  const upper = q3 + 1.5 * iqr;
  return values.filter((v) => v >= lower && v <= upper);
}

// --- Statistics ---

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = mean(arr);
  return Math.sqrt(arr.reduce((sum, v) => sum + (v - avg) ** 2, 0) / arr.length);
}

// --- Mood Classification ---

export interface VoiceFeatures {
  avgPitch: number;
  pitchVariability: number;
  energy: number;
  spectralCentroid: number;
  spectralFlux: number;
  speakingRate: number;
}

interface MoodScore {
  mood: string;
  score: number;
}

export function analyzeMood(features: VoiceFeatures): { mood: string; confidence: number } {
  const { avgPitch, pitchVariability, energy, spectralCentroid, spectralFlux, speakingRate } = features;

  // Better-calibrated normalization based on speech research
  // Avg adult pitch: male ~120Hz, female ~210Hz
  const normPitch = Math.min(1, Math.max(0, (avgPitch - 80) / 220));         // 80-300 Hz
  const normVariability = Math.min(1, Math.max(0, pitchVariability / 60));    // 0-60 Hz std
  const normEnergy = Math.min(1, Math.max(0, energy / 0.12));                 // 0-0.12 RMS
  const normCentroid = Math.min(1, Math.max(0, (spectralCentroid - 300) / 2200));
  const normFlux = Math.min(1, Math.max(0, spectralFlux / 25));
  const normRate = Math.min(1, Math.max(0, speakingRate / 40));

  // Pitch level helpers
  const highPitch = normPitch > 0.6;
  const lowPitch = normPitch < 0.35;
  const highEnergy = normEnergy > 0.55;
  const lowEnergy = normEnergy < 0.3;
  const highVar = normVariability > 0.5;
  const lowVar = normVariability < 0.3;

  const scores: MoodScore[] = [
    {
      // Happy: high pitch + high variability + high energy + bright timbre
      mood: "Happy",
      score:
        normPitch * 0.3 +
        normVariability * 0.3 +
        normEnergy * 0.2 +
        normCentroid * 0.1 +
        normRate * 0.1 +
        (highPitch && highVar ? 0.15 : 0),
    },
    {
      // Sad: low pitch + low variability + low energy + slow
      mood: "Sad",
      score:
        (1 - normPitch) * 0.3 +
        (1 - normVariability) * 0.25 +
        (1 - normEnergy) * 0.25 +
        (1 - normRate) * 0.2 +
        (lowPitch && lowEnergy ? 0.15 : 0),
    },
    {
      // Stressed: elevated pitch + high flux + irregular rhythm
      mood: "Stressed",
      score:
        normPitch * 0.2 +
        normFlux * 0.3 +
        normEnergy * 0.2 +
        normVariability * 0.15 +
        normRate * 0.15,
    },
    {
      // Angry: high energy + high pitch + sharp spectral content + high flux
      mood: "Angry",
      score:
        normEnergy * 0.4 +
        normPitch * 0.2 +
        normCentroid * 0.2 +
        normFlux * 0.2 +
        (highEnergy && highPitch ? 0.2 : 0),
    },
    {
      // Calm: moderate-low pitch + low variability + low flux + low energy
      mood: "Calm",
      score:
        (1 - Math.abs(normPitch - 0.4) * 2) * 0.2 +
        (1 - normVariability) * 0.3 +
        (1 - normEnergy) * 0.2 +
        (1 - normFlux) * 0.3,
    },
    {
      // Burnt Out: very low energy + very low variability + slow speech
      mood: "Burnt Out",
      score:
        (1 - normEnergy) * 0.4 +
        (1 - normVariability) * 0.25 +
        (1 - normRate) * 0.25 +
        (1 - normFlux) * 0.1 +
        (lowEnergy && lowVar ? 0.2 : 0),
    },
    {
      // Neutral: all features near middle
      mood: "Neutral",
      score:
        (1 - Math.abs(normPitch - 0.5) * 2) * 0.25 +
        (1 - Math.abs(normVariability - 0.4) * 2) * 0.25 +
        (1 - Math.abs(normEnergy - 0.4) * 2) * 0.25 +
        (1 - Math.abs(normRate - 0.5) * 2) * 0.25,
    },
  ];

  scores.sort((a, b) => b.score - a.score);
  const best = scores[0];
  const second = scores[1];

  const margin = best.score - second.score;
  const confidence = Math.min(0.95, 0.45 + margin * 2.5 + best.score * 0.15);

  return { mood: best.mood, confidence: Math.max(0.4, confidence) };
}

// --- Aggregate Analysis ---

export function analyzeVoiceData(
  pitchSamples: number[],
  energySamples: number[],
  spectralCentroids: number[],
  spectralFluxes: number[],
  durationSeconds: number
): { features: VoiceFeatures; mood: string; confidence: number } | null {
  const cleanPitches = filterOutliers(pitchSamples);

  // Require enough valid samples for reliable analysis
  if (cleanPitches.length < 15 || durationSeconds < 2) return null;

  // Filter only "active" energy samples (when user was actually speaking)
  const activeEnergy = energySamples.filter((e) => e > 0.01);
  if (activeEnergy.length < 10) return null;

  const features: VoiceFeatures = {
    avgPitch: mean(cleanPitches),
    pitchVariability: stdDev(cleanPitches),
    energy: mean(activeEnergy),
    spectralCentroid: mean(spectralCentroids),
    spectralFlux: mean(spectralFluxes),
    speakingRate: durationSeconds > 0 ? cleanPitches.length / durationSeconds : 0,
  };

  const { mood, confidence } = analyzeMood(features);
  return { features, mood, confidence };
}
