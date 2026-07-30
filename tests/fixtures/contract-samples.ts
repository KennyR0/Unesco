import {
  PublicQuestionSchema,
  RoundSizeSchema,
  ValidatedAliasSchema,
} from "@antidoto/contracts";

export const publicRef = "A1b2C3d4E5f6G7h8I9j0K1";

export const validQuestion = {
  ref: publicRef,
  mechanic: "single_choice" as const,
  prompt: "¿Qué ayuda a verificar una afirmación?",
  image: null,
  options: [
    { ref: "B1b2C3d4E5f6G7h8I9j0K2", label: "La fuente", position: 1 },
    { ref: "C1b2C3d4E5f6G7h8I9j0K3", label: "El rumor", position: 2 },
  ],
};

export const contractSamples = {
  alias: ValidatedAliasSchema.parse("Ana"),
  roundSize: RoundSizeSchema.parse(5),
  question: PublicQuestionSchema.parse(validQuestion),
};
