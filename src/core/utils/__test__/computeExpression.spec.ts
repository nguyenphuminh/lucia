import compute from '../computeExpression';

describe('.compute', () => {
  it('should use key-based retrieval during computation', () => {
    const el = document.createElement('div');
    const callback = jest.fn();
    expect(compute('count', el)({ count: 0 })).toEqual(0);
    expect(compute('count[0]', el)({ count: [0] })).toEqual(0);
    compute('foo()', el)({ foo: callback });
    expect(callback).toBeCalledTimes(1);
  });

  it('should compute correctly', () => {
    const el = document.createElement('div');
    expect(compute('count + 1', el)({ count: 0 })).toEqual(1);
  });

  it('should not return the value', () => {
    const el = document.createElement('div');
    expect(compute('count + 1', el, false)({ count: 0 })).toEqual(undefined);
  });
});