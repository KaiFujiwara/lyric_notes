import { GenreName } from '@/src/domain/valueObjects/GenreName';

describe('GenreName', () => {
  describe('create', () => {
    it('正常なジャンル名で作成できる', () => {
      const genreName = GenreName.create('J-POP');

      expect(genreName.value).toBe('J-POP');
    });

    it('前後の空白は自動でトリムされる', () => {
      const genreName = GenreName.create('  ポップス  ');

      expect(genreName.value).toBe('ポップス');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        GenreName.create('');
      }).toThrow('ジャンル名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        GenreName.create('   ');
      }).toThrow('ジャンル名を入力してください');
    });
  });
});