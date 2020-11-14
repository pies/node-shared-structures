import * as chai from 'chai';
import {SharedByteArray} from '../src';

describe('SharedByteArray', () => {

  it('should push and get', () => {
    const array = new SharedByteArray(3, 5);

    const indexA = array.push(Buffer.from('A', 'ascii'));
    const indexB = array.push(Buffer.from('BB', 'utf8'));
    const indexC = array.push(Buffer.from('CCC', 'utf16le'));

    chai.expect(array.get(indexA).toString('ascii')).to.deep.equal('A');
    chai.expect(array.get(indexB).toString('utf8')).to.deep.equal('BB');
    chai.expect(array .get(indexC).toString('utf16le')).to.deep.equal('CCC');


  });

  it('should enforce limits', () => {
    const oneCharArray = new SharedByteArray(1, 1);
    chai.expect(() => {
      oneCharArray.push(Buffer.from('12', 'ascii'))
    }).to.throw();

    const oneItemArray = new SharedByteArray(1, 10);
    chai.expect(oneItemArray.isFull()).to.equal(false);

    oneItemArray.push(Buffer.from('1', 'ascii'));
    chai.expect(oneItemArray.isFull()).to.equal(true);

    chai.expect(() => {
      oneItemArray.push(Buffer.from('2', 'ascii'));
    }).to.throw();
  });

});
