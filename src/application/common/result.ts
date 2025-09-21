export class Result<T, E = Error> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  public static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  public static fail<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public getValue(): T {
    if (this._isSuccess && this._value !== undefined) {
      return this._value;
    }
    throw new Error('Cannot get value from failed result');
  }

  public getError(): E {
    if (!this._isSuccess && this._error !== undefined) {
      return this._error;
    }
    throw new Error('Cannot get error from successful result');
  }

  public match<U>(onSuccess: (value: T) => U, onFailure: (error: E) => U): U {
    if (this._isSuccess && this._value !== undefined) {
      return onSuccess(this._value);
    }
    if (!this._isSuccess && this._error !== undefined) {
      return onFailure(this._error);
    }
    throw new Error('Invalid result state');
  }
}
