import { SectionName } from '../valueObjects/SectionName';

// ドメインエンティティ：Section
export class Section {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public name: string,
    public orderIndex: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    SectionName.create(name);
  }

  static create(
    projectId: string,
    name: string,
    orderIndex: number = 0
  ): Section {
    const validatedName = SectionName.create(name);
    const now = new Date();
    return new Section(
      crypto.randomUUID(),
      projectId,
      validatedName.value,
      orderIndex,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = SectionName.create(name);
    this.name = validatedName.value;
    this.updatedAt = new Date();
  }

  reorder(newIndex: number): void {
    this.orderIndex = newIndex;
    this.updatedAt = new Date();
  }
}