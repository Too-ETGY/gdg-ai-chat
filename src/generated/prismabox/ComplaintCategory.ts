import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ComplaintCategory = t.Union(
  [
    t.Literal("BUG"),
    t.Literal("PAYMENT"),
    t.Literal("ACCOUNT"),
    t.Literal("HARASSMENT"),
    t.Literal("OTHER"),
  ],
  { additionalProperties: false },
);
