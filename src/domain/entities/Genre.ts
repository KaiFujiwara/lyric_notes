import { GenreName } from '../valueObjects/GenreName';

// ドメインエンティティ：Genre
export class Genre {
  constructor(
    public readonly id: string,
    public name: string,
    public templateSections: string[],
    public readonly isPreset: boolean,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    GenreName.create(name);
  }

  static create(
    name: string,
    templateSections: string[] = [],
    isPreset: boolean = false
  ): Genre {
    const validatedName = GenreName.create(name);
    const now = new Date();
    return new Genre(
      crypto.randomUUID(),
      validatedName.value,
      [...templateSections],
      isPreset,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = GenreName.create(name);
    this.name = validatedName.value;
    this.updatedAt = new Date();
  }

  updateTemplate(sections: string[]): void {
    this.templateSections = [...sections];
    this.updatedAt = new Date();
  }

  addTemplateSection(sectionName: string, index?: number): void {
    if (!sectionName || sectionName.trim() === '') {
      throw new Error('セクション名を入力してください');
    }

    const trimmedName = sectionName.trim();

    if (index !== undefined && index >= 0 && index <= this.templateSections.length) {
      this.templateSections.splice(index, 0, trimmedName);
    } else {
      this.templateSections.push(trimmedName);
    }

    this.updatedAt = new Date();
  }

  removeTemplateSection(index: number): void {
    if (index >= 0 && index < this.templateSections.length) {
      this.templateSections.splice(index, 1);
      this.updatedAt = new Date();
    }
  }

  moveTemplateSection(fromIndex: number, toIndex: number): void {
    if (fromIndex >= 0 && fromIndex < this.templateSections.length &&
        toIndex >= 0 && toIndex < this.templateSections.length) {

      const [section] = this.templateSections.splice(fromIndex, 1);
      this.templateSections.splice(toIndex, 0, section);
      this.updatedAt = new Date();
    }
  }

  getTemplateSectionCount(): number {
    return this.templateSections.length;
  }

  hasTemplate(): boolean {
    return this.templateSections.length > 0;
  }
}