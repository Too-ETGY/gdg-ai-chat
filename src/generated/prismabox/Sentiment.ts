import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const Sentiment = t.Union(
  [t.Literal("NEGATIVE"), t.Literal("NEUTRAL"), t.Literal("POSITIVE")],
  { additionalProperties: false },
);
