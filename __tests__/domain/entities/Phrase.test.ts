import { Phrase } from '@/src/domain/entities/Phrase';

describe('Phrase', () => {
  describe('create', () => {
    it('正常なテキストでフレーズを作成できる', () => {
      const phrase = Phrase.create('心に響くメロディー');

      expect(phrase.id).toBeDefined();
      expect(phrase.text).toBe('心に響くメロディー');
      expect(phrase.createdAt).toBeInstanceOf(Date);
      expect(phrase.updatedAt).toBeInstanceOf(Date);
    });

    it('テキストが空文字の場合はエラーをスローする', () => {
      expect(() => {
        Phrase.create('');
      }).toThrow('フレーズを入力してください');
    });

    it('テキストが空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Phrase.create('   ');
      }).toThrow('フレーズを入力してください');
    });

    it('テキストがnullの場合はエラーをスローする', () => {
      expect(() => {
        Phrase.create(null as any);
      }).toThrow('フレーズを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const phrase = Phrase.create('  心に響くメロディー  ');

      expect(phrase.text).toBe('心に響くメロディー');
    });

    it('改行を含むフレーズも作成できる', () => {
      const multilinePhrase = '空を見上げて\n星を数えよう';
      const phrase = Phrase.create(multilinePhrase);

      expect(phrase.text).toBe(multilinePhrase);
    });

    it('長いフレーズも作成できる', () => {
      const longPhrase = 'とても長いフレーズですが、このようなケースでも正しく作成できるはずです。歌詞制作において、時には長い文章をフレーズとして保存したい場合もあります。';
      const phrase = Phrase.create(longPhrase);

      expect(phrase.text).toBe(longPhrase);
    });
  });

  describe('updateText', () => {
    let phrase: Phrase;

    beforeEach(() => {
      phrase = Phrase.create('元のテキスト');
    });

    it('テキストを正常に更新できる', () => {
      const oldUpdatedAt = phrase.updatedAt;

      setTimeout(() => {
        phrase.updateText('新しいテキスト');

        expect(phrase.text).toBe('新しいテキスト');
        expect(phrase.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        phrase.updateText('');
      }).toThrow('フレーズを入力してください');
    });

    it('空白のみでの更新はエラーをスローする', () => {
      expect(() => {
        phrase.updateText('   ');
      }).toThrow('フレーズを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      phrase.updateText('  新しいテキスト  ');

      expect(phrase.text).toBe('新しいテキスト');
    });

    it('改行を含むテキストに更新できる', () => {
      const multilineText = '新しい歌詞\n複数行で構成';
      phrase.updateText(multilineText);

      expect(phrase.text).toBe(multilineText);
    });
  });

  describe('constructor', () => {
    it('直接constructorを呼ぶ場合もテキストバリデーションが働く', () => {
      expect(() => {
        new Phrase('test-id', '', undefined, new Date(), new Date());
      }).toThrow('フレーズを入力してください');
    });

    it('直接constructorで正常なフレーズを作成できる', () => {
      const now = new Date();
      const phrase = new Phrase('test-id', 'テストフレーズ', undefined, now, now);

      expect(phrase.id).toBe('test-id');
      expect(phrase.text).toBe('テストフレーズ');
      expect(phrase.note).toBeUndefined();
      expect(phrase.createdAt).toBe(now);
      expect(phrase.updatedAt).toBe(now);
    });
  });

  describe('immutability', () => {
    it('idは変更できない', () => {
      const phrase = Phrase.create('テストフレーズ');
      const originalId = phrase.id;

      // TypeScriptのreadonly制約により、以下はコンパイルエラーになるはず
      // phrase.id = 'new-id';

      expect(phrase.id).toBe(originalId);
    });

    it('createdAtは変更できない', () => {
      const phrase = Phrase.create('テストフレーズ');
      const originalCreatedAt = phrase.createdAt;

      // TypeScriptのreadonly制約により、以下はコンパイルエラーになるはず
      // phrase.createdAt = new Date();

      expect(phrase.createdAt).toBe(originalCreatedAt);
    });

    it('textとupdatedAtは変更可能', () => {
      const phrase = Phrase.create('元のテキスト');
      const originalText = phrase.text;
      const originalUpdatedAt = phrase.updatedAt;

      phrase.updateText('新しいテキスト');

      expect(phrase.text).not.toBe(originalText);
      expect(phrase.updatedAt).not.toBe(originalUpdatedAt);
    });
  });
});