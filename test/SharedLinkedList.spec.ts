import * as chai from 'chai';
import {SharedLinkedList} from '../src';

describe('SharedLinkedList', () => {

  it('should push and fetch', () => {
    const list = new SharedLinkedList(5);

    list.push(0, 100);
    list.push(1, 101);
    list.push(2, 201);
    list.push(1, 102);
    list.push(1, 103);

    chai.expect(list.has(0)).to.deep.equal(true);
    chai.expect(list.has(1)).to.deep.equal(true);
    chai.expect(list.has(2)).to.deep.equal(true);
    chai.expect(list.has(3)).to.deep.equal(false);

    chai.expect(list.fetch(0)).to.deep.equal([100]);
    chai.expect(list.fetch(1)).to.deep.equal([101, 102, 103]);
    chai.expect(list.fetch(2)).to.deep.equal([201]);
    chai.expect(list.fetch(3)).to.deep.equal([]);
  });

});
