import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ComplaintStatus = t.Union(
  [t.Literal("OPEN"), t.Literal("IN_PROGRESS"), t.Literal("RESOLVED")],
  { additionalProperties: false },
);
