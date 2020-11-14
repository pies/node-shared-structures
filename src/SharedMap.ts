const EMPTY_POS = Math.pow(2, 32) - 1;

export class SharedMap {

  private readonly buffer: SharedArrayBuffer;
  private readonly index: Uint32Array;

  constructor(
    public readonly maxItems: number,
  ) {
    const dataSize = this.maxItems * Uint32Array.BYTES_PER_ELEMENT;

    this.buffer = new SharedArrayBuffer(dataSize);
    this.index = new Uint32Array(this.buffer, 0, maxItems);

    this.clear();
  }

  public static init(obj: any): SharedMap {
    Object.setPrototypeOf(obj, SharedMap.prototype);

    return obj;
  }

  public clear(): void {
    this.index.fill(EMPTY_POS);
  }

  public set(key: number, value: number): number {
    if (!this.isValidKey(key)) {
      throw new Error(`Key out of range: ${key}`);
    }

    this.index[key] = value;

    return value;
  }

  public get(key: number): number {
    if (!this.isValidKey(key)) {
      throw new Error(`Key out of range: ${key}`);
    }

    if (!this.has(key)) {
      throw new Error(`Key not set: ${key}`);
    }

    return this.index[key];
  }

  public delete(key: number): void {
    this.index[key] = EMPTY_POS;
  }

  public has(key: number): boolean {
    return this.index[key] !== EMPTY_POS;
  }

  public toString(): string {
    return this.index.toString();
  }

  public dump(): void {
    console.log(this.toString());
  }

  private isValidKey(key: number) {
    return this.index[key] !== undefined;
  }
}
