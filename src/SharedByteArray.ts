import {SharedMap} from './SharedMap';

export class SharedByteArray implements ArrayLike<any> {

  private readonly buffer: SharedArrayBuffer;
  private readonly index: SharedMap;
  private readonly lengths: SharedMap;

  private indexHead: number = 0;
  private dataHead: number = 0;

  constructor(
    private readonly maxItems: number,
    private readonly averageBytesPerItem: number,
  ) {
    const dataSize = maxItems * averageBytesPerItem;

    if (dataSize > Number.MAX_SAFE_INTEGER) {
      throw new Error('Data size may not be larger than Number.MAX_SAFE_INTEGER');
    }

    this.index = new SharedMap(maxItems);
    this.lengths = new SharedMap(maxItems);

    this.buffer = new SharedArrayBuffer(dataSize);
  }

  public static init(obj: any): SharedByteArray {
    Object.setPrototypeOf(obj, SharedByteArray.prototype);
    (obj as SharedByteArray).hydrate();

    return obj;
  }

  public hydrate(): void {
    SharedMap.init(this.index);
    SharedMap.init(this.lengths);
  }

  public get length(): number {
    return this.indexHead;
  }

  public isFull(): boolean {
    return this.indexHead >= this.maxItems;
  }

  private getFreeSpace(): number {
    return this.buffer.byteLength - this.dataHead;
  }

  public clear(): void {
    new Uint32Array(this.buffer).fill(0);
    this.index.clear();
    this.lengths.clear();
    this.indexHead = 0;
    this.dataHead = 0;
  }

  public get(pos: number): Buffer {
    const dataPos = this.index.get(pos);
    const length = this.lengths.get(pos);

    return Buffer.from(this.buffer.slice(dataPos, dataPos + length));
  }

  public delete(pos: number): void {
    const dataPos = this.index.get(pos);
    const length = this.lengths.get(pos);

    if (dataPos + length !== this.dataHead || pos !== this.indexHead - 1) {
      throw new Error(`Could not delete item ${pos}, it's not last`);
    }

    new Uint8Array(this.buffer, dataPos, length).fill(0);
    this.dataHead -= length;
    this.indexHead -= 1;
  }

  public push(item: Buffer): number {
    if (this.getFreeSpace() < item.length) {
      throw new Error(`Not enough array space: tried to push ${item.length} bytes, ${this.getFreeSpace()} bytes left`);
    }

    if (this.isFull()) {
      throw new Error(`Not enough index space: tried to add item ${this.indexHead + 1} of ${this.indexHead}`);
    }

    const indexPos = this.indexHead;
    const dataPos = this.dataHead;

    this.index.set(indexPos, dataPos);
    this.lengths.set(indexPos, item.byteLength);

    new Uint8Array(this.buffer, dataPos, item.byteLength).set(item);

    this.indexHead++;
    this.dataHead += item.byteLength;

    return indexPos;
  }

  public toString(): string {
    return `${this.index.toString()} ${this.lengths.toString()} ${new Uint8Array(this.buffer, 0, Math.min(this.buffer.byteLength, 1000)).toString()}`;
  }

  public dump(): void {
    console.log(this.toString());
  }

  [n: number]: any;
}
