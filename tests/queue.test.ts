import { Queue, Track } from '../src/index';

describe('Queue', () => {
  let queue: Queue;

  beforeEach(() => {
    queue = new Queue();
  });

  test('should add track', () => {
    const track = new Track('test.mp3');
    queue.add(track);
    expect(queue.size()).toBe(1);
  });

  test('should remove track', () => {
    const track = new Track('test.mp3');
    queue.add(track);
    const removed = queue.remove(0);
    expect(removed).toBeDefined();
    expect(queue.size()).toBe(0);
  });

  test('should shuffle queue', () => {
    const tracks = [
      new Track('track1.mp3'),
      new Track('track2.mp3'),
      new Track('track3.mp3')
    ];
    queue.add(tracks);
    queue.shuffle();
    const shuffled = queue.getTracks();
    expect(shuffled).toHaveLength(3);
  });
});
