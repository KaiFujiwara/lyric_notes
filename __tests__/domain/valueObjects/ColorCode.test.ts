import { ColorCode } from '@/src/domain/valueObjects/ColorCode';

describe('ColorCode', () => {
  describe('create', () => {
    it('正常な6桁カラーコードでValue Objectを作成できる', () => {
      const color = ColorCode.create('#FF0000');

      expect(color).not.toBeUndefined();
      expect(color!.value).toBe('#FF0000');
    });

    it('正常な3桁カラーコードでValue Objectを作成できる', () => {
      const color = ColorCode.create('#F00');

      expect(color).not.toBeUndefined();
      expect(color!.value).toBe('#F00');
    });

    it('小文字のカラーコードは大文字に正規化される', () => {
      const color = ColorCode.create('#ff0000');

      expect(color!.value).toBe('#FF0000');
    });

    it('3桁の小文字も大文字に正規化される', () => {
      const color = ColorCode.create('#f0a');

      expect(color!.value).toBe('#F0A');
    });

    it('空文字の場合はundefinedを返す', () => {
      const color = ColorCode.create('');

      expect(color).toBeUndefined();
    });

    it('空白のみの場合はundefinedを返す', () => {
      const color = ColorCode.create('   ');

      expect(color).toBeUndefined();
    });

    it('undefinedの場合はundefinedを返す', () => {
      const color = ColorCode.create(undefined);

      expect(color).toBeUndefined();
    });

    it('前後の空白は自動でトリムされる', () => {
      const color = ColorCode.create('  #FF0000  ');

      expect(color!.value).toBe('#FF0000');
    });

    it('#がないカラーコードはエラーをスローする', () => {
      expect(() => {
        ColorCode.create('FF0000');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('無効な文字を含むカラーコードはエラーをスローする', () => {
      expect(() => {
        ColorCode.create('#GG0000');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('文字数が不正なカラーコードはエラーをスローする', () => {
      expect(() => {
        ColorCode.create('#FF00');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');

      expect(() => {
        ColorCode.create('#FF00000');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('数字のみのカラーコードも作成できる', () => {
      const color = ColorCode.create('#123456');

      expect(color!.value).toBe('#123456');
    });

    it('数字と文字の混合カラーコードも作成できる', () => {
      const color = ColorCode.create('#A1B2C3');

      expect(color!.value).toBe('#A1B2C3');
    });
  });

  describe('toFullFormat', () => {
    it('3桁形式を6桁形式に展開する', () => {
      const color = ColorCode.create('#F0A')!;

      expect(color.toFullFormat()).toBe('#FF00AA');
    });

    it('6桁形式はそのまま返す', () => {
      const color = ColorCode.create('#FF00AA')!;

      expect(color.toFullFormat()).toBe('#FF00AA');
    });

    it('黒色の3桁形式も正しく展開する', () => {
      const color = ColorCode.create('#000')!;

      expect(color.toFullFormat()).toBe('#000000');
    });

    it('白色の3桁形式も正しく展開する', () => {
      const color = ColorCode.create('#FFF')!;

      expect(color.toFullFormat()).toBe('#FFFFFF');
    });
  });

  describe('toRgb', () => {
    it('6桁カラーコードをRGBに変換する', () => {
      const color = ColorCode.create('#FF0000')!;
      const rgb = color.toRgb();

      expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('3桁カラーコードをRGBに変換する', () => {
      const color = ColorCode.create('#F0A')!;
      const rgb = color.toRgb();

      expect(rgb).toEqual({ r: 255, g: 0, b: 170 });
    });

    it('黒色をRGBに変換する', () => {
      const color = ColorCode.create('#000000')!;
      const rgb = color.toRgb();

      expect(rgb).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('白色をRGBに変換する', () => {
      const color = ColorCode.create('#FFFFFF')!;
      const rgb = color.toRgb();

      expect(rgb).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('グレーをRGBに変換する', () => {
      const color = ColorCode.create('#808080')!;
      const rgb = color.toRgb();

      expect(rgb).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const color = ColorCode.create('#FF0000')!;

      expect(color.toString()).toBe('#FF0000');
    });
  });

  describe('value getter', () => {
    it('内部の値を取得できる', () => {
      const color = ColorCode.create('#FF0000')!;

      expect(color.value).toBe('#FF0000');
    });
  });
});