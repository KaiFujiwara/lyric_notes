import { Tag } from '@/src/domain/entities/Tag';

describe('Tag', () => {
  describe('create', () => {
    it('正常な名前でタグを作成できる', () => {
      const tag = Tag.create('ロック');

      expect(tag.id).toBeDefined();
      expect(tag.name).toBe('ロック');
      expect(tag.color).toBeUndefined();
      expect(tag.createdAt).toBeInstanceOf(Date);
      expect(tag.updatedAt).toBeInstanceOf(Date);
    });

    it('名前とカラーコードでタグを作成できる', () => {
      const tag = Tag.create('ロック', '#FF0000');

      expect(tag.name).toBe('ロック');
      expect(tag.color).toBe('#FF0000');
    });

    it('名前が空文字の場合はエラーをスローする', () => {
      expect(() => {
        Tag.create('');
      }).toThrow('タグ名を入力してください');
    });

    it('名前が空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Tag.create('   ');
      }).toThrow('タグ名を入力してください');
    });

    it('名前がnullの場合はエラーをスローする', () => {
      expect(() => {
        Tag.create(null as any);
      }).toThrow('タグ名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const tag = Tag.create('  ロック  ');

      expect(tag.name).toBe('ロック');
    });

    it('無効なカラーコードの場合はエラーをスローする', () => {
      expect(() => {
        Tag.create('ロック', 'invalid-color');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('小文字のカラーコードは大文字に正規化される', () => {
      const tag = Tag.create('ロック', '#ff0000');

      expect(tag.color).toBe('#FF0000');
    });

    it('3桁のカラーコードも作成できる', () => {
      const tag = Tag.create('ロック', '#F0A');

      expect(tag.color).toBe('#F0A');
    });

    it('カラーコードが空文字の場合はundefinedになる', () => {
      const tag = Tag.create('ロック', '');

      expect(tag.color).toBeUndefined();
    });

    it('カラーコードが空白のみの場合はundefinedになる', () => {
      const tag = Tag.create('ロック', '   ');

      expect(tag.color).toBeUndefined();
    });
  });

  describe('updateName', () => {
    let tag: Tag;

    beforeEach(() => {
      tag = Tag.create('元の名前');
    });

    it('名前を正常に更新できる', () => {
      const oldUpdatedAt = tag.updatedAt;

      setTimeout(() => {
        tag.updateName('新しい名前');

        expect(tag.name).toBe('新しい名前');
        expect(tag.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        tag.updateName('');
      }).toThrow('タグ名を入力してください');
    });

    it('空白のみでの更新はエラーをスローする', () => {
      expect(() => {
        tag.updateName('   ');
      }).toThrow('タグ名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      tag.updateName('  新しい名前  ');

      expect(tag.name).toBe('新しい名前');
    });
  });

  describe('updateColor', () => {
    let tag: Tag;

    beforeEach(() => {
      tag = Tag.create('テストタグ', '#FF0000');
    });

    it('カラーコードを正常に更新できる', () => {
      const oldUpdatedAt = tag.updatedAt;

      setTimeout(() => {
        tag.updateColor('#00FF00');

        expect(tag.color).toBe('#00FF00');
        expect(tag.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('カラーコードを削除できる', () => {
      tag.updateColor();

      expect(tag.color).toBeUndefined();
    });

    it('空文字でカラーコードを削除できる', () => {
      tag.updateColor('');

      expect(tag.color).toBeUndefined();
    });

    it('空白のみでカラーコードを削除できる', () => {
      tag.updateColor('   ');

      expect(tag.color).toBeUndefined();
    });

    it('無効なカラーコードはエラーをスローする', () => {
      expect(() => {
        tag.updateColor('invalid-color');
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('小文字のカラーコードは大文字に正規化される', () => {
      tag.updateColor('#00ff00');

      expect(tag.color).toBe('#00FF00');
    });

    it('3桁のカラーコードも更新できる', () => {
      tag.updateColor('#0F0');

      expect(tag.color).toBe('#0F0');
    });

    it('前後の空白は自動でトリムされる', () => {
      tag.updateColor('  #00FF00  ');

      expect(tag.color).toBe('#00FF00');
    });
  });

  describe('constructor', () => {
    it('直接constructorを呼ぶ場合も名前バリデーションが働く', () => {
      expect(() => {
        new Tag('test-id', '', undefined, new Date(), new Date());
      }).toThrow('タグ名を入力してください');
    });

    it('直接constructorを呼ぶ場合もカラーバリデーションが働く', () => {
      expect(() => {
        new Tag('test-id', 'テスト名', 'invalid-color', new Date(), new Date());
      }).toThrow('正しいカラーコード形式で入力してください（例: #FF0000）');
    });

    it('直接constructorで正常なタグを作成できる', () => {
      const now = new Date();
      const tag = new Tag('test-id', 'テスト名', '#FF0000', now, now);

      expect(tag.id).toBe('test-id');
      expect(tag.name).toBe('テスト名');
      expect(tag.color).toBe('#FF0000');
      expect(tag.createdAt).toBe(now);
      expect(tag.updatedAt).toBe(now);
    });

    it('直接constructorでカラーなしのタグを作成できる', () => {
      const now = new Date();
      const tag = new Tag('test-id', 'テスト名', undefined, now, now);

      expect(tag.color).toBeUndefined();
    });
  });

  describe('カラーコードのパターン', () => {
    it('様々な有効なカラーコードでタグを作成できる', () => {
      const patterns = [
        ['黒', '#000000'],
        ['白', '#FFFFFF'],
        ['赤', '#FF0000'],
        ['緑', '#00FF00'],
        ['青', '#0000FF'],
        ['黄', '#FFFF00'],
        ['紫', '#800080'],
        ['グレー', '#808080'],
        ['3桁黒', '#000'],
        ['3桁白', '#FFF'],
        ['3桁赤', '#F00'],
      ];

      patterns.forEach(([name, color]) => {
        const tag = Tag.create(name as string, color as string);
        expect(tag.name).toBe(name);
        expect(tag.color).toBe(color);
      });
    });

    it('数字のみのカラーコードも作成できる', () => {
      const tag = Tag.create('数字', '#123456');

      expect(tag.color).toBe('#123456');
    });

    it('英字のみのカラーコードも作成できる', () => {
      const tag = Tag.create('英字', '#ABCDEF');

      expect(tag.color).toBe('#ABCDEF');
    });
  });

  describe('状態管理', () => {
    let tag: Tag;

    beforeEach(() => {
      tag = Tag.create('テストタグ');
    });

    it('名前とカラーを独立して更新できる', () => {
      tag.updateName('新しい名前');
      tag.updateColor('#FF0000');

      expect(tag.name).toBe('新しい名前');
      expect(tag.color).toBe('#FF0000');
    });

    it('カラーを設定→削除→再設定できる', () => {
      tag.updateColor('#FF0000');
      expect(tag.color).toBe('#FF0000');

      tag.updateColor();
      expect(tag.color).toBeUndefined();

      tag.updateColor('#00FF00');
      expect(tag.color).toBe('#00FF00');
    });

    it('updatedAtは各更新で更新される', () => {
      const initialUpdatedAt = tag.updatedAt;

      setTimeout(() => {
        tag.updateName('新名前');
        const afterNameUpdate = tag.updatedAt;

        setTimeout(() => {
          tag.updateColor('#FF0000');
          const afterColorUpdate = tag.updatedAt;

          expect(afterNameUpdate.getTime()).toBeGreaterThan(initialUpdatedAt.getTime());
          expect(afterColorUpdate.getTime()).toBeGreaterThan(afterNameUpdate.getTime());
        }, 1);
      }, 1);
    });
  });
});