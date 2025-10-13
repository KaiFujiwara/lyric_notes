import { TagName } from '@/src/domain/valueObjects/TagName';

describe('TagName', () => {
  describe('create', () => {
    it('正常なタグ名で作成できる', () => {
      const tagName = TagName.create('ロック');

      expect(tagName.value).toBe('ロック');
    });

    it('前後の空白は自動でトリムされる', () => {
      const tagName = TagName.create('  ロック  ');

      expect(tagName.value).toBe('ロック');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        TagName.create('');
      }).toThrow('タグ名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        TagName.create('   ');
      }).toThrow('タグ名を入力してください');
    });
  });
});