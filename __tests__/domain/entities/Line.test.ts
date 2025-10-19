import { Line } from '@/src/domain/entities/Line';

describe('Line', () => {
  const testSectionId = 'section-123';

  describe('create', () => {
    it('正常なテキストで行を作成できる', () => {
      const line = Line.create(testSectionId, '空を見上げて', 0);

      expect(line.id).toBeDefined();
      expect(line.sectionId).toBe(testSectionId);
      expect(line.text).toBe('空を見上げて');
      expect(line.lineIndex).toBe(0);
      expect(line.createdAt).toBeInstanceOf(Date);
      expect(line.updatedAt).toBeInstanceOf(Date);
    });

    it('空文字で行を作成できる', () => {
      const line = Line.create(testSectionId, '', 1);

      expect(line.text).toBe('');
      expect(line.lineIndex).toBe(1);
    });

    it('空白のみの行も作成できる', () => {
      const line = Line.create(testSectionId, '   ', 2);

      expect(line.text).toBe('   ');
      expect(line.lineIndex).toBe(2);
    });

    it('長いテキストで行を作成できる', () => {
      const longText = 'とても長い歌詞の行ですが、このような長い文章も正しく作成できるはずです';
      const line = Line.create(testSectionId, longText, 3);

      expect(line.text).toBe(longText);
    });

    it('特殊文字を含むテキストで行を作成できる', () => {
      const specialText = '♪〜（＾∇＾）！？#歌詞@2023';
      const line = Line.create(testSectionId, specialText, 4);

      expect(line.text).toBe(specialText);
    });

    it('改行を含むテキストも作成できる', () => {
      const multilineText = '一行目\n二行目';
      const line = Line.create(testSectionId, multilineText, 5);

      expect(line.text).toBe(multilineText);
    });
  });

  describe('updateText', () => {
    let line: Line;

    beforeEach(() => {
      line = Line.create(testSectionId, '元のテキスト', 0);
    });

    it('テキストを正常に更新できる', () => {
      const oldUpdatedAt = line.updatedAt;

      setTimeout(() => {
        line.updateText('新しいテキスト');

        expect(line.text).toBe('新しいテキスト');
        expect(line.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字に更新できる', () => {
      line.updateText('');

      expect(line.text).toBe('');
    });

    it('空白のみに更新できる', () => {
      line.updateText('   ');

      expect(line.text).toBe('   ');
    });

    it('同じテキストに更新してもエラーにならない', () => {
      const originalText = line.text;
      line.updateText(originalText);

      expect(line.text).toBe(originalText);
    });
  });

  describe('getCharacterCount', () => {
    it('通常のテキストの文字数をカウントできる', () => {
      const line = Line.create(testSectionId, '空を見上げて', 0);

      expect(line.getCharacterCount()).toBe(6);
    });

    it('空白を除外してカウントする', () => {
      const line = Line.create(testSectionId, '空 を 見 上 げ て', 0);

      expect(line.getCharacterCount()).toBe(6);
    });

    it('全角スペースも除外する', () => {
      const line = Line.create(testSectionId, '空　を　見上げて', 0);

      expect(line.getCharacterCount()).toBe(6);
    });

    it('タブ文字も除外する', () => {
      const line = Line.create(testSectionId, '空\tを\t見上げて', 0);

      expect(line.getCharacterCount()).toBe(6);
    });

    it('改行も除外する', () => {
      const line = Line.create(testSectionId, '空を\n見上げて', 0);

      expect(line.getCharacterCount()).toBe(6);
    });

    it('空文字の場合は0を返す', () => {
      const line = Line.create(testSectionId, '', 0);

      expect(line.getCharacterCount()).toBe(0);
    });

    it('空白のみの場合は0を返す', () => {
      const line = Line.create(testSectionId, '   ', 0);

      expect(line.getCharacterCount()).toBe(0);
    });

    it('英語の文字数もカウントできる', () => {
      const line = Line.create(testSectionId, 'Hello World', 0);

      expect(line.getCharacterCount()).toBe(10);
    });

    it('数字もカウントできる', () => {
      const line = Line.create(testSectionId, '2023年の夏', 0);

      expect(line.getCharacterCount()).toBe(7);
    });

    it('記号もカウントできる', () => {
      const line = Line.create(testSectionId, '♪〜！？', 0);

      expect(line.getCharacterCount()).toBe(4);
    });
  });


  describe('isEmpty', () => {
    it('空文字の場合はtrueを返す', () => {
      const line = Line.create(testSectionId, '', 0);

      expect(line.isEmpty()).toBe(true);
    });

    it('空白のみの場合もtrueを返す', () => {
      const line = Line.create(testSectionId, '   ', 0);

      expect(line.isEmpty()).toBe(true);
    });

    it('全角スペースのみの場合もtrueを返す', () => {
      const line = Line.create(testSectionId, '　　　', 0);

      expect(line.isEmpty()).toBe(true);
    });

    it('タブのみの場合もtrueを返す', () => {
      const line = Line.create(testSectionId, '\t\t', 0);

      expect(line.isEmpty()).toBe(true);
    });

    it('改行のみの場合もtrueを返す', () => {
      const line = Line.create(testSectionId, '\n', 0);

      expect(line.isEmpty()).toBe(true);
    });

    it('文字がある場合はfalseを返す', () => {
      const line = Line.create(testSectionId, '空を見上げて', 0);

      expect(line.isEmpty()).toBe(false);
    });

    it('空白と文字が混在する場合はfalseを返す', () => {
      const line = Line.create(testSectionId, '  空  ', 0);

      expect(line.isEmpty()).toBe(false);
    });
  });

  describe('constructor', () => {
    it('直接constructorで正常な行を作成できる', () => {
      const now = new Date();
      const line = new Line('test-id', testSectionId, 'テスト歌詞', 5, undefined, undefined, now, now);

      expect(line.id).toBe('test-id');
      expect(line.sectionId).toBe(testSectionId);
      expect(line.text).toBe('テスト歌詞');
      expect(line.lineIndex).toBe(5);
      expect(line.moraCount).toBeUndefined();
      expect(line.rhymeTail).toBeUndefined();
      expect(line.createdAt).toBe(now);
      expect(line.updatedAt).toBe(now);
    });
  });

  describe('セクションID管理', () => {
    it('sectionIdは読み取り専用で変更できない', () => {
      const line = Line.create(testSectionId, 'テスト歌詞', 0);
      const originalSectionId = line.sectionId;

      // TypeScriptのreadonly制約により、以下はコンパイルエラーになるはず
      // line.sectionId = 'new-section-id';

      expect(line.sectionId).toBe(originalSectionId);
    });
  });

  describe('行インデックス管理', () => {
    it('lineIndexは読み取り専用で変更できない', () => {
      const line = Line.create(testSectionId, 'テスト歌詞', 3);

      // TypeScriptのreadonly制約により、以下はコンパイルエラーになるはず
      // line.lineIndex = 5;

      expect(line.lineIndex).toBe(3);
    });

    it('複数の行に異なるインデックスを設定できる', () => {
      const lines = [
        Line.create(testSectionId, '一行目', 0),
        Line.create(testSectionId, '二行目', 1),
        Line.create(testSectionId, '三行目', 2),
        Line.create(testSectionId, '四行目', 3),
      ];

      lines.forEach((line, index) => {
        expect(line.lineIndex).toBe(index);
      });
    });
  });

  describe('実用的な使用例', () => {
    it('歌詞の一節を複数行で表現できる', () => {
      const lyrics = [
        '空を見上げて',
        '星を数えよう',
        '',
        'それが私たちの',
        '小さな約束',
      ];

      const lines = lyrics.map((text, index) =>
        Line.create(testSectionId, text, index)
      );

      expect(lines[0].text).toBe('空を見上げて');
      expect(lines[0].getCharacterCount()).toBe(6);
      expect(lines[2].isEmpty()).toBe(true);
      expect(lines[4].text).toBe('小さな約束');
    });

    it('英語の歌詞も扱える', () => {
      const line = Line.create(testSectionId, 'We are the champions', 0);

      expect(line.getCharacterCount()).toBe(17); // スペース除外
      expect(line.isEmpty()).toBe(false);
    });
  });
});