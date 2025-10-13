import { Folder } from '@/src/domain/entities/Folder';

describe('Folder', () => {
  describe('create', () => {
    it('正常な名前でフォルダを作成できる', () => {
      const folder = Folder.create('テストフォルダ', 1);

      expect(folder.id).toBeDefined();
      expect(folder.name).toBe('テストフォルダ');
      expect(folder.orderIndex).toBe(1);
      expect(folder.createdAt).toBeInstanceOf(Date);
      expect(folder.updatedAt).toBeInstanceOf(Date);
    });

    it('orderIndexのデフォルト値は0', () => {
      const folder = Folder.create('テストフォルダ');

      expect(folder.orderIndex).toBe(0);
    });

    it('名前が空文字の場合はエラーをスローする', () => {
      expect(() => {
        Folder.create('');
      }).toThrow('フォルダ名を入力してください');
    });

    it('名前が空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Folder.create('   ');
      }).toThrow('フォルダ名を入力してください');
    });

    it('名前がnullの場合はエラーをスローする', () => {
      expect(() => {
        Folder.create(null as any);
      }).toThrow('フォルダ名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const folder = Folder.create('  テストフォルダ  ');

      expect(folder.name).toBe('テストフォルダ');
    });
  });

  describe('updateName', () => {
    let folder: Folder;

    beforeEach(() => {
      folder = Folder.create('元の名前');
    });

    it('名前を正常に更新できる', () => {
      const oldUpdatedAt = folder.updatedAt;

      // 時間差を作るため少し待つ
      setTimeout(() => {
        folder.updateName('新しい名前');

        expect(folder.name).toBe('新しい名前');
        expect(folder.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        folder.updateName('');
      }).toThrow('フォルダ名を入力してください');
    });

    it('空白のみでの更新はエラーをスローする', () => {
      expect(() => {
        folder.updateName('   ');
      }).toThrow('フォルダ名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      folder.updateName('  新しい名前  ');

      expect(folder.name).toBe('新しい名前');
    });
  });

  describe('reorder', () => {
    let folder: Folder;

    beforeEach(() => {
      folder = Folder.create('テストフォルダ', 1);
    });

    it('orderIndexを正常に更新できる', () => {
      const oldUpdatedAt = folder.updatedAt;

      setTimeout(() => {
        folder.reorder(5);

        expect(folder.orderIndex).toBe(5);
        expect(folder.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('orderIndexに0を設定できる', () => {
      folder.reorder(0);

      expect(folder.orderIndex).toBe(0);
    });

    it('orderIndexに負の値を設定できる', () => {
      folder.reorder(-1);

      expect(folder.orderIndex).toBe(-1);
    });
  });

  describe('constructor', () => {
    it('直接constructorを呼ぶ場合も名前バリデーションが働く', () => {
      expect(() => {
        new Folder('test-id', '', 0);
      }).toThrow('フォルダ名を入力してください');
    });

    it('直接constructorで正常なフォルダを作成できる', () => {
      const now = new Date();
      const folder = new Folder('test-id', 'テスト名', 1, now, now);

      expect(folder.id).toBe('test-id');
      expect(folder.name).toBe('テスト名');
      expect(folder.orderIndex).toBe(1);
      expect(folder.createdAt).toBe(now);
      expect(folder.updatedAt).toBe(now);
    });
  });
});