export class GenreName {
  private constructor(private readonly _value: string) {}

  static create(value: string): GenreName {
    if (!value || value.trim() === '') {
      throw new Error('ジャンル名を入力してください');
    }
    return new GenreName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}