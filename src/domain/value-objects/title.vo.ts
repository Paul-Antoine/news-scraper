export class Title {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Title {
    if (!value || value.trim().length === 0) {
      throw new Error('Title cannot be empty');
    }

    const trimmedValue = value.trim();

    if (trimmedValue.length > 500) {
      throw new Error('Title cannot exceed 500 characters');
    }

    return new Title(trimmedValue);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Title): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
