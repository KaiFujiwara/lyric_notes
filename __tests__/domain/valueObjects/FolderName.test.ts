import { FolderName } from '@/src/domain/valueObjects/FolderName';

describe('FolderName', () => {
  describe('create', () => {
    it('正常な名前でValue Objectを作成できる', () => {
      const folderName = FolderName.create('テストフォルダ');

      expect(folderName.value).toBe('テストフォルダ');
    });

    it('空文字の場合はエラーをスローする', () => {
      expect(() => {
        FolderName.create('');
      }).toThrow('フォルダ名を入力してください');
    });

    it('空白のみの場合はエラーをスローする', () => {
      expect(() => {
        FolderName.create('   ');
      }).toThrow('フォルダ名を入力してください');
    });

    it('nullの場合はエラーをスローする', () => {
      expect(() => {
        FolderName.create(null as any);
      }).toThrow('フォルダ名を入力してください');
    });

    it('undefinedの場合はエラーをスローする', () => {
      expect(() => {
        FolderName.create(undefined as any);
      }).toThrow('フォルダ名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const folderName = FolderName.create('  テストフォルダ  ');

      expect(folderName.value).toBe('テストフォルダ');
    });
  });

  describe('toString', () => {
    it('値を文字列として返す', () => {
      const folderName = FolderName.create('テストフォルダ');

      expect(folderName.toString()).toBe('テストフォルダ');
    });
  });

  describe('value getter', () => {
    it('内部の値を取得できる', () => {
      const folderName = FolderName.create('テストフォルダ');

      expect(folderName.value).toBe('テストフォルダ');
    });
  });
});