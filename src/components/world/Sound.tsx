"use client";

import { useEffect, useRef, useState } from "react";

// The world's sound, off until asked for: the river (brown noise under a low-pass), the braziers (a sparse crackle) and
// a low drone, all made here with WebAudio, so there is nothing to download.

function build() {
  const ac = new AudioContext();
  const out = ac.createGain();
  out.gain.value = 0;
  out.connect(ac.destination);
  const loop = (sec: number, fill: (d: Float32Array) => void) => {
    const b = ac.createBuffer(1, ac.sampleRate * sec, ac.sampleRate);
    fill(b.getChannelData(0));
    const s = ac.createBufferSource();
    s.buffer = b;
    s.loop = true;
    return s;
  };
  const water = loop(6, (d) => {
    let l = 0;
    for (let i = 0; i < d.length; i++) d[i] = (l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02) * 3.2;
  });
  const lp = new BiquadFilterNode(ac, { type: "lowpass", frequency: 420 });
  water.connect(lp).connect(new GainNode(ac, { gain: 0.4 })).connect(out);
  const fire = loop(5, (d) => {
    for (let i = 0; i < d.length; i++) {
      if (Math.random() > 0.0006) continue;
      const a = Math.random() * 0.8;
      for (let j = 0; j < 220 && i + j < d.length; j++) d[i + j] += (Math.random() * 2 - 1) * a * Math.exp(-j / 40);
    }
  });
  fire.connect(new BiquadFilterNode(ac, { type: "bandpass", frequency: 2400, Q: 0.7 })).connect(new GainNode(ac, { gain: 0.3 })).connect(out);
  const drone = new GainNode(ac, { gain: 0.05 });
  drone.connect(out);
  const lfo = new OscillatorNode(ac, { frequency: 0.08 });
  lfo.connect(new GainNode(ac, { gain: 0.025 })).connect(drone.gain);
  const oscs = [55, 82.4].map((f) => new OscillatorNode(ac, { frequency: f }));
  oscs.forEach((o) => o.connect(drone));
  [water, fire, lfo, ...oscs].forEach((s) => s.start());
  return { ac, out };
}

export function Sound() {
  const [on, setOn] = useState(false);
  const a = useRef<ReturnType<typeof build> | null>(null);
  useEffect(() => () => void a.current?.ac.close(), []);
  const flip = () => {
    const s = (a.current ??= build());
    const t = s.ac.currentTime;
    if (!on) void s.ac.resume();
    s.out.gain.cancelScheduledValues(t);
    s.out.gain.setTargetAtTime(on ? 0 : 0.9, t, on ? 0.2 : 0.5);
    setOn(!on);
  };
  return (
    <button type="button" className="w-sound" aria-pressed={on} onClick={flip}>
      <span className="w-sound-i" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {on ? "the river is playing" : "hear the river"}
    </button>
  );
}
