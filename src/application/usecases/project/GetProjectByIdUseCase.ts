import { Project } from '@/src/domain/entities/Project';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

export class GetProjectByIdUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(id: string): Promise<Project | null> {
    return await this.projectRepository.findById(id);
  }
}
