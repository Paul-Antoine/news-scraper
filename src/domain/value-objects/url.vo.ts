export class Url {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Url {
    if (!value || value.trim().length === 0) {
      throw new Error('URL cannot be empty');
    }

    const trimmedValue = value.trim();

    if (!this.isValidUrl(trimmedValue)) {
      throw new Error('Invalid URL format');
    }

    return new Url(trimmedValue);
  }

  private static isValidUrl(value: string): boolean {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }

  public get value(): string {
    return this._value;
  }

  public equals(other: Url): boolean {
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }
}
