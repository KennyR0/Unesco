import "server-only";

import type {
  GameCode,
  PublicFeedback,
  PublicItem,
} from "@antidoto/contracts";

import {
  assertApprovedContent,
  type StructuredContentItem,
  validateContentCollection,
} from "./content-validation";

const EMPTY_ITEMS: readonly StructuredContentItem[] = Object.freeze([]);

export type ContentRepositoryOptions = Readonly<{
  activeVersion?: string;
}>;

export interface ContentRepository {
  readonly activeVersion: string | null;
  listVersions(): readonly string[];
  listPublishedItems(
    gameCode: GameCode,
    contentVersion?: string,
  ): readonly StructuredContentItem[];
  getContentItem(
    gameCode: GameCode,
    itemId: string,
    contentVersion?: string,
  ): StructuredContentItem | null;
  getPublicItem(
    gameCode: GameCode,
    itemId: string,
    contentVersion?: string,
  ): PublicItem | null;
  getFeedback(
    gameCode: GameCode,
    itemId: string,
    contentVersion?: string,
  ): PublicFeedback | null;
  getNextItem(
    gameCode: GameCode,
    sequence: number,
    contentVersion?: string,
  ): StructuredContentItem | null;
}

export function createContentRepository(
  input: unknown,
  options: ContentRepositoryOptions = {},
): ContentRepository {
  const validatedItems = validateContentCollection(input);
  const versions = Array.from(
    new Set(validatedItems.map((item) => item.contentVersion)),
  ).sort();

  if (
    options.activeVersion !== undefined &&
    !versions.includes(options.activeVersion)
  ) {
    throw new Error(
      `CONTENT_VERSION_NOT_FOUND: no existe ${options.activeVersion}.`,
    );
  }

  const activeVersion =
    options.activeVersion ?? versions.at(-1) ?? null;
  const publishedByVersion = new Map<
    string,
    Map<GameCode, readonly StructuredContentItem[]>
  >();

  for (const version of versions) {
    const itemsByGame = new Map<GameCode, StructuredContentItem[]>();
    const versionItems = validatedItems.filter(
      (item) =>
        item.contentVersion === version && item.editorialStatus === "approved",
    );

    for (const item of versionItems) {
      const approvedItem = assertApprovedContent(item);
      const gameItems = itemsByGame.get(approvedItem.gameCode) ?? [];
      gameItems.push(approvedItem);
      itemsByGame.set(approvedItem.gameCode, gameItems);
    }

    const frozenItemsByGame = new Map<
      GameCode,
      readonly StructuredContentItem[]
    >();
    for (const [gameCode, items] of itemsByGame) {
      frozenItemsByGame.set(
        gameCode,
        Object.freeze([...items].sort((left, right) => left.sequence - right.sequence)),
      );
    }
    publishedByVersion.set(version, frozenItemsByGame);
  }

  function resolveVersion(contentVersion?: string): string | null {
    const selectedVersion = contentVersion ?? activeVersion;
    if (selectedVersion === null || !versions.includes(selectedVersion)) {
      return null;
    }
    return selectedVersion;
  }

  function listPublishedItems(
    gameCode: GameCode,
    contentVersion?: string,
  ): readonly StructuredContentItem[] {
    const version = resolveVersion(contentVersion);
    return version === null
      ? EMPTY_ITEMS
      : publishedByVersion.get(version)?.get(gameCode) ?? EMPTY_ITEMS;
  }

  function getContentItem(
    gameCode: GameCode,
    itemId: string,
    contentVersion?: string,
  ): StructuredContentItem | null {
    return (
      listPublishedItems(gameCode, contentVersion).find(
        (item) => item.itemId === itemId,
      ) ?? null
    );
  }

  return {
    activeVersion,
    listVersions: () => Object.freeze([...versions]),
    listPublishedItems,
    getContentItem,
    getPublicItem: (gameCode, itemId, contentVersion) =>
      getContentItem(gameCode, itemId, contentVersion)?.publicItem ?? null,
    getFeedback: (gameCode, itemId, contentVersion) =>
      getContentItem(gameCode, itemId, contentVersion)?.feedback ?? null,
    getNextItem: (gameCode, sequence, contentVersion) =>
      listPublishedItems(gameCode, contentVersion).find(
        (item) => item.sequence > sequence,
      ) ?? null,
  };
}
