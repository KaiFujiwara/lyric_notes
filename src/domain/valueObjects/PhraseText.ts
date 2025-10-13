export class PhraseText {
  private constructor(private readonly _value: string) {}

  static create(value: string): PhraseText {
    if (!value || value.trim() === '') {
      throw new Error('フレーズを入力してください');
    }
    return new PhraseText(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}