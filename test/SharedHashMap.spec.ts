import * as chai from 'chai';
import {SharedHashMap} from '../src';

describe('SharedHashMap', () => {

  it('should set and get', () => {
    const map = new SharedHashMap(3, 2, 6);

    map.set('A', Buffer.from('AAA', 'ascii'));
    map.set('B', Buffer.from('BBB', 'utf8'));
    // Hash of C conflicts with A, should still work.
    map.set('C', Buffer.from('ĆĆĆ', 'utf16le'));

    chai.expect(map.get('A').toString('ascii')).to.deep.equal('AAA');
    chai.expect(map.get('B').toString('utf8')).to.deep.equal('BBB');
    chai.expect(map.get('C').toString('utf16le')).to.deep.equal('ĆĆĆ');
  });

  it('enforces limits', () => {
    const oneItemMap = new SharedHashMap(1, 1, 3);
    oneItemMap.set('A', Buffer.from('AAA', 'ascii'));

    // Second set to same key should be fine
    oneItemMap.set('A', Buffer.from('AAA', 'ascii'));

    chai.expect(() => {
      oneItemMap.set('B', Buffer.from('BBB', 'ascii'));
    }).to.throw();
  });

});
