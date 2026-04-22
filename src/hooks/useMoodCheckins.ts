import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { MoodData } from "@/components/dashboard/MoodCheckIn";
import type { Tables } from "@/integrations/supabase/types";

type MoodCheckinRow = Tables<"mood_checkins">;

export interface MoodCheckin extends Omit<MoodCheckinRow, "reasons"> {
  reasons: string[];
}

const moodWeights: Record<string, number> = {
  Happy: 1, Calm: 2, Neutral: 4, Stressed: 7, Sad: 6, Angry: 8, "Burnt Out": 9,
};

function calcStress(d: MoodData): number {
  const m = (moodWeights[d.mood] ?? 5) / 10;
  const f = (10 - d.focusScore) / 10;
  const e = (10 - d.energyScore) / 10;
  const sh = (8 - Math.min(d.sleepHours, 8)) / 8;
  const sq = (5 - d.sleepQuality) / 5;
  const raw = (m * 0.3 + f * 0.2 + e * 0.15 + sh * 0.2 + sq * 0.15) * 10;
  return Math.max(1, Math.min(10, Math.round(raw * 10) / 10));
}

export function useMoodCheckins() {
  const [checkins, setCheckins] = useState<MoodCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCheckin, setTodayCheckin] = useState<MoodCheckin | null>(null);
  const [streak, setStreak] = useState(0);

  const normalizeCheckin = useCallback((checkin: MoodCheckinRow): MoodCheckin => ({
    ...checkin,
    reasons: checkin.reasons ?? [],
  }), []);

  const fetchCheckins = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("mood_checkins")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && data) {
      const normalizedCheckins = data.map(normalizeCheckin);
      setCheckins(normalizedCheckins);

      // Check if there's a check-in today
      const today = new Date().toDateString();
      const todayEntry = normalizedCheckins.find(
        (checkin) => new Date(checkin.created_at).toDateString() === today
      );
      setTodayCheckin(todayEntry ?? null);

      // Calculate streak
      let streakCount = 0;
      const now = new Date();
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(checkDate.getDate() - i);
        const dateStr = checkDate.toDateString();
        const hasCheckin = normalizedCheckins.some(
          (checkin) => new Date(checkin.created_at).toDateString() === dateStr
        );
        if (hasCheckin) {
          streakCount++;
        } else if (i > 0) {
          break;
        }
      }
      setStreak(streakCount);
    }
    setLoading(false);
  }, [normalizeCheckin]);

  useEffect(() => {
    fetchCheckins();
  }, [fetchCheckins]);

  const saveCheckin = useCallback(async (moodData: MoodData, voiceMood?: string, voiceConfidence?: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const stress = calcStress(moodData);

    const { data, error } = await supabase
      .from("mood_checkins")
      .insert({
        user_id: user.id,
        mood: moodData.mood,
        intensity: moodData.intensity,
        reasons: moodData.reasons,
        focus_score: moodData.focusScore,
        energy_score: moodData.energyScore,
        sleep_hours: moodData.sleepHours,
        sleep_quality: moodData.sleepQuality,
        stress_score: stress,
        voice_mood: voiceMood || null,
        voice_confidence: voiceConfidence || null,
      })
      .select()
      .single();

    if (!error && data) {
      await fetchCheckins();
      return normalizeCheckin(data);
    }
    return null;
  }, [fetchCheckins, normalizeCheckin]);

  const getWeeklyData = useCallback(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const dayCheckins = checkins.filter(
        (c) => new Date(c.created_at).toDateString() === dateStr
      );

      if (dayCheckins.length > 0) {
        const latest = dayCheckins[0];
        const moodScore = 10 - (moodWeights[latest.mood] ?? 5);
        result.push({
          day: days[date.getDay()],
          mood: moodScore,
          stress: latest.stress_score ?? 0,
          sleep: latest.sleep_hours,
          focus: latest.focus_score,
        });
      } else {
        result.push({
          day: days[date.getDay()],
          mood: null,
          stress: null,
          sleep: null,
          focus: null,
        });
      }
    }
    return result;
  }, [checkins]);

  return { checkins, loading, todayCheckin, streak, saveCheckin, getWeeklyData, fetchCheckins };
}
