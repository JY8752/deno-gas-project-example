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

function setPropertoes() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const userProperties = PropertiesService.getUserProperties();

  userProperties.setProperty("GITHUB_TOKEN", "");
  scriptProperties.setProperty("GITHUB_USERNAME", "");
  scriptProperties.setProperty("GITHUB_ORG", "");
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

  // GASのスクリプトプロパティ
  const scriptProperties = PropertiesService.getScriptProperties();
  // GASのユーザープロパティ
  const userProperties = PropertiesService.getUserProperties();

  const token = userProperties.getProperty("GITHUB_TOKEN");
  const username = scriptProperties.getProperty("GITHUB_USERNAME");
  const org = scriptProperties.getProperty("GITHUB_ORG");

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
