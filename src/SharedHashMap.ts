import murmurhash = require('murmurhash');
import {SharedByteArray, SharedLinkedList, SharedMap} from '.';

export class SharedHashMap {

  private readonly map: SharedLinkedList;
  private readonly index: SharedMap;
  private readonly keys: SharedByteArray;
  private readonly items: SharedByteArray;

  constructor(
    private readonly maxItems: number,
    private readonly averageKeySize: number,
    private readonly averageItemSize: number,
    private readonly keyEncoding: BufferEncoding = 'utf8',
  ) {
    this.map = new SharedLinkedList(maxItems);
    this.index = new SharedMap(maxItems);
    this.keys = new SharedByteArray(maxItems, averageKeySize);
    this.items = new SharedByteArray(maxItems, averageItemSize);
  }

  public static init(obj: any): SharedHashMap {
    Object.setPrototypeOf(obj, SharedHashMap.prototype);
    obj.hydrate();

    return obj;
  }

  public hydrate(): void {
    SharedLinkedList.init(this.map);
    SharedMap.init(this.index);
    SharedByteArray.init(this.keys);
    SharedByteArray.init(this.items);
  }

  public get length(): number {
    return this.keys.length;
  }

  public clear(): void {
    this.map.clear();
    this.index.clear();
    this.keys.clear();
    this.items.clear();
  }

  public has(key: string): boolean {
    const hash = this.getHash(key);
    const keyBuffer = Buffer.from(key, this.keyEncoding);

    return this.getExistingKeyPos(keyBuffer, hash) !== undefined;
  }

  public get(key: string): Buffer {
    const value = this.tryGet(key);

    if (value === undefined) {
      throw new Error(`Key not set: ${key}`);
    }

    return value;
  }

  public tryGet(key: string): Buffer | undefined {
    const hash = this.getHash(key);
    const keyBuffer = Buffer.from(key, this.keyEncoding);

    const keyPos = this.getExistingKeyPos(keyBuffer, hash);

    if (keyPos === undefined) {
      return undefined;
    }

    const itemPos = this.index.get(keyPos);

    return this.items.get(itemPos);
  }

  public set(key: string, item: Buffer): number {
    const hash = this.getHash(key);
    const keyBuffer = Buffer.from(key, this.keyEncoding);

    let keyPos = this.getExistingKeyPos(keyBuffer, hash);
    let itemPos: number;

    if (keyPos === undefined) {
      if (this.keys.isFull()) {
        throw new Error(`Hash map is full`);
      }

      keyPos = this.getNewKeyPos(keyBuffer, hash);
    } else {
      this.items.delete(this.index.get(keyPos));
    }

    itemPos = this.items.push(item);
    this.index.set(keyPos, itemPos);

    return keyPos;
  }

  public dump(): void {
    console.log('map', this.map.toString());
    console.log('index', this.index.toString());
    console.log('keys', this.keys.toString());
    console.log('items', this.items.toString());
  }

  private getExistingKeyPos(key: Buffer, hash: number): number | undefined {
    return this.map.fetch(hash).find(potential => this.keys.get(potential).equals(key));
  }

  private getNewKeyPos(key: Buffer, hash: number): number {
    const newPos = this.keys.push(key);
    this.map.push(hash, newPos);

    return newPos;
  }

  private getHash(key: string): number {
    return murmurhash(key) % this.maxItems;
  }
}
