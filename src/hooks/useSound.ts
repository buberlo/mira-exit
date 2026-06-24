import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSoundPreference,
  setSoundPreference,
} from "../game/storage";
import {
  isSoundSupported,
  playSound,
  resumeAudio,
  type SoundEvent,
} from "../game/sound";
import type { ConnectionStatus, Speaker } from "../game/types";

export function useSound() {
  const [supported] = useState<boolean>(() => isSoundSupported());
  const [enabled, setEnabled] = useState<boolean>(() => getSoundPreference());
  const enabledRef = useRef<boolean>(enabled);
  enabledRef.current = enabled;

  useEffect(() => {
    setEnabled(getSoundPreference());
  }, []);

  const enable = useCallback(() => {
    resumeAudio();
    setSoundPreference(true);
    setEnabled(true);
  }, []);

  const disable = useCallback(() => {
    setSoundPreference(false);
    setEnabled(false);
  }, []);

  const play = useCallback(
    (event: SoundEvent, speaker?: Speaker, status?: ConnectionStatus) => {
      if (!enabledRef.current || !supported) return;
      playSound(event, speaker, status);
    },
    [supported],
  );

  return { supported, enabled, enable, disable, play };
}
