import { PhraseText } from '@/src/domain/valueObjects/PhraseText';

describe('PhraseText', () => {
  describe('create', () => {
    it('正常なフレーズでValue Objectを作成できる', () => {
      const phraseText = PhraseText.create('心に響くメロディー');

      expect(phraseText.value).toBe('心に響くメロディー');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        PhraseText.create('');
      }).toThrow('フレーズを入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        PhraseText.create('   ');
      }).toThrow('フレーズを入力してください');
    });

    it('nullの場合はエラーをスローする', () => {
      expect(() => {
        PhraseText.create(null as any);
      }).toThrow('フレーズを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const phraseText = PhraseText.create('  心に響くメロディー  ');

      expect(phraseText.value).toBe('心に響くメロディー');
    });

    it('改行を含むフレーズも作成できる', () => {
      const multilinePhrase = '空を見上げて\n星を数えよう';
      const phraseText = PhraseText.create(multilinePhrase);

      expect(phraseText.value).toBe(multilinePhrase);
    });

    it('長いフレーズも作成できる', () => {
      const longPhrase = 'とても長いフレーズですが、このようなケースでもValue Objectとして正しく作成できるはずです。';
      const phraseText = PhraseText.create(longPhrase);

      expect(phraseText.value).toBe(longPhrase);
    });
  });


  describe('toString', () => {
    it('値を文字列として返す', () => {
      const phraseText = PhraseText.create('心に響くメロディー');

      expect(phraseText.toString()).toBe('心に響くメロディー');
    });
  });
});