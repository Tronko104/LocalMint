// Web Audio API Synthesizer for authentic Chess.com sounds
// Completely offline, zero external asset dependencies, zero latency.

class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  // Realistic wooden piece "thock"
  public playMove() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }

  // Deeper, punchier wooden capture thump
  public playCapture() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Dual impact for capture
    const now = ctx.currentTime;
    
    // First snap
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, now);
    osc1.frequency.exponentialRampToValueAtTime(90, now + 0.06);
    gain1.gain.setValueAtTime(0.5, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.06);

    // Second thud (the taken piece hitting board)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(260, now + 0.03);
    osc2.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain2.gain.setValueAtTime(0.45, now + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.03);
    osc2.stop(now + 0.12);
  }

  // Resonant alert chord for check
  public playCheck() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const freqs = [523.25, 659.25]; // C5, E5
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    });
  }

  // Sliding castling sound (dual tap)
  public playCastle() {
    if (!this.soundEnabled) return;
    this.playMove();
    setTimeout(() => this.playMove(), 90);
  }

  // Puzzle success / victory sound
  public playSuccess() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  // Game over sound
  public playGameOver(won: boolean) {
    if (!this.soundEnabled) return;
    if (won) {
      this.playSuccess();
    } else {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = ctx.currentTime + idx * 0.12;
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    }
  }

  // Incorrect move / error
  public playError() {
    if (!this.soundEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, ctx.currentTime);
    osc.frequency.setValueAtTime(110, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  }
}

export const soundManager = new SoundManager();
