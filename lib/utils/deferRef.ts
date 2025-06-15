import pDefer from 'p-defer'
import d from 'debug'

const debug = d('lib:deferRef')

export class DeferRef<T> {
  private _promise = pDefer<T>()
  public get promise() {
    return this._promise.promise
  }
  public value?: T
  public onRef = (element?: Element) => {
    debug('onRef called with %o', element)
    this.value = element as T
    if (element) this._promise.resolve(element as T)
    else this._promise = pDefer()
  }
}

export function deferRef<T>() {
  return new DeferRef<T>()
}
