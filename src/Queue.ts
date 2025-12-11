export interface Track {
  id: string;
  title: string;
  url: string;
  duration?: number;
}

export class Queue {
  private tracks: Track[] = [];
  private currentIndex: number = -1;

  add(track: Track): void {
    this.tracks.push(track);
  }

  addMultiple(tracks: Track[]): void {
    this.tracks.push(...tracks);
  }

  remove(index: number): Track | null {
    if (index >= 0 && index < this.tracks.length) {
      return this.tracks.splice(index, 1)[0];
    }
    return null;
  }

  shuffle(): void {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
    this.currentIndex = -1; // Reset current index
  }

  clear(): void {
    this.tracks = [];
    this.currentIndex = -1;
  }

  jump(index: number): Track | null {
    if (index >= 0 && index < this.tracks.length) {
      this.currentIndex = index;
      return this.tracks[index];
    }
    return null;
  }

  getCurrent(): Track | null {
    return this.currentIndex >= 0 ? this.tracks[this.currentIndex] : null;
  }

  next(): Track | null {
    if (this.currentIndex < this.tracks.length - 1) {
      this.currentIndex++;
      return this.tracks[this.currentIndex];
    }
    return null;
  }

  previous(): Track | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.tracks[this.currentIndex];
    }
    return null;
  }

  getTracks(): Track[] {
    return [...this.tracks];
  }

  get size(): number {
    return this.tracks.length;
  }
}