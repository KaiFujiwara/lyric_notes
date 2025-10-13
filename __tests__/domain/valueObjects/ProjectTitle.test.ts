import { ProjectTitle } from '@/src/domain/valueObjects/ProjectTitle';

describe('ProjectTitle', () => {
  describe('create', () => {
    it('正常なタイトルでValue Objectを作成できる', () => {
      const title = ProjectTitle.create('新曲のタイトル');

      expect(title.value).toBe('新曲のタイトル');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        ProjectTitle.create('');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        ProjectTitle.create('   ');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('nullの場合はエラーをスローする', () => {
      expect(() => {
        ProjectTitle.create(null as any);
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const title = ProjectTitle.create('  新曲のタイトル  ');

      expect(title.value).toBe('新曲のタイトル');
    });

    it('長いタイトルも作成できる', () => {
      const longTitle = 'とても長いプロジェクトのタイトルですが問題なく作成できるはずです';
      const title = ProjectTitle.create(longTitle);

      expect(title.value).toBe(longTitle);
    });
  });

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const title = ProjectTitle.create('新曲のタイトル');

      expect(title.toString()).toBe('新曲のタイトル');
    });
  });
});