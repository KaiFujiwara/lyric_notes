import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

export class DeleteProjectUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<void> {
    // 削除実行（論理削除）
    const deleted = await this.projectRepository.delete(id);

    if (!deleted) {
      throw new Error(`Project not found or already deleted: ${id}`);
    }
  }
}
