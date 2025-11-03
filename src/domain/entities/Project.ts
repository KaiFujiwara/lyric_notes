import { ProjectTitle } from '../valueObjects/ProjectTitle';
import * as Crypto from 'expo-crypto';

export class Project {
  constructor(
    public readonly id: string,
    public title: string,
    public folderId?: string,
    public genreId?: string,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
    public isDeleted: boolean = false
  ) {
    ProjectTitle.create(title);
  }

  static create(title: string, folderId?: string, genreId?: string): Project {
    const validatedTitle = ProjectTitle.create(title);
    const now = new Date();
    return new Project(
      Crypto.randomUUID(),
      validatedTitle.value,
      folderId,
      genreId,
      now,
      now,
      false
    );
  }

  updateTitle(title: string): void {
    const validatedTitle = ProjectTitle.create(title);
    this.title = validatedTitle.value;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.isDeleted = true;
    this.updatedAt = new Date();
  }

  restore(): void {
    this.isDeleted = false;
    this.updatedAt = new Date();
  }

  moveToFolder(folderId?: string): void {
    this.folderId = folderId;
    this.updatedAt = new Date();
  }

  setGenre(genreId?: string): void {
    this.genreId = genreId;
    this.updatedAt = new Date();
  }
}