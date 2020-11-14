import * as chai from 'chai';
import {SharedMap} from '../src';

describe('SharedMap', () => {

  it('should set and get', () => {
    const map = new SharedMap(3);

    map.set(0, 0);
    map.set(1, 1);
    map.set(2, 2222222);

    chai.expect(map.get(0)).equal(0);
    chai.expect(map.get(1)).equal(1);
    chai.expect(map.get(2)).equal(2222222);
  });

  it('should manage items', () => {
    const map = new SharedMap(1);

    chai.expect(map.has(0)).equal(false);
    chai.expect(() => {
      map.get(0)
    }).to.throw();

    chai.expect(map.set(0, 1)).equal(1);
    chai.expect(map.has(0)).equal(true);
    chai.expect(map.get(0)).equal(1);

    // Test with 0 because this could actually break due to how 'unset' value is implemented.
    chai.expect(map.set(0, 0)).equal(0);
    chai.expect(map.has(0)).equal(true);
    chai.expect(map.get(0)).equal(0);

    map.delete(0);
    chai.expect(map.has(0)).equal(false);
    chai.expect(() => {
      map.get(0)
    }).to.throw();

    // Idempotent
    map.delete(0);

    map.set(0, 1);
    map.clear();

    chai.expect(map.has(0)).equal(false);
  });

});
