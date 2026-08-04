import { ArcadeHome } from "../components/arcade/arcade-home";
import { getLocalizedCatalog } from "../lib/i18n/catalog-locale";
import { getServerLocale } from "../lib/i18n/server";

export default async function HomePage() {
  const locale = await getServerLocale();
  return <ArcadeHome games={getLocalizedCatalog(locale)} />;
}
