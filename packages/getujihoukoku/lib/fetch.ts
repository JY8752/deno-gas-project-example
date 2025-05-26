import type { PullRequest } from "../types/index.ts";
import { getMonthRange } from "./utils.ts";

// GitHub APIリクエストを実行する関数
function makeGitHubRequest(url: string, token: string): PullRequest[] {
  const response = UrlFetchApp.fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "GitHub-PR-Fetcher-GAS",
    },
    muteHttpExceptions: true, // エラーレスポンスを例外としてスローしない
  });

  const responseCode = response.getResponseCode();
  if (responseCode !== 200) {
    throw new Error(
      `GitHub API error: ${responseCode} ${response.getContentText()}`
    );
  }

  return JSON.parse(response.getContentText());
}

// 特定の月のマージ済みPRを取得する関数
function getMergedPRsFromRepo(
  owner: string,
  repo: string,
  username: string,
  token: string,
  year: number,
  month: number
): PullRequest[] {
  const { start, end } = getMonthRange(year, month);
  let allPRs: PullRequest[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.github.com/repos/${owner}/${repo}/pulls?state=closed&sort=updated&direction=desc&per_page=100&page=${page}`;

    try {
      const data: PullRequest[] = makeGitHubRequest(url, token);

      if (data.length === 0) {
        hasMore = false;
        continue;
      }

      // 自分のマージ済みPRで指定月のものをフィルタ
      const filteredPRs = data.filter(
        (pr) =>
          pr.merged_at &&
          pr.user.login === username &&
          new Date(pr.merged_at) >= start &&
          new Date(pr.merged_at) <= end
      );

      allPRs = [...allPRs, ...filteredPRs];

      // 指定月より前のPRが出てきたら終了
      const hasOldPR = data.some(
        (pr) => pr.merged_at && new Date(pr.merged_at) < start
      );

      if (hasOldPR || data.length < 100) {
        hasMore = false;
      } else {
        page++;
      }

      // レート制限対策
      Utilities.sleep(100);
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);
      hasMore = false;
    }
  }

  return allPRs.sort(
    (a, b) =>
      new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime()
  );
}

// organizationの全リポジトリを取得する関数
function getOrgRepos(org: string, token: string): { name: string }[] {
  let allRepos: { name: string }[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const url = `https://api.github.com/orgs/${org}/repos?type=all&visibility=all&per_page=100&page=${page}`;
    const response = UrlFetchApp.fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "GitHub-PR-Fetcher-GAS",
      },
      muteHttpExceptions: true,
    });

    const responseCode = response.getResponseCode();
    if (responseCode !== 200) {
      throw new Error(
        `GitHub API error: ${responseCode} ${response.getContentText()}`
      );
    }

    const repos = JSON.parse(response.getContentText());

    if (repos.length === 0) {
      hasMore = false;
      continue;
    }

    allRepos = [...allRepos, ...repos];

    if (repos.length < 100) {
      hasMore = false;
    } else {
      page++;
    }

    // レート制限対策
    Utilities.sleep(100);
  }

  return allRepos;
}

export function getGitHubPR(
  year: number,
  month: number,
  params: {
    org: string;
    token: string;
    username: string;
  }
): PullRequest[] {
  console.log(
    `🔍 ${params.org} の全リポジトリから ${year}年${month}月 のマージ済みPRを取得中...`
  );

  const repos = getOrgRepos(params.org, params.token);
  console.log(`📚 ${repos.length}個のリポジトリが見つかりました`);

  let allPRs: PullRequest[] = [];

  for (const repo of repos) {
    console.log(`\n🔍 ${params.org}/${repo.name} を検索中...`);
    try {
      const prs = getMergedPRsFromRepo(
        params.org,
        repo.name,
        params.username,
        params.token,
        year,
        month
      );
      if (prs.length > 0) {
        console.log(`✅ ${prs.length}件のPRが見つかりました`);
        allPRs = [...allPRs, ...prs];
      }
    } catch (error) {
      console.error(`⚠️ ${repo.name}の検索中にエラーが発生しました:`, error);
      continue;
    }
  }

  // マージ日時でソート
  allPRs.sort(
    (a, b) =>
      new Date(b.merged_at!).getTime() - new Date(a.merged_at!).getTime()
  );

  if (allPRs.length > 0) {
    console.log(`\n✅ 取得完了！合計${allPRs.length}件のPRが見つかりました`);
  } else {
    console.log("\n💡 該当するPRが見つかりませんでした。");
  }

  return allPRs;
}
