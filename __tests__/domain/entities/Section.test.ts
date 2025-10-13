import { Section } from '@/src/domain/entities/Section';

describe('Section', () => {
  const testProjectId = 'project-123';

  describe('create', () => {
    it('正常な名前でセクションを作成できる', () => {
      const section = Section.create(testProjectId, 'Aメロ');

      expect(section.id).toBeDefined();
      expect(section.projectId).toBe(testProjectId);
      expect(section.name).toBe('Aメロ');
      expect(section.orderIndex).toBe(0);
      expect(section.createdAt).toBeInstanceOf(Date);
      expect(section.updatedAt).toBeInstanceOf(Date);
    });

    it('orderIndexを指定してセクションを作成できる', () => {
      const section = Section.create(testProjectId, 'サビ', 2);

      expect(section.name).toBe('サビ');
      expect(section.orderIndex).toBe(2);
    });

    it('名前が空文字の場合はエラーをスローする', () => {
      expect(() => {
        Section.create(testProjectId, '');
      }).toThrow('セクション名を入力してください');
    });

    it('名前が空白のみの場合はエラーをスローする', () => {
      expect(() => {
        Section.create(testProjectId, '   ');
      }).toThrow('セクション名を入力してください');
    });

    it('名前がnullの場合はエラーをスローする', () => {
      expect(() => {
        Section.create(testProjectId, null as any);
      }).toThrow('セクション名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      const section = Section.create(testProjectId, '  Bメロ  ');

      expect(section.name).toBe('Bメロ');
    });

    it('様々なセクション名を自由に設定できる', () => {
      const sectionNames = [
        'イントロ',
        'Aメロ',
        'Bメロ',
        'サビ',
        '大サビ',
        '間奏',
        'ブリッジ',
        'アウトロ',
        'Verse 1',
        'Chorus',
        'Pre-Chorus',
        'Hook',
        'Drop',
        'Build-up',
        '導入部',
        '主題',
        '展開部',
        '再現部',
        'カスタムセクション1',
        'セクションA'
      ];

      sectionNames.forEach(name => {
        const section = Section.create(testProjectId, name);
        expect(section.name).toBe(name);
      });
    });

    it('日本語と英語の混合名も設定できる', () => {
      const section = Section.create(testProjectId, 'Aメロ(English Ver.)');

      expect(section.name).toBe('Aメロ(English Ver.)');
    });

    it('記号を含む名前も設定できる', () => {
      const section = Section.create(testProjectId, 'サビ-1【リピート】');

      expect(section.name).toBe('サビ-1【リピート】');
    });
  });

  describe('updateName', () => {
    let section: Section;

    beforeEach(() => {
      section = Section.create(testProjectId, '元の名前');
    });

    it('名前を正常に更新できる', () => {
      const oldUpdatedAt = section.updatedAt;

      setTimeout(() => {
        section.updateName('新しい名前');

        expect(section.name).toBe('新しい名前');
        expect(section.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('空文字での更新はエラーをスローする', () => {
      expect(() => {
        section.updateName('');
      }).toThrow('セクション名を入力してください');
    });

    it('空白のみでの更新はエラーをスローする', () => {
      expect(() => {
        section.updateName('   ');
      }).toThrow('セクション名を入力してください');
    });

    it('前後の空白は自動でトリムされる', () => {
      section.updateName('  新しい名前  ');

      expect(section.name).toBe('新しい名前');
    });

    it('同じ名前に更新してもエラーにならない', () => {
      const originalName = section.name;
      section.updateName(originalName);

      expect(section.name).toBe(originalName);
    });
  });

  describe('reorder', () => {
    let section: Section;

    beforeEach(() => {
      section = Section.create(testProjectId, 'テストセクション', 1);
    });

    it('orderIndexを正常に更新できる', () => {
      const oldUpdatedAt = section.updatedAt;

      setTimeout(() => {
        section.reorder(5);

        expect(section.orderIndex).toBe(5);
        expect(section.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
      }, 1);
    });

    it('orderIndexに0を設定できる', () => {
      section.reorder(0);

      expect(section.orderIndex).toBe(0);
    });

    it('orderIndexに負の値を設定できる', () => {
      section.reorder(-1);

      expect(section.orderIndex).toBe(-1);
    });

    it('大きな値も設定できる', () => {
      section.reorder(999);

      expect(section.orderIndex).toBe(999);
    });
  });

  describe('constructor', () => {
    it('直接constructorを呼ぶ場合も名前バリデーションが働く', () => {
      expect(() => {
        new Section('test-id', testProjectId, '', 0, new Date(), new Date());
      }).toThrow('セクション名を入力してください');
    });

    it('直接constructorで正常なセクションを作成できる', () => {
      const now = new Date();
      const section = new Section('test-id', testProjectId, 'テストセクション', 2, now, now);

      expect(section.id).toBe('test-id');
      expect(section.projectId).toBe(testProjectId);
      expect(section.name).toBe('テストセクション');
      expect(section.orderIndex).toBe(2);
      expect(section.createdAt).toBe(now);
      expect(section.updatedAt).toBe(now);
    });
  });

  describe('プロジェクトID管理', () => {
    it('projectIdは読み取り専用で変更できない', () => {
      const section = Section.create(testProjectId, 'テストセクション');
      const originalProjectId = section.projectId;

      // TypeScriptのreadonly制約により、以下はコンパイルエラーになるはず
      // section.projectId = 'new-project-id';

      expect(section.projectId).toBe(originalProjectId);
    });

    it('異なるプロジェクトIDで複数のセクションを作成できる', () => {
      const section1 = Section.create('project-1', 'Aメロ');
      const section2 = Section.create('project-2', 'Aメロ');

      expect(section1.projectId).toBe('project-1');
      expect(section2.projectId).toBe('project-2');
      expect(section1.name).toBe(section2.name);
      expect(section1.id).not.toBe(section2.id);
    });
  });

  describe('セクション順序管理', () => {
    it('複数のセクションに異なる順序を設定できる', () => {
      const sections = [
        Section.create(testProjectId, 'イントロ', 0),
        Section.create(testProjectId, 'Aメロ', 1),
        Section.create(testProjectId, 'Bメロ', 2),
        Section.create(testProjectId, 'サビ', 3),
        Section.create(testProjectId, 'アウトロ', 4)
      ];

      sections.forEach((section, index) => {
        expect(section.orderIndex).toBe(index);
      });

      // 順序変更
      sections[2].reorder(4);
      sections[4].reorder(2);

      expect(sections[2].orderIndex).toBe(4); // Bメロ
      expect(sections[4].orderIndex).toBe(2); // アウトロ
    });
  });
});