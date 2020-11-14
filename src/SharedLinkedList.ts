const DATA_START_OFFSET = 0;
const EMPTY_POS = 0;

export class SharedLinkedList {

  private readonly buffer: SharedArrayBuffer;
  private readonly index: Uint32Array;
  private readonly data: Uint32Array;
  private readonly links: Uint32Array;
  private head: number = DATA_START_OFFSET;

  constructor(
    public readonly size: number,
  ) {
    const bytesPerColumn = this.size * Uint32Array.BYTES_PER_ELEMENT;

    this.buffer = new SharedArrayBuffer(bytesPerColumn * 3);
    this.index = new Uint32Array(this.buffer, 0, size);
    this.data = new Uint32Array(this.buffer, bytesPerColumn, size);
    this.links = new Uint32Array(this.buffer, bytesPerColumn * 2, size);
  }

  public static init(obj: any): SharedLinkedList {
    Object.setPrototypeOf(obj, SharedLinkedList.prototype);

    return obj;
  }

  public clear(): void {
    new Uint8Array(this.buffer).fill(EMPTY_POS);
    this.head = DATA_START_OFFSET;
  }

  public delete(key: number): void {
    this.index[key] = EMPTY_POS;
  }

  public push(key: number, value: number): number {
    if (this.head >= this.size) {
      throw new Error(`Linked list is full`);
    }

    const pos = this.head;
    const last = this.findLast(key);

    if (last === undefined) {
      this.index[key] = pos + 1;
    } else {
      this.links[last] = pos;
    }

    this.data[pos] = value;
    this.head++;

    return pos;
  }

  public fetch(key: number): number[] {
    if (!this.isValidKey(key)) {
      throw new Error(`Key out of range: ${key}`);
    }

    if (!this.has(key)) {
      return [];
    }

    const out: number[] = [];

    let pos = this.index[key] - 1;
    out.push(this.data[pos]);

    while (this.links[pos] !== EMPTY_POS) {
      pos = this.links[pos];
      out.push(this.data[pos]);
    }

    return out;
  }

  public has(key: number): boolean {
    return this.index[key] !== EMPTY_POS;
  }

  public toString(): string {
    return `${this.index.toString()} ${this.links.toString()} ${this.data.toString()}`;
  }

  public dump(): void {
    console.log(this.toString());
  }

  private isValidKey(key: number) {
    return this.index[key] !== undefined;
  }

  private findLast(key: number): number | undefined {
    if (!this.isValidKey(key)) {
      throw new Error(`Key out of range: ${key}`);
    }

    if (!this.has(key)) {
      return undefined;
    }

    let pos = this.index[key] - 1;
    let next = this.links[pos];

    while (next !== EMPTY_POS) {
      pos = next;
      next = this.links[next];
    }

    return pos;
  }
}
