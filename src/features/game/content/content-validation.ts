import { z } from "zod";

import {
  GAME_CODE_TO_MECHANIC,
  type GameCode,
} from "@antidoto/contracts";

import {
  GameCodeSchema,
  MechanicSchema,
  PublicFeedbackSchema,
  PublicItemSchema,
} from "../domain/schemas";

const NonEmptyIdentifierSchema = z
  .string()
  .min(1)
  .max(128)
  .refine((value) => value.trim().length > 0, "El identificador no puede estar vacío.");

export const ContentVersionSchema = NonEmptyIdentifierSchema.max(64);

export const EditorialStatusSchema = z.enum([
  "draft",
  "approved",
  "archived",
]);

const PrivateSolutionSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (solution) => Object.keys(solution).length > 0,
    "La solución privada debe conservar la regla de evaluación.",
  );

export const ContentItemSchema = z
  .object({
    itemId: NonEmptyIdentifierSchema,
    gameCode: GameCodeSchema,
    mechanic: MechanicSchema,
    sequence: z.number().int().positive(),
    contentVersion: ContentVersionSchema,
    editorialStatus: EditorialStatusSchema,
    publicItem: PublicItemSchema,
    feedback: PublicFeedbackSchema,
    solutionPrivate: PrivateSolutionSchema,
  })
  .strict()
  .superRefine((item, context) => {
    const expectedMechanic = GAME_CODE_TO_MECHANIC[item.gameCode];
    if (item.mechanic !== expectedMechanic) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mechanic"],
        message: "La mecánica no coincide con el gameCode.",
      });
    }

    if (item.publicItem.gameCode !== item.gameCode) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publicItem", "gameCode"],
        message: "El payload público no coincide con el gameCode del item.",
      });
    }

    if (item.publicItem.mechanic !== item.mechanic) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publicItem", "mechanic"],
        message: "El payload público no coincide con la mecánica del item.",
      });
    }

    if (item.publicItem.itemId !== item.itemId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["publicItem", "itemId"],
        message: "El payload público debe conservar el itemId editorial.",
      });
    }

    if (
      item.editorialStatus === "approved" &&
      item.feedback.revealedAnswer === null
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["feedback", "revealedAnswer"],
        message: "El contenido aprobado debe declarar la respuesta revelable.",
      });
    }
  });

export type StructuredContentItem = z.output<typeof ContentItemSchema>;

export const ContentCollectionSchema = z
  .array(ContentItemSchema)
  .superRefine((items, context) => {
    const groups = new Map<string, StructuredContentItem[]>();
    const seenItemIds = new Set<string>();

    for (const item of items) {
      const groupKey = `${item.contentVersion}\u0000${item.gameCode}`;
      const group = groups.get(groupKey) ?? [];
      group.push(item);
      groups.set(groupKey, group);

      const itemKey = `${item.contentVersion}\u0000${item.gameCode}\u0000${item.itemId}`;
      if (seenItemIds.has(itemKey)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["itemId"],
          message: "No se puede repetir itemId dentro de una versión y juego.",
        });
      }
      seenItemIds.add(itemKey);
    }

    for (const [groupKey, group] of groups) {
      const sequences = group.map((item) => item.sequence).sort((a, b) => a - b);
      const isContiguous = sequences.every(
        (sequence, index) => sequence === index + 1,
      );
      if (!isContiguous) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["sequence"],
          message: `La secuencia editorial debe ser contigua para ${groupKey}.`,
        });
      }
    }
  });

export function validateContentItem(input: unknown): StructuredContentItem {
  return ContentItemSchema.parse(input);
}

export function validateContentCollection(
  input: unknown,
): readonly StructuredContentItem[] {
  return ContentCollectionSchema.parse(input);
}

export function assertApprovedContent(
  item: StructuredContentItem,
): StructuredContentItem {
  if (item.editorialStatus !== "approved") {
    throw new Error(
      `CONTENT_UNAVAILABLE: el item ${item.itemId} no está aprobado para publicación.`,
    );
  }

  return item;
}

export function isContentGameCode(value: string): value is GameCode {
  return GameCodeSchema.safeParse(value).success;
}
