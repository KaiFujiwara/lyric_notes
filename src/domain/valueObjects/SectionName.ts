export class SectionName {
  private constructor(private readonly _value: string) {}

  static create(value: string): SectionName {
    if (!value || value.trim() === '') {
      throw new Error('セクション名を入力してください');
    }
    return new SectionName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}