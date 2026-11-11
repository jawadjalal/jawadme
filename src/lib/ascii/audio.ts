"use client";

/**
 * Audio-reactive input: `useAudioBands(source)` analyses a microphone, a
 * media element, a stream or a built-in demo synth, and keeps smoothed
 * bass, mid, treble and level values (0 to 1) on one stable object. Pass
 * that object to `AsciiShader`'s `audio` prop and fields read it as
 * `u_audio` (vec4: bass, mid, treble, level).
 *
 * The microphone needs a secure context (https or localhost). On plain
 * http `navigator.mediaDevices` is missing and status becomes
 * `"unavailable"` instead of throwing.
 */

import { useEffect, useReducer, useRef } from "react";

export type AudioStatus = "idle" | "running" | "denied" | "unavailable";

/** Where the sound comes from. `"synth"` is a silent built-in demo tone. */
export type AudioSource =
  | "mic"
  | "synth"
  | HTMLMediaElement
  | MediaStream
  | null;

/** Smoothed band levels, updated in place every animation frame. */
export interface AudioBands {
  bass: number;
  mid: number;
  treble: number;
  level: number;
  status: AudioStatus;
}

export interface AudioBandsOptions {
  /** 0 follows every beat, close to 1 drifts. Default 0.8. */
  smoothing?: number;
  /** Multiplier before clamping to 1, for quiet sources. Default 1.4. */
  gain?: number;
}

let sharedContext: AudioContext | null = null;
// A media element can feed only one MediaElementSourceNode for its lifetime.
const elementSources = new WeakMap<
  HTMLMediaElement,
  MediaElementAudioSourceNode
>();

const audioContext = (): AudioContext | null => {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") {
    return null;
  }
  sharedContext ??= new AudioContext();
  return sharedContext;
};

/**
 * A demo source that needs no permission: a slow bass pulse, a wandering
 * mid tone and hissy treble bursts, routed to the analyser only (silent).
 */
const createSynth = (context: AudioContext, into: AudioNode): (() => void) => {
  const bass = context.createOscillator();
  bass.type = "sine";
  bass.frequency.value = 55;
  const bassGain = context.createGain();
  bassGain.gain.value = 0;
  const pulse = context.createOscillator();
  pulse.frequency.value = 2;
  const pulseDepth = context.createGain();
  pulseDepth.gain.value = 0.9;
  pulse.connect(pulseDepth).connect(bassGain.gain);
  bass.connect(bassGain).connect(into);

  const mid = context.createOscillator();
  mid.type = "triangle";
  mid.frequency.value = 660;
  const wander = context.createOscillator();
  wander.frequency.value = 0.15;
  const wanderDepth = context.createGain();
  wanderDepth.gain.value = 300;
  wander.connect(wanderDepth).connect(mid.frequency);
  const midGain = context.createGain();
  midGain.gain.value = 0.25;
  mid.connect(midGain).connect(into);

  const noise = context.createBuffer(1, context.sampleRate, context.sampleRate);
  const data = noise.getChannelData(0);
  for (let index = 0; index < data.length; index += 1) {
    data[index] = Math.random() * 2 - 1;
  }
  const hiss = context.createBufferSource();
  hiss.buffer = noise;
  hiss.loop = true;
  const highpass = context.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = 6000;
  const hissGain = context.createGain();
  hissGain.gain.value = 0;
  const burst = context.createOscillator();
  burst.type = "square";
  burst.frequency.value = 4;
  const burstDepth = context.createGain();
  burstDepth.gain.value = 0.2;
  burst.connect(burstDepth).connect(hissGain.gain);
  hiss.connect(highpass).connect(hissGain).connect(into);

  const sources = [bass, pulse, mid, wander, hiss, burst];
  for (const node of sources) {
    node.start();
  }
  return () => {
    for (const node of sources) {
      node.stop();
      node.disconnect();
    }
  };
};

const NO_OPTIONS: AudioBandsOptions = {};

/**
 * Analyse `source` while mounted. Returns the same object every render; its
 * band values change every frame without re-rendering, and the component
 * re-renders only when `status` changes.
 */
export const useAudioBands = (
  source: AudioSource,
  options: AudioBandsOptions = NO_OPTIONS
): AudioBands => {
  const bandsRef = useRef<AudioBands>({
    bass: 0,
    level: 0,
    mid: 0,
    status: "idle",
    treble: 0,
  });
  const [, rerender] = useReducer((count: number) => count + 1, 0);
  const { smoothing = 0.8, gain = 1.4 } = options;

  useEffect(() => {
    const bands = bandsRef.current;
    const setStatus = (status: AudioStatus) => {
      if (bands.status !== status) {
        bands.status = status;
        rerender();
      }
    };
    bands.bass = 0;
    bands.mid = 0;
    bands.treble = 0;
    bands.level = 0;
    if (source === null) {
      setStatus("idle");
      return;
    }
    const context = audioContext();
    if (!context) {
      setStatus("unavailable");
      return;
    }

    let cancelled = false;
    let frame = 0;
    const cleanups: (() => void)[] = [];
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.5;
    const bins = new Uint8Array(analyser.frequencyBinCount);
    const hzPerBin = context.sampleRate / analyser.fftSize;
    const band = (from: number, to: number) => {
      const start = Math.max(1, Math.floor(from / hzPerBin));
      const end = Math.min(bins.length, Math.ceil(to / hzPerBin));
      let sum = 0;
      for (let index = start; index < end; index += 1) {
        sum += bins[index] ?? 0;
      }
      return Math.min(1, (sum / Math.max(1, end - start) / 255) * gain);
    };
    const tick = () => {
      frame = requestAnimationFrame(tick);
      analyser.getByteFrequencyData(bins);
      const keep = Math.min(0.99, Math.max(0, smoothing));
      const ease = (previous: number, next: number) =>
        previous * keep + next * (1 - keep);
      bands.bass = ease(bands.bass, band(20, 250));
      bands.mid = ease(bands.mid, band(250, 2000));
      bands.treble = ease(bands.treble, band(2000, 12_000));
      bands.level = ease(bands.level, band(20, 12_000));
    };
    const start = (node: AudioNode) => {
      node.connect(analyser);
      cleanups.push(() => node.disconnect(analyser));
      // Browsers start contexts suspended until a gesture; try, and retry on one.
      const resume = async () => {
        try {
          await context.resume();
        } catch {
          setStatus("unavailable");
        }
      };
      void resume();
      window.addEventListener("pointerdown", resume, { once: true });
      cleanups.push(() => window.removeEventListener("pointerdown", resume));
      setStatus("running");
      tick();
    };

    const openMic = async () => {
      const devices =
        typeof navigator === "undefined" ? undefined : navigator.mediaDevices;
      if (!devices?.getUserMedia) {
        setStatus("unavailable");
        return;
      }
      try {
        const stream = await devices.getUserMedia({ audio: true });
        const stop = () => {
          for (const track of stream.getTracks()) {
            track.stop();
          }
        };
        if (cancelled) {
          stop();
          return;
        }
        cleanups.push(stop);
        start(context.createMediaStreamSource(stream));
      } catch (error) {
        if (!cancelled) {
          const denied =
            error instanceof DOMException && error.name === "NotAllowedError";
          setStatus(denied ? "denied" : "unavailable");
        }
      }
    };

    if (source === "synth") {
      const sum = context.createGain();
      cleanups.push(createSynth(context, sum));
      start(sum);
    } else if (source === "mic") {
      openMic();
    } else if (source instanceof MediaStream) {
      start(context.createMediaStreamSource(source));
    } else {
      let node = elementSources.get(source);
      if (!node) {
        node = context.createMediaElementSource(source);
        elementSources.set(source, node);
        // A media element routed through Web Audio must still reach the speakers.
        node.connect(context.destination);
      }
      start(node);
    }

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      for (const cleanup of cleanups) {
        cleanup();
      }
      analyser.disconnect();
    };
  }, [source, smoothing, gain]);

  return bandsRef.current;
};
