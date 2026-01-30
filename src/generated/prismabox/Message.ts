import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const MessagePlain = t.Object(
  {
    id: t.Integer(),
    complaintId: t.Integer(),
    senderId: t.Integer(),
    senderRole: t.Union([t.Literal("USER"), t.Literal("AGENT")], {
      additionalProperties: false,
    }),
    content: t.String(),
    createdAt: t.Date(),
  },
  { additionalProperties: false },
);

export const MessageRelations = t.Object(
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
    sender: t.Object(
      {
        id: t.Integer(),
        email: t.String(),
        passwordHash: t.String(),
        role: t.Union(
          [t.Literal("USER"), t.Literal("AGENT"), t.Literal("LEAD_AGENT")],
          { additionalProperties: false },
        ),
        birthDate: t.Date(),
        gender: t.Union([t.Literal("MALE"), t.Literal("FEMALE")], {
          additionalProperties: false,
        }),
        createdAt: t.Date(),
        updatedAt: t.Date(),
      },
      { additionalProperties: false },
    ),
  },
  { additionalProperties: false },
);

export const MessagePlainInputCreate = t.Object(
  {
    senderRole: t.Union([t.Literal("USER"), t.Literal("AGENT")], {
      additionalProperties: false,
    }),
    content: t.String(),
  },
  { additionalProperties: false },
);

export const MessagePlainInputUpdate = t.Object(
  {
    senderRole: t.Optional(
      t.Union([t.Literal("USER"), t.Literal("AGENT")], {
        additionalProperties: false,
      }),
    ),
    content: t.Optional(t.String()),
  },
  { additionalProperties: false },
);

export const MessageRelationsInputCreate = t.Object(
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
    sender: t.Object(
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

export const MessageRelationsInputUpdate = t.Partial(
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
      sender: t.Object(
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

export const MessageWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          complaintId: t.Integer(),
          senderId: t.Integer(),
          senderRole: t.Union([t.Literal("USER"), t.Literal("AGENT")], {
            additionalProperties: false,
          }),
          content: t.String(),
          createdAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Message" },
  ),
);

export const MessageWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object({ id: t.Integer() }, { additionalProperties: false }),
          { additionalProperties: false },
        ),
        t.Union([t.Object({ id: t.Integer() })], {
          additionalProperties: false,
        }),
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
              senderId: t.Integer(),
              senderRole: t.Union([t.Literal("USER"), t.Literal("AGENT")], {
                additionalProperties: false,
              }),
              content: t.String(),
              createdAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Message" },
);

export const MessageSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      complaintId: t.Boolean(),
      senderId: t.Boolean(),
      senderRole: t.Boolean(),
      content: t.Boolean(),
      createdAt: t.Boolean(),
      complaint: t.Boolean(),
      sender: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MessageInclude = t.Partial(
  t.Object(
    {
      senderRole: t.Boolean(),
      complaint: t.Boolean(),
      sender: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const MessageOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      complaintId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      senderId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      content: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Message = t.Composite([MessagePlain, MessageRelations], {
  additionalProperties: false,
});

export const MessageInputCreate = t.Composite(
  [MessagePlainInputCreate, MessageRelationsInputCreate],
  { additionalProperties: false },
);

export const MessageInputUpdate = t.Composite(
  [MessagePlainInputUpdate, MessageRelationsInputUpdate],
  { additionalProperties: false },
);
