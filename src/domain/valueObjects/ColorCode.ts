export class ColorCode {
  private constructor(private readonly _value: string) {}

  static create(value?: string): ColorCode | undefined {
    if (!value || value.trim() === '') {
      return undefined;
    }

    const trimmedValue = value.trim();

    // #RRGGBB または #RGB 形式をチェック
    if (!/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(trimmedValue)) {
      throw new Error('正しいカラーコード形式で入力してください（例: #FF0000）');
    }

    return new ColorCode(trimmedValue.toUpperCase());
  }

  get value(): string {
    return this._value;
  }

  toString(): string {
    return this._value;
  }

  // 3桁形式を6桁形式に展開
  toFullFormat(): string {
    if (this._value.length === 4) { // #RGB
      const r = this._value[1];
      const g = this._value[2];
      const b = this._value[3];
      return `#${r}${r}${g}${g}${b}${b}`;
    }
    return this._value; // 既に6桁形式
  }

  // RGBコンポーネントを取得
  toRgb(): { r: number; g: number; b: number } {
    const fullFormat = this.toFullFormat();
    const r = parseInt(fullFormat.slice(1, 3), 16);
    const g = parseInt(fullFormat.slice(3, 5), 16);
    const b = parseInt(fullFormat.slice(5, 7), 16);
    return { r, g, b };
  }
}