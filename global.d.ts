// ref: https://scrapbox.io/takker/Deno%E3%81%A7Google_Apps_Script%E3%82%92%E4%BD%BF%E3%81%86
/// <reference types="https://raw.githubusercontent.com/takker99/deno-gas-types/main/mod.d.ts" />

// ref: https://github.com/proudust/gas-deno-starter/blob/master/main.ts
declare let global: {
  doGet: (
    e?: GoogleAppsScript.Events.DoGet
  ) => GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  doPost: (
    e?: GoogleAppsScript.Events.DoPost
  ) => GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
};
