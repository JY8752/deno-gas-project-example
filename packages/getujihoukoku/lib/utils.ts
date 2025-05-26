// 指定月の開始日と終了日を取得する関数
export function getMonthRange(
  year: number,
  month: number
): { start: Date; end: Date } {
  const start = new Date(year, month - 1, 1); // 月は0-11なので1を引く
  const end = new Date(year, month, 0); // 次の月の0日 = 当月の末日
  end.setHours(23, 59, 59, 999); // 末日の終わりまで
  return { start, end };
}
