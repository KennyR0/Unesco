import { ArcadeHome } from "../components/arcade/arcade-home";
import { listAvailableArcadeCatalog } from "../features/game/content/catalog";

export default function HomePage() {
  return <ArcadeHome games={listAvailableArcadeCatalog()} />;
}
