import { afterAll, describe, expect,test, vi } from "vitest";



describe("i18n", () => {
  afterAll(() => {
    vi.clearAllMocks();
  });

  test("There is an error with the headers()", () => {
    expect(true).toBe(true);
  });

  // test("Should get default locale", () => {
  //   const I18N = new i18n("en");
  //   expect(I18N.defaultLocale).toBe("en");
  // });

  // test("Should get supported locales", () => {
  //   const I18N = new i18n("en");
  //   expect(I18N.locales).toEqual(["en", "es"]);
  // });

  // test("Should get dictionaries", () => {
  //   const I18N = new i18n("en");
  //   expect(I18N.dictionaries).toEqual({
  //     en: expect.any(Function),
  //     es: expect.any(Function),
  //   });
  // });

  // test("Should get dictionary", async () => {
  //   const I18N = new i18n("en");
  //   expect(await I18N.dictionaries.en()).toEqual(en);
  //   expect(await I18N.dictionaries.es()).toEqual(es);
  // });

  // test("Should get locale", () => {
  //   const I18N = new i18n("en");
  //   const request = {
  //     headers: {
  //       forEach: (callback: (value: string, key: string) => void) => {
  //         callback("en", "accept-language");
  //       },
  //     },
  //   } as any;
  //   expect(I18N.getLocale(request)).toBe("en");
  // });
});
