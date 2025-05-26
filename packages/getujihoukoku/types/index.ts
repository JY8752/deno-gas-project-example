export interface PullRequest {
  // PRタイトル
  title: string;
  // PRのURL
  html_url: string;
  // PR作成日
  created_at: string;
  // PRマージ日
  merged_at: string | null;
  // PR作成者
  user: {
    login: string;
  };
  // PRのリポジトリ
  base: {
    repo: {
      name: string;
      full_name: string;
    };
  };
}
