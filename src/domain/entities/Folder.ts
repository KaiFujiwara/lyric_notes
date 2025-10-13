import { FolderName } from '../valueObjects/FolderName';

export class Folder {
  constructor(
    public readonly id: string,
    public name: string,
    public orderIndex: number,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date()
  ) {
    FolderName.create(name);
  }

  static create(
    name: string,
    orderIndex: number = 0
  ): Folder {
    const validatedName = FolderName.create(name);
    const now = new Date();
    return new Folder(
      crypto.randomUUID(),
      validatedName.value,
      orderIndex,
      now,
      now
    );
  }

  updateName(name: string): void {
    const validatedName = FolderName.create(name);
    this.name = validatedName.value;
    this.updatedAt = new Date();
  }

  reorder(newIndex: number): void {
    this.orderIndex = newIndex;
    this.updatedAt = new Date();
  }
}