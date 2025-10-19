import { Project } from '@/src/domain/entities/Project';
import { ProjectRepository } from '@/src/data/repositories/ProjectRepository';

export class GetProjectsUseCase {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async execute(): Promise<Project[]> {
    return await this.projectRepository.findAll();
  }
}
