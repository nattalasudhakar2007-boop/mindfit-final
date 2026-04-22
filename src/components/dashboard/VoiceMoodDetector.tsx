import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, AudioWaveform, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  detectPitch,
  computeSpectralCentroid,
  computeSpectralFlux,
  analyzeVoiceData,
} from "@/lib/voiceAnalysis";

export interface VoiceMoodResult {
  suggestedMood: string;
  avgPitch: number;
  pitchVariability: number;
  energy: number;
  confidence: number;
}

interface Props {
  onResult: (result: VoiceMoodResult) => void;
}

export function VoiceMoodDetector({ onResult }: Props) {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<VoiceMoodResult | null>(null);
  const [level, setLevel] = useState(0);
  const [error, setError] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const pitchSamplesRef = useRef<number[]>([]);
  const energySamplesRef = useRef<number[]>([]);
  const centroidSamplesRef = useRef<number[]>([]);
  const fluxSamplesRef = useRef<number[]>([]);
  const prevFreqDataRef = useRef<Uint8Array | null>(null);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const autoStopTimeoutRef = useRef<number | null>(null);

  const collectSamples = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;

    const analyser = analyserRef.current;
    const sampleRate = audioContextRef.current.sampleRate;
    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);

    // RMS energy
    let rms = 0;
    for (let i = 0; i < buffer.length; i++) rms += buffer[i] * buffer[i];
    rms = Math.sqrt(rms / buffer.length);
    energySamplesRef.current.push(rms);
    setLevel(Math.min(1, rms * 10));

    // Pitch (YIN-based)
    const pitch = detectPitch(buffer, sampleRate);
    if (pitch > 60 && pitch < 500) {
      pitchSamplesRef.current.push(pitch);
    }

    // Spectral features
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqData);

    centroidSamplesRef.current.push(
      computeSpectralCentroid(freqData, sampleRate, analyser.fftSize)
    );
    fluxSamplesRef.current.push(
      computeSpectralFlux(freqData, prevFreqDataRef.current)
    );
    prevFreqDataRef.current = new Uint8Array(freqData);

    rafRef.current = requestAnimationFrame(collectSamples);
  }, []);

  const stopRecording = useCallback(() => {
    if (autoStopTimeoutRef.current !== null) {
      window.clearTimeout(autoStopTimeoutRef.current);
      autoStopTimeoutRef.current = null;
    }

    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioContextRef.current?.close();
    streamRef.current = null;
    analyserRef.current = null;
    audioContextRef.current = null;
    setIsRecording(false);
    setLevel(0);

    setIsAnalyzing(true);

    const durationSeconds = (Date.now() - startTimeRef.current) / 1000;

    const analysisResult = analyzeVoiceData(
      pitchSamplesRef.current,
      energySamplesRef.current,
      centroidSamplesRef.current,
      fluxSamplesRef.current,
      durationSeconds
    );

    if (!analysisResult) {
      setError("Not enough clear speech detected. Please speak continuously for at least 5 seconds in a quiet environment.");
      setIsAnalyzing(false);
      return;
    }

    const voiceResult: VoiceMoodResult = {
      suggestedMood: analysisResult.mood,
      avgPitch: Math.round(analysisResult.features.avgPitch),
      pitchVariability: Math.round(analysisResult.features.pitchVariability),
      energy: Math.round(analysisResult.features.energy * 1000) / 1000,
      confidence: analysisResult.confidence,
    };

    setResult(voiceResult);
    setIsAnalyzing(false);
    onResult(voiceResult);
  }, [onResult]);

  const startRecording = useCallback(async () => {
    setError("");
    setResult(null);
    pitchSamplesRef.current = [];
    energySamplesRef.current = [];
    centroidSamplesRef.current = [];
    fluxSamplesRef.current = [];
    prevFreqDataRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 4096; // larger FFT for better frequency resolution
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      startTimeRef.current = Date.now();
      setIsRecording(true);
      rafRef.current = requestAnimationFrame(collectSamples);

      // Auto-stop after 10 seconds for more accurate analysis
      autoStopTimeoutRef.current = window.setTimeout(() => {
        if (streamRef.current) {
          stopRecording();
        }
      }, 10000);
    } catch {
      setError("Microphone access is required for voice mood detection.");
    }
  }, [collectSamples, stopRecording]);

  const moodEmojis: Record<string, string> = {
    Happy: "😊", Calm: "😌", Neutral: "😐",
    Stressed: "😰", Sad: "😢", Angry: "😠", "Burnt Out": "🔥",
  };

  return (
    <Card className="rounded-2xl glass-card border-dashed border-primary/30">
      <CardContent className="pt-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <AudioWaveform className="h-5 w-5 text-primary" />
          <h3 className="text-sm font-heading font-semibold">Voice Mood Detection</h3>
          <Badge variant="outline" className="text-[10px]">BETA</Badge>
        </div>

        <p className="text-xs text-muted-foreground">
          Speak naturally and continuously for 6-10 seconds in a quiet space. Try saying how your day went for best accuracy.
        </p>

        {/* Recording visualizer */}
        {isRecording && (
          <div className="flex items-center justify-center gap-1 h-12">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full transition-all duration-75"
                style={{
                  height: `${Math.max(4, level * 48 * (0.5 + 0.5 * Math.sin(Date.now() / 100 + i)))}px`,
                }}
              />
            ))}
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-center">
          {isAnalyzing ? (
            <Button disabled className="gap-2">
              <Loader2 className="h-4 w-4 animate-spin" /> Analyzing voice patterns...
            </Button>
          ) : isRecording ? (
            <Button onClick={stopRecording} variant="destructive" className="gap-2">
              <MicOff className="h-4 w-4" /> Stop Recording
            </Button>
          ) : (
            <Button onClick={startRecording} variant="outline" className="gap-2 border-primary/50 hover:bg-primary/10">
              <Mic className="h-4 w-4" /> Start Voice Analysis
            </Button>
          )}
        </div>

        {error && <p className="text-xs text-destructive text-center">{error}</p>}

        {/* Result */}
        {result && (
          <div className="rounded-xl bg-muted/50 p-4 space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">{moodEmojis[result.suggestedMood] ?? "😐"}</span>
                <div>
                  <p className="font-heading font-semibold text-sm">{result.suggestedMood}</p>
                  <p className="text-[10px] text-muted-foreground">
                    Confidence: {Math.round(result.confidence * 100)}%
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="text-[10px]">Voice Detected</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-background p-2">
                <p className="text-xs text-muted-foreground">Avg Pitch</p>
                <p className="text-sm font-semibold">{result.avgPitch} Hz</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-xs text-muted-foreground">Variability</p>
                <p className="text-sm font-semibold">{result.pitchVariability} Hz</p>
              </div>
              <div className="rounded-lg bg-background p-2">
                <p className="text-xs text-muted-foreground">Energy</p>
                <p className="text-sm font-semibold">{result.energy}</p>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground text-center italic">
              This suggestion has been applied to your mood selection above. Feel free to adjust if it doesn't feel right.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
