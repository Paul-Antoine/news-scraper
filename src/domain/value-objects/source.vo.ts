export class Source {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Source {
    if (!value || value.trim().length === 0) {
      throw new Error('Source cannot be empty');
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > 100) {
      throw new Error('Source cannot exceed 100 characters');
    }

    return new Source(trimmedValue);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Source): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
