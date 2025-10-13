import { Project } from '@/src/domain/entities/Project';

describe('Project', () => {
  describe('create', () => {
    it('正常なタイトルでプロジェクトを作成できる', () => {
      const project = Project.create('新しい楽曲');

      expect(project.id).toBeDefined();
      expect(project.title).toBe('新しい楽曲');
      expect(project.folderId).toBeUndefined();
      expect(project.genreId).toBeUndefined();
      expect(project.createdAt).toBeInstanceOf(Date);
      expect(project.updatedAt).toBeInstanceOf(Date);
      expect(project.isDeleted).toBe(false);
    });

    it('フォルダIDを指定してプロジェクトを作成できる', () => {
      const folderId = 'folder-123';
      const project = Project.create('新しい楽曲', folderId);

      expect(project.title).toBe('新しい楽曲');
      expect(project.folderId).toBe(folderId);
      expect(project.genreId).toBeUndefined();
      expect(project.isDeleted).toBe(false);
    });

    it('タイトルが空文字の場合はエラーをスローする', () => {
      expect(() => {
        Project.create('');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('タイトルが空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Project.create('   ');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('タイトルがnullの場合はエラーをスローする', () => {
      expect(() => {
        Project.create(null as any);
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const project = Project.create('  新しい楽曲  ');

      expect(project.title).toBe('新しい楽曲');
    });

    it('フォルダIDとジャンルIDを指定してプロジェクトを作成できる', () => {
      const folderId = 'folder-123';
      const genreId = 'genre-456';
      const project = Project.create('新しい楽曲', folderId, genreId);

      expect(project.title).toBe('新しい楽曲');
      expect(project.folderId).toBe(folderId);
      expect(project.genreId).toBe(genreId);
      expect(project.isDeleted).toBe(false);
    });

    it('ジャンルIDのみを指定してプロジェクトを作成できる', () => {
      const genreId = 'genre-789';
      const project = Project.create('新しい楽曲', undefined, genreId);

      expect(project.title).toBe('新しい楽曲');
      expect(project.folderId).toBeUndefined();
      expect(project.genreId).toBe(genreId);
      expect(project.isDeleted).toBe(false);
    });
  });

  describe('updateTitle', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('元のタイトル');
    });

    it('タイトルを正常に更新できる', () => {
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.updateTitle('新しいタイトル');

        expect(project.title).toBe('新しいタイトル');
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        project.updateTitle('');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('空白のみでの更新はエラーをスローする', () => {
      expect(() => {
        project.updateTitle('   ');
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      project.updateTitle('  新しいタイトル  ');

      expect(project.title).toBe('新しいタイトル');
    });
  });

  describe('softDelete', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('テストプロジェクト');
    });

    it('プロジェクトをソフト削除できる', () => {
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.softDelete();

        expect(project.isDeleted).toBe(true);
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('既に削除済みのプロジェクトも削除できる', () => {
      project.softDelete();
      project.softDelete();

      expect(project.isDeleted).toBe(true);
    });
  });

  describe('restore', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('テストプロジェクト');
      project.softDelete(); // 先に削除しておく
    });

    it('削除されたプロジェクトを復元できる', () => {
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.restore();

        expect(project.isDeleted).toBe(false);
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('削除されていないプロジェクトも復元できる', () => {
      project.restore();
      project.restore();

      expect(project.isDeleted).toBe(false);
    });
  });

  describe('moveToFolder', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('テストプロジェクト');
    });

    it('プロジェクトをフォルダに移動できる', () => {
      const folderId = 'folder-123';
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.moveToFolder(folderId);

        expect(project.folderId).toBe(folderId);
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('プロジェクトをフォルダから外すことができる', () => {
      project.moveToFolder('folder-123');
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.moveToFolder(); // undefinedを渡す

        expect(project.folderId).toBeUndefined();
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('同じフォルダIDでも更新日時は更新される', () => {
      project.moveToFolder('folder-123');
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.moveToFolder('folder-123');

        expect(project.folderId).toBe('folder-123');
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });
  });

  describe('constructor', () => {
    it('直接constructorを呼ぶ場合もタイトルバリデーションが働く', () => {
      expect(() => {
        new Project('test-id', '', undefined, undefined, new Date(), new Date(), false);
      }).toThrow('プロジェクトタイトルを入力してください');
    });

    it('直接constructorで正常なプロジェクトを作成できる', () => {
      const now = new Date();
      const project = new Project('test-id', 'テストタイトル', 'folder-123', 'genre-456', now, now, true);

      expect(project.id).toBe('test-id');
      expect(project.title).toBe('テストタイトル');
      expect(project.folderId).toBe('folder-123');
      expect(project.genreId).toBe('genre-456');
      expect(project.createdAt).toBe(now);
      expect(project.updatedAt).toBe(now);
      expect(project.isDeleted).toBe(true);
    });
  });

  describe('setGenre', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('テストプロジェクト');
    });

    it('プロジェクトにジャンルを設定できる', () => {
      const genreId = 'genre-123';
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.setGenre(genreId);

        expect(project.genreId).toBe(genreId);
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('プロジェクトからジャンルを削除できる', () => {
      project.setGenre('genre-123');
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.setGenre(); // undefinedを渡す

        expect(project.genreId).toBeUndefined();
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('同じジャンルIDでも更新日時は更新される', () => {
      project.setGenre('genre-123');
      const oldUpdatedAt = project.updatedAt;

      setTimeout(() => {
        project.setGenre('genre-123');

        expect(project.genreId).toBe('genre-123');
        expect(project.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });
  });

  describe('状態遷移', () => {
    let project: Project;

    beforeEach(() => {
      project = Project.create('テストプロジェクト');
    });

    it('作成→削除→復元の流れが正しく動作する', () => {
      expect(project.isDeleted).toBe(false);

      project.softDelete();
      expect(project.isDeleted).toBe(true);

      project.restore();
      expect(project.isDeleted).toBe(false);
    });

    it('フォルダ移動と削除は独立して動作する', () => {
      project.moveToFolder('folder-123');
      project.softDelete();

      expect(project.folderId).toBe('folder-123');
      expect(project.isDeleted).toBe(true);

      project.restore();
      expect(project.folderId).toBe('folder-123');
      expect(project.isDeleted).toBe(false);
    });

    it('ジャンル設定、フォルダ移動、削除は独立して動作する', () => {
      project.setGenre('genre-123');
      project.moveToFolder('folder-456');
      project.softDelete();

      expect(project.genreId).toBe('genre-123');
      expect(project.folderId).toBe('folder-456');
      expect(project.isDeleted).toBe(true);

      project.restore();
      expect(project.genreId).toBe('genre-123');
      expect(project.folderId).toBe('folder-456');
      expect(project.isDeleted).toBe(false);
    });
  });
});