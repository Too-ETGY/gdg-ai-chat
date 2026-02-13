import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ComplaintResultPlain = t.Object(
  {
    id: t.Integer(),
    complaintId: t.Integer(),
    classification: __nullable__(t.String()),
    summary: __nullable__(t.String()),
    sentiment: __nullable__(
      t.Union(
        [t.Literal("NEGATIVE"), t.Literal("NEUTRAL"), t.Literal("POSITIVE")],
        { additionalProperties: false },
      ),
    ),
    createdAt: t.Date(),
    updatedAt: t.Date(),
  },
  { additionalProperties: false },
);

export const ComplaintResultRelations = t.Object(
  {
    complaint: t.Object(
      {
        id: t.Integer(),
        userId: t.Integer(),
        assignedAgentId: __nullable__(t.Integer()),
        status: t.Union(
          [t.Literal("OPEN"), t.Literal("IN_PROGRESS"), t.Literal("RESOLVED")],
          { additionalProperties: false },
        ),
        category: __nullable__(
          t.Union(
            [
              t.Literal("BUG"),
              t.Literal("PAYMENT"),
              t.Literal("ACCOUNT"),
              t.Literal("HARASSMENT"),
              t.Literal("OTHER"),
            ],
            { additionalProperties: false },
          ),
        ),
        priority: __nullable__(t.Integer()),
        createdAt: t.Date(),
        resolvedAt: __nullable__(t.Date()),
        resolvedByUserAt: __nullable__(t.Date()),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ComplaintResultPlainInputCreate = t.Object(
  {
    classification: t.Optional(__nullable__(t.String())),
    summary: t.Optional(__nullable__(t.String())),
    sentiment: t.Optional(
      __nullable__(
        t.Union(
          [t.Literal("NEGATIVE"), t.Literal("NEUTRAL"), t.Literal("POSITIVE")],
          { additionalProperties: false },
        ),
      ),
    ),
  },
  { additionalProperties: false },
);

export const ComplaintResultPlainInputUpdate = t.Object(
  {
    classification: t.Optional(__nullable__(t.String())),
    summary: t.Optional(__nullable__(t.String())),
    sentiment: t.Optional(
      __nullable__(
        t.Union(
          [t.Literal("NEGATIVE"), t.Literal("NEUTRAL"), t.Literal("POSITIVE")],
          { additionalProperties: false },
        ),
      ),
    ),
  },
  { additionalProperties: false },
);

export const ComplaintResultRelationsInputCreate = t.Object(
  {
    complaint: t.Object(
      {
        connect: t.Object(
          {
            id: t.Integer({ additionalProperties: false }),
          },
          { additionalProperties: false },
        ),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const ComplaintResultRelationsInputUpdate = t.Partial(
  t.Object(
    {
      complaint: t.Object(
        {
          connect: t.Object(
            {
              id: t.Integer({ additionalProperties: false }),
            },
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintResultWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          complaintId: t.Integer(),
          classification: t.String(),
          summary: t.String(),
          sentiment: t.Union(
            [
              t.Literal("NEGATIVE"),
              t.Literal("NEUTRAL"),
              t.Literal("POSITIVE"),
            ],
            { additionalProperties: false },
          ),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "ComplaintResult" },
  ),
);

export const ComplaintResultWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), complaintId: t.Integer() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [
            t.Object({ id: t.Integer() }),
            t.Object({ complaintId: t.Integer() }),
          ],
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object({
            AND: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            NOT: t.Union([
              Self,
              t.Array(Self, { additionalProperties: false }),
            ]),
            OR: t.Array(Self, { additionalProperties: false }),
          }),
          { additionalProperties: false },
        ),
        t.Partial(
          t.Object(
            {
              id: t.Integer(),
              complaintId: t.Integer(),
              classification: t.String(),
              summary: t.String(),
              sentiment: t.Union(
                [
                  t.Literal("NEGATIVE"),
                  t.Literal("NEUTRAL"),
                  t.Literal("POSITIVE"),
                ],
                { additionalProperties: false },
              ),
              createdAt: t.Date(),
              updatedAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "ComplaintResult" },
);

export const ComplaintResultSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      complaintId: t.Boolean(),
      classification: t.Boolean(),
      summary: t.Boolean(),
      sentiment: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      complaint: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintResultInclude = t.Partial(
  t.Object(
    { sentiment: t.Boolean(), complaint: t.Boolean(), _count: t.Boolean() },
    { additionalProperties: false },
  ),
);

export const ComplaintResultOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      complaintId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      classification: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      summary: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      updatedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintResult = t.Composite(
  [ComplaintResultPlain, ComplaintResultRelations],
  { additionalProperties: false },
);

export const ComplaintResultInputCreate = t.Composite(
  [ComplaintResultPlainInputCreate, ComplaintResultRelationsInputCreate],
  { additionalProperties: false },
);

export const ComplaintResultInputUpdate = t.Composite(
  [ComplaintResultPlainInputUpdate, ComplaintResultRelationsInputUpdate],
  { additionalProperties: false },
);
