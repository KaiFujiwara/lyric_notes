import { SectionName } from '@/src/domain/valueObjects/SectionName';

describe('SectionName', () => {
  describe('create', () => {
    it('正常なセクション名で作成できる', () => {
      const sectionName = SectionName.create('イントロ');

      expect(sectionName.value).toBe('イントロ');
    });

    it('前後の空白は自動でトリムされる', () => {
      const sectionName = SectionName.create('  サビ  ');

      expect(sectionName.value).toBe('サビ');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        SectionName.create('');
      }).toThrow('セクション名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        SectionName.create('   ');
      }).toThrow('セクション名を入力してください');
    });
  });
});