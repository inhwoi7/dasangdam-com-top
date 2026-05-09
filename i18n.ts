import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";

const locales = ["ko", "en"];

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(locales, requested) ? requested : "ko";

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});