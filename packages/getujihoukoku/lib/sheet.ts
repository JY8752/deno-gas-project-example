import type { PullRequest } from "../types/index.ts";

export const EXECUTE_SHEET_NAME = "月次業務報告書の作成" as const;
export const TEMPLATE_SHEET_NAME = "テンプレート" as const;

export function getSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  name: string
) {
  const sheet = spreadsheet.getSheetByName(name);
  if (!sheet) {
    throw new Error(`${name}シートが見つかりません`);
  }
  return sheet;
}

export function getYearAndMonth(sheet: GoogleAppsScript.Spreadsheet.Sheet) {
  // B1セルから年を取得
  const yearCell = sheet.getRange("E3");
  const year = yearCell.getValue();

  // B2セルから月を取得
  const monthCell = sheet.getRange("E5");
  const month = monthCell.getValue();

  if (!year || !month || isNaN(Number(year)) || isNaN(Number(month))) {
    throw new Error(
      "年月の値が不正です。B1セルに年、B2セルに月を入力してください"
    );
  }

  const numYear = Number(year);
  const numMonth = Number(month);

  if (numMonth < 1 || numMonth > 12) {
    throw new Error("月は1から12の間で入力してください");
  }

  if (numYear < 2000 || numYear > 2100) {
    throw new Error("年は2000から2100の間で入力してください");
  }

  return { year: numYear, month: numMonth };
}

export function getTargetNewSheetName(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  year: number,
  month: number
) {
  let targetSheetName = `${year}年${month}月`;
  let counter = 0;

  // シートがすでに存在する場合は別名でテンプレートシートからシートを作成
  while (spreadsheet.getSheetByName(targetSheetName)) {
    counter++;
    targetSheetName = `${year}年${month}月 - (${counter})`;
  }

  return targetSheetName;
}

export function createNewReportSheet(
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet,
  templateSheet: GoogleAppsScript.Spreadsheet.Sheet,
  targetSheetName: string
) {
  // テンプレートシートをtargetSheetNameのシート名でコピー
  const newSheet = templateSheet.copyTo(spreadsheet);
  newSheet.setName(targetSheetName);

  // 作ったシートを移動
  spreadsheet.setActiveSheet(newSheet);
  spreadsheet.moveActiveSheet(3);

  return newSheet;
}

export function writePRsToSheet(
  newSheet: GoogleAppsScript.Spreadsheet.Sheet,
  prs: PullRequest[]
) {
  newSheet
    .getRange("A31:F31")
    .setValues([
      ["タイトル", "URL", "作成日", "マージ日", "作成者", "リポジトリ名"],
    ]);

  newSheet.getRange("A11:B11").setValues([["作業内容", "作業時間"]]);

  if (prs.length > 0) {
    const values = prs.map((pr) => [
      pr.title,
      pr.html_url,
      pr.created_at,
      pr.merged_at || "",
      pr.user.login,
      pr.base.repo.full_name,
    ]);
    newSheet.getRange(32, 1, values.length, 6).setValues(values);

    // 列幅の自動調整
    newSheet.autoResizeColumns(1, 6);
  }
}

export function writeDateRange(
  newSheet: GoogleAppsScript.Spreadsheet.Sheet,
  year: number,
  month: number
) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const startDateCell = newSheet.getRange("B4");
  const endDateCell = newSheet.getRange("D4");

  startDateCell.setValue(
    Utilities.formatDate(startDate, "JST", "yyyy年MM月dd日")
  );
  endDateCell.setValue(Utilities.formatDate(endDate, "JST", "yyyy年MM月dd日"));
}
