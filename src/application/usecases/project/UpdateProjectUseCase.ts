import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

export interface UpdateProjectInput {
  id: string;
  title?: string;
  folderId?: string;
  genreId?: string;
}

export class UpdateProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(input: UpdateProjectInput): Promise<void> {
    // 既存プロジェクトを取得
    const project = await this.projectRepository.findById(input.id);
    if (!project) {
      throw new Error(`Project not found: ${input.id}`);
    }

    // タイトル更新
    if (input.title !== undefined) {
      project.updateTitle(input.title);
    }

    // フォルダID更新（'folderId' in input で明示的に指定されたか判定）
    if ('folderId' in input) {
      project.moveToFolder(input.folderId);
    }

    // ジャンルID更新（'genreId' in input で明示的に指定されたか判定）
    if ('genreId' in input) {
      project.setGenre(input.genreId);
    }

    // 保存
    await this.projectRepository.save(project);
  }
}
