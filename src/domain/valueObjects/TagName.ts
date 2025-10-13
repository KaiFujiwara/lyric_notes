export class TagName {
  private constructor(private readonly _value: string) {}

  static create(value: string): TagName {
    if (!value || value.trim() === '') {
      throw new Error('タグ名を入力してください');
    }
    return new TagName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}