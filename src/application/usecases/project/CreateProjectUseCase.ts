import { Project } from '@/src/domain/entities/Project';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

export interface CreateProjectInput {
  title: string;
  folderId?: string;
  genreId?: string;
}

export class CreateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: CreateProjectInput): Promise<string> {
    // タイトルのバリデーション（Project.createで自動的に行われる）
    const project = Project.create(
      input.title,
      input.folderId,
      input.genreId
    );

    // 保存
    await this.projectRepository.save(project);

    return project.id;
  }
}
