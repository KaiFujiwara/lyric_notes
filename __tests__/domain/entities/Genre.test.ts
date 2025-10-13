import { Genre } from '@/src/domain/entities/Genre';

describe('Genre', () => {
  describe('create', () => {
    it('正常な名前でジャンルを作成できる', () => {
      const genre = Genre.create('J-POP');

      expect(genre.id).toBeDefined();
      expect(genre.name).toBe('J-POP');
      expect(genre.templateSections).toEqual([]);
      expect(genre.isPreset).toBe(false);
      expect(genre.createdAt).toBeInstanceOf(Date);
      expect(genre.updatedAt).toBeInstanceOf(Date);
    });

    it('テンプレートセクション付きでジャンルを作成できる', () => {
      const sections = ['イントロ', 'Aメロ', 'Bメロ', 'サビ'];
      const genre = Genre.create('J-POP', sections);

      expect(genre.name).toBe('J-POP');
      expect(genre.templateSections).toEqual(sections);
    });

    it('プリセットジャンルを作成できる', () => {
      const genre = Genre.create('J-POP', ['イントロ', 'サビ'], true);

      expect(genre.isPreset).toBe(true);
    });

    it('名前が空文字の場合はエラーをスローする', () => {
      expect(() => {
        Genre.create('');
      }).toThrow('ジャンル名を入力してください');
    });

    it('名前が空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Genre.create('   ');
      }).toThrow('ジャンル名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const genre = Genre.create('  ロック  ');

      expect(genre.name).toBe('ロック');
    });

    it('テンプレートセクション配列は独立したコピーが作られる', () => {
      const originalSections = ['イントロ', 'サビ'];
      const genre = Genre.create('J-POP', originalSections);

      originalSections.push('アウトロ');

      expect(genre.templateSections).toEqual(['イントロ', 'サビ']);
      expect(genre.templateSections).not.toBe(originalSections);
    });
  });

  describe('updateName', () => {
    let genre: Genre;

    beforeEach(() => {
      genre = Genre.create('元の名前');
    });

    it('名前を正常に更新できる', () => {
      const oldUpdatedAt = genre.updatedAt;

      setTimeout(() => {
        genre.updateName('新しい名前');

        expect(genre.name).toBe('新しい名前');
        expect(genre.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        genre.updateName('');
      }).toThrow('ジャンル名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      genre.updateName('  新しい名前  ');

      expect(genre.name).toBe('新しい名前');
    });
  });

  describe('updateTemplate', () => {
    let genre: Genre;

    beforeEach(() => {
      genre = Genre.create('J-POP', ['イントロ', 'サビ']);
    });

    it('テンプレートを正常に更新できる', () => {
      const newTemplate = ['イントロ', 'Aメロ', 'Bメロ', 'サビ', 'アウトロ'];
      const oldUpdatedAt = genre.updatedAt;

      setTimeout(() => {
        genre.updateTemplate(newTemplate);

        expect(genre.templateSections).toEqual(newTemplate);
        expect(genre.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空配列で更新できる', () => {
      genre.updateTemplate([]);

      expect(genre.templateSections).toEqual([]);
    });

    it('元の配列は変更されない', () => {
      const newTemplate = ['イントロ', 'サビ'];
      genre.updateTemplate(newTemplate);

      newTemplate.push('アウトロ');

      expect(genre.templateSections).toEqual(['イントロ', 'サビ']);
    });
  });

  describe('addTemplateSection', () => {
    let genre: Genre;

    beforeEach(() => {
      genre = Genre.create('J-POP', ['イントロ', 'サビ']);
    });

    it('セクションを末尾に追加できる', () => {
      genre.addTemplateSection('アウトロ');

      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'アウトロ']);
    });

    it('指定位置にセクションを挿入できる', () => {
      genre.addTemplateSection('Aメロ', 1);

      expect(genre.templateSections).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('先頭に挿入できる', () => {
      genre.addTemplateSection('前奏', 0);

      expect(genre.templateSections).toEqual(['前奏', 'イントロ', 'サビ']);
    });

    it('末尾インデックス指定で末尾に追加される', () => {
      genre.addTemplateSection('アウトロ', genre.templateSections.length);

      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'アウトロ']);
    });

    it('空文字のセクション名はエラーをスローする', () => {
      expect(() => {
        genre.addTemplateSection('');
      }).toThrow('セクション名を入力してください');
    });

    it('空白のみのセクション名はエラーをスローする', () => {
      expect(() => {
        genre.addTemplateSection('   ');
      }).toThrow('セクション名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      genre.addTemplateSection('  Aメロ  ');

      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'Aメロ']);
    });

    it('無効なインデックスの場合は末尾に追加される', () => {
      genre.addTemplateSection('アウトロ', -1);
      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'アウトロ']);

      genre.addTemplateSection('エンディング', 100);
      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'アウトロ', 'エンディング']);
    });
  });

  describe('removeTemplateSection', () => {
    let genre: Genre;

    beforeEach(() => {
      genre = Genre.create('J-POP', ['イントロ', 'Aメロ', 'サビ', 'アウトロ']);
    });

    it('指定インデックスのセクションを削除できる', () => {
      genre.removeTemplateSection(1); // Aメロを削除

      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'アウトロ']);
    });

    it('先頭のセクションを削除できる', () => {
      genre.removeTemplateSection(0);

      expect(genre.templateSections).toEqual(['Aメロ', 'サビ', 'アウトロ']);
    });

    it('末尾のセクションを削除できる', () => {
      genre.removeTemplateSection(3);

      expect(genre.templateSections).toEqual(['イントロ', 'Aメロ', 'サビ']);
    });

    it('無効なインデックスの場合は何も変更されない', () => {
      const original = [...genre.templateSections];

      genre.removeTemplateSection(-1);
      expect(genre.templateSections).toEqual(original);

      genre.removeTemplateSection(100);
      expect(genre.templateSections).toEqual(original);
    });
  });

  describe('moveTemplateSection', () => {
    let genre: Genre;

    beforeEach(() => {
      genre = Genre.create('J-POP', ['イントロ', 'Aメロ', 'Bメロ', 'サビ']);
    });

    it('セクションの位置を変更できる', () => {
      genre.moveTemplateSection(1, 3); // AメロをサビのInf

      expect(genre.templateSections).toEqual(['イントロ', 'Bメロ', 'サビ', 'Aメロ']);
    });

    it('前方に移動できる', () => {
      genre.moveTemplateSection(3, 1); // サビをAメロの位置へ

      expect(genre.templateSections).toEqual(['イントロ', 'サビ', 'Aメロ', 'Bメロ']);
    });

    it('同じ位置への移動は何も変更されない', () => {
      const original = [...genre.templateSections];

      genre.moveTemplateSection(1, 1);

      expect(genre.templateSections).toEqual(original);
    });

    it('無効なインデックスの場合は何も変更されない', () => {
      const original = [...genre.templateSections];

      genre.moveTemplateSection(-1, 1);
      expect(genre.templateSections).toEqual(original);

      genre.moveTemplateSection(1, -1);
      expect(genre.templateSections).toEqual(original);

      genre.moveTemplateSection(100, 1);
      expect(genre.templateSections).toEqual(original);

      genre.moveTemplateSection(1, 100);
      expect(genre.templateSections).toEqual(original);
    });
  });

  describe('getTemplateSectionCount', () => {
    it('テンプレートセクションの数を返す', () => {
      const genre1 = Genre.create('J-POP');
      expect(genre1.getTemplateSectionCount()).toBe(0);

      const genre2 = Genre.create('ロック', ['イントロ', 'サビ']);
      expect(genre2.getTemplateSectionCount()).toBe(2);

      const genre3 = Genre.create('ポップ', ['A', 'B', 'C', 'D', 'E']);
      expect(genre3.getTemplateSectionCount()).toBe(5);
    });
  });

  describe('hasTemplate', () => {
    it('テンプレートがある場合はtrueを返す', () => {
      const genre = Genre.create('J-POP', ['イントロ', 'サビ']);

      expect(genre.hasTemplate()).toBe(true);
    });

    it('テンプレートがない場合はfalseを返す', () => {
      const genre = Genre.create('J-POP');

      expect(genre.hasTemplate()).toBe(false);
    });

    it('テンプレートを削除した後はfalseを返す', () => {
      const genre = Genre.create('J-POP', ['イントロ', 'サビ']);
      genre.updateTemplate([]);

      expect(genre.hasTemplate()).toBe(false);
    });
  });
});