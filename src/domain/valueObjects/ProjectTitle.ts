export class ProjectTitle {
  private constructor(private readonly _value: string) {}

  static create(value: string): ProjectTitle {
    if (!value || value.trim() === '') {
      throw new Error('プロジェクトタイトルを入力してください');
    }
    return new ProjectTitle(value.trim());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }
}