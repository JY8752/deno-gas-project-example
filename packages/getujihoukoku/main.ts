import type { PullRequest } from "./types/index.ts";
import { getGitHubPR } from "./lib/fetch.ts";
import {
  EXECUTE_SHEET_NAME,
  TEMPLATE_SHEET_NAME,
  createNewReportSheet,
  getSheet,
  getTargetNewSheetName,
  getYearAndMonth,
  writeDateRange,
  writePRsToSheet,
} from "./lib/sheet.ts";
import { Property } from "@my-gas-project/shared/property";

const userPropertyKey = ["GITHUB_TOKEN"] as const;
const scriptPropertyKey = ["GITHUB_USERNAME", "GITHUB_ORG"] as const;

function setPropertoes() {
  const property = new Property(userPropertyKey, scriptPropertyKey);

  property.setProperty("GITHUB_TOKEN", "");
  property.setProperty("GITHUB_USERNAME", "");
  property.setProperty("GITHUB_ORG", "");
}

function makeReport() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    "月次業務報告書の作成を開始します。",
    ui.ButtonSet.OK_CANCEL
  );

  if (result === ui.Button.CANCEL) {
    return;
  }

  // GASのプロパティ
  const property = new Property(userPropertyKey, scriptPropertyKey);

  const token = property.getProperty("GITHUB_TOKEN");
  const username = property.getProperty("GITHUB_USERNAME");
  const org = property.getProperty("GITHUB_ORG");

  if (!token || !username || !org) {
    throw new Error(
      "必要な設定が不足しています。以下のプロパティを設定してください：\n" +
        "- GITHUB_TOKEN\n" +
        "- GITHUB_USERNAME\n" +
        "- GITHUB_ORG"
    );
  }

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  // 実行シートの取得
  const executeSheet = getSheet(spreadsheet, EXECUTE_SHEET_NAME);

  // 実行シートから対象の年月を取得
  const { year, month } = getYearAndMonth(executeSheet);

  // 対象の年月のシート名を取得
  const targetSheetName = getTargetNewSheetName(spreadsheet, year, month);

  // テンプレートシートの取得
  const templateSheet = getSheet(spreadsheet, TEMPLATE_SHEET_NAME);

  // 対象の年月のPRを取得
  let prs: PullRequest[] = [];
  try {
    prs = getGitHubPR(year, month, {
      token,
      username,
      org,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(`Pull Requestの取得に失敗しました: ${error.message}`);
    }
  }

  // テンプレートシートから新しいシートを作成
  const newSheet = createNewReportSheet(
    spreadsheet,
    templateSheet,
    targetSheetName
  );

  // 日付の範囲を書き込む
  writeDateRange(newSheet, year, month);

  // PRの結果をスプレッドシートに書き込む
  writePRsToSheet(newSheet, prs);

  spreadsheet.toast("🎉 月次業務報告書の作成が完了しました", "", 5);
}

global.makeReport = makeReport;
global.setPropertoes = setPropertoes;
