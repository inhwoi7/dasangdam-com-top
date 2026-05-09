import DrumMachine from "@/components/drum/DrumMachine";
import PowerballMachine from "@/components/drum/PowerballMachine";
import { getLocale } from "next-intl/server";

export default async function LuckyPage() {
  const locale = await getLocale();
  return locale === "en" ? <PowerballMachine /> : <DrumMachine />;
}
