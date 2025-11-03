import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import { Project } from '@/src/domain/entities/Project';
import { CreateProjectUseCase } from '@/src/application/usecases/project/CreateProjectUseCase';
import { GetProjectsUseCase } from '@/src/application/usecases/project/GetProjectsUseCase';
import { projectRepository } from '@/src/data/repositories/ProjectRepository';

// UseCaseインスタンス（シングルトン）
const createProjectUseCase = new CreateProjectUseCase(projectRepository);
const getProjectsUseCase = new GetProjectsUseCase(projectRepository);

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // プロジェクト一覧を取得
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getProjectsUseCase.execute();
      setProjects(result);
    } catch (error) {
      console.error('Failed to load projects:', error);
      Alert.alert('エラー', 'プロジェクトの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, []);

  // 新規プロジェクト作成
  const createProject = useCallback(async (title: string): Promise<boolean> => {
    if (!title.trim()) {
      Alert.alert('エラー', 'タイトルを入力してください');
      return false;
    }

    try {
      await createProjectUseCase.execute({ title: title.trim() });
      await loadProjects();
      return true;
    } catch (error) {
      console.error('Failed to create project:', error);
      Alert.alert('エラー', 'プロジェクトの作成に失敗しました');
      return false;
    }
  }, [loadProjects]);

  // 初回ロード
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return {
    projects,
    loading,
    loadProjects,
    createProject,
  };
}
