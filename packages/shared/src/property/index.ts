export class Property<
  UserPropertyKeys extends readonly string[],
  ScriptPropertyKeys extends readonly string[]
> {
  #scriptProperties: GoogleAppsScript.Properties.Properties;
  #userProperties: GoogleAppsScript.Properties.Properties;
  #userPropertyKeys: UserPropertyKeys;
  #_scriptPropertyKeys: ScriptPropertyKeys;

  constructor(
    userPropertyKeys: UserPropertyKeys,
    scriptPropertyKeys: ScriptPropertyKeys
  ) {
    // TODO: UserPropertyのkeyとScriptPropertyのkeyの重複チェックをしてもいいかもしれない
    this.#scriptProperties = PropertiesService.getScriptProperties();
    this.#userProperties = PropertiesService.getUserProperties();
    this.#userPropertyKeys = userPropertyKeys;
    this.#_scriptPropertyKeys = scriptPropertyKeys;
  }

  setProperty(
    key: UserPropertyKeys[number] | ScriptPropertyKeys[number],
    value: string
  ) {
    if (this.#isUserPropertyKey(key)) {
      this.#userProperties.setProperty(key, value);
    } else {
      this.#scriptProperties.setProperty(key, value);
    }
  }

  getProperty(key: UserPropertyKeys[number] | ScriptPropertyKeys[number]) {
    if (this.#isUserPropertyKey(key)) {
      return this.#userProperties.getProperty(key);
    } else {
      return this.#scriptProperties.getProperty(key);
    }
  }

  #isUserPropertyKey(
    key: UserPropertyKeys[number] | ScriptPropertyKeys[number]
  ): key is UserPropertyKeys[number] {
    return this.#userPropertyKeys.some((userKey) => userKey === key);
  }
}
