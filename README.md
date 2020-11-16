# node-shared-structures
Implementation of a few basic data structures on top of SharedArrayBuffer for Node.js

The structures are **not thread safe** and are constant-size (although the latter is intended to change).

Currently implemented:

 - simple map (number => number)
 - linked list (number => number[])
 - variable size value array (number => Buffer)
 - hash map (string => Buffer)

The intended use case is when you have a bunch of simple, read-only data you want to share with Worker threads so that they don't have to have their own copies.

Performance of reading by key from the hashmap is basically O(1), i.e. doesn't depend on the size of the dataset.

Usage example:

```
const rows = 10;
const averageKeySize = 5; // bytes
const averageValueSize = 30; // bytes
const keyEncoding = "ascii";

const map = new SharedHashMap(rows, averageKeySize, averageValueSize, keyEncopding);

map.set("orange", Buffer.from("Oranges are pretty sweet."));
map.set("kiwi", Buffer.from  ("Kiwis should get a haircut."));

console.log(map.get("orange")); prints "Oranges are pretty sweet."
console.log(map.tryGet("banana")); // prints "undefined"
console.log(map.get("plum")); // Throws an exception
```
