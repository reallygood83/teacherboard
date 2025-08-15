// Sound manager for timer alerts and notifications
// Optimized for both teachers and students

export class SoundManager {
  private static instance: SoundManager;
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isEnabled: boolean = true;
  private volume: number = 0.7;

  private constructor() {
    // Initialize audio context on first user interaction
    this.initializeAudioContext();
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  private async initializeAudioContext() {
    try {
      // Create audio context with user gesture requirement
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      
      // Resume context on user interaction (required by browsers)
      document.addEventListener('click', this.resumeAudioContext.bind(this), { once: true });
      document.addEventListener('touchstart', this.resumeAudioContext.bind(this), { once: true });
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  private async resumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
  }

  // Create beep sound programmatically (fallback)
  private createBeepSound(frequency: number = 800, duration: number = 0.3): AudioBuffer | null {
    if (!this.audioContext) return null;

    const sampleRate = this.audioContext.sampleRate;
    const numSamples = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
    const channelData = buffer.getChannelData(0);

    // Generate beep tone
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const envelope = Math.exp(-t * 3); // Fade out
      channelData[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
    }

    return buffer;
  }

  // Load sound from URL
  async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('Audio context not available');
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds.set(name, audioBuffer);
    } catch (error) {
      console.warn(`Failed to load sound ${name}:`, error);
      // Create fallback beep sound
      const beep = this.createBeepSound();
      if (beep) {
        this.sounds.set(name, beep);
      }
    }
  }

  // Play sound by name
  async playSound(name: string, options: { volume?: number; loop?: boolean } = {}): Promise<void> {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    const buffer = this.sounds.get(name);
    if (!buffer) {
      console.warn(`Sound ${name} not loaded`);
      // Play fallback beep
      await this.playBeep();
      return;
    }

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();
      
      source.buffer = buffer;
      source.loop = options.loop || false;
      
      gainNode.gain.value = (options.volume || this.volume) * this.volume;
      
      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      source.start();
    } catch (error) {
      console.warn(`Failed to play sound ${name}:`, error);
    }
  }

  // Play programmatic beep (always works)
  async playBeep(frequency: number = 800, duration: number = 0.3): Promise<void> {
    if (!this.isEnabled || !this.audioContext) {
      return;
    }

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play beep:', error);
    }
  }

  // Timer-specific sounds
  async playTimerComplete(): Promise<void> {
    // Try to play loaded sound first, fallback to beep sequence
    if (this.sounds.has('timer-complete')) {
      await this.playSound('timer-complete');
    } else {
      // Play triple beep sequence for timer completion
      await this.playBeep(800, 0.2);
      setTimeout(() => this.playBeep(800, 0.2), 300);
      setTimeout(() => this.playBeep(1000, 0.4), 600);
    }
  }

  async playTimerWarning(): Promise<void> {
    // Play warning beep (lower frequency)
    await this.playBeep(600, 0.15);
  }

  async playTimerTick(): Promise<void> {
    // Subtle tick sound
    await this.playBeep(1200, 0.05);
  }

  // Volume and settings
  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('timer-sound-volume', volume.toString());
  }

  getVolume(): number {
    return this.volume;
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('timer-sound-enabled', enabled.toString());
  }

  isEnabledSound(): boolean {
    return this.isEnabled;
  }

  // Load settings from localStorage
  loadSettings(): void {
    const savedVolume = localStorage.getItem('timer-sound-volume');
    if (savedVolume) {
      this.volume = parseFloat(savedVolume);
    }

    const savedEnabled = localStorage.getItem('timer-sound-enabled');
    if (savedEnabled) {
      this.isEnabled = savedEnabled === 'true';
    }
  }

  // Initialize all timer sounds
  async initializeTimerSounds(): Promise<void> {
    // Load timer completion sound
    await this.loadSound('timer-complete', '/sounds/timer-complete.wav');
    
    // Load settings
    this.loadSettings();
    
    console.log('Timer sounds initialized');
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();

// Utility functions for easy access
export const timerSounds = {
  complete: () => soundManager.playTimerComplete(),
  warning: () => soundManager.playTimerWarning(),
  tick: () => soundManager.playTimerTick(),
  
  setVolume: (volume: number) => soundManager.setVolume(volume),
  setEnabled: (enabled: boolean) => soundManager.setEnabled(enabled),
  
  getVolume: () => soundManager.getVolume(),
  isEnabled: () => soundManager.isEnabledSound(),
};