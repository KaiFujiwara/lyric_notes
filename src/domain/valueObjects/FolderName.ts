export class FolderName {
  private constructor(private readonly _value: string) {}

  static create(value: string): FolderName {
    if (!value || value.trim() === '') {
      throw new Error('フォルダ名を入力してください');
    }
    return new FolderName(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}