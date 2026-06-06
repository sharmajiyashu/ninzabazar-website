export class AudioPlayer {
  private static instance: AudioPlayer;
  private audio: HTMLAudioElement | null = null;
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.audio = new Audio();
    }
  }

  public static getInstance(): AudioPlayer {
    if (!AudioPlayer.instance) {
      AudioPlayer.instance = new AudioPlayer();
    }
    return AudioPlayer.instance;
  }

  public play(soundUrl: string): void {
    if (!this.audio || !this.enabled) return;
    
    try {
      this.audio.src = soundUrl;
      this.audio.currentTime = 0;
      
      // Play the sound (note: might be blocked by browsers without user interaction)
      const playPromise = this.audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Audio playback was prevented:', error);
        });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  }

  public toggleSound(enabled: boolean): void {
    this.enabled = enabled;
  }
}