import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const ComplaintPlain = t.Object(
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
);

export const ComplaintRelations = t.Object(
  {
    user: t.Object(
      {
        id: t.Integer(),
        name: t.String(),
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
    assignedAgent: __nullable__(
      t.Object(
        {
          id: t.Integer(),
          name: t.String(),
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
    ),
    messages: t.Array(
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
      { additionalProperties: false },
    ),
    result: __nullable__(
      t.Object(
        {
          id: t.Integer(),
          complaintId: t.Integer(),
          classification: __nullable__(t.String()),
          summary: __nullable__(t.String()),
          sentiment: __nullable__(
            t.Union(
              [
                t.Literal("NEGATIVE"),
                t.Literal("NEUTRAL"),
                t.Literal("POSITIVE"),
              ],
              { additionalProperties: false },
            ),
          ),
          createdAt: t.Date(),
          updatedAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    ),
  },
  { additionalProperties: false },
);

export const ComplaintPlainInputCreate = t.Object(
  {
    status: t.Optional(
      t.Union(
        [t.Literal("OPEN"), t.Literal("IN_PROGRESS"), t.Literal("RESOLVED")],
        { additionalProperties: false },
      ),
    ),
    category: t.Optional(
      __nullable__(
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
    ),
    priority: t.Optional(__nullable__(t.Integer())),
    resolvedAt: t.Optional(__nullable__(t.Date())),
    resolvedByUserAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const ComplaintPlainInputUpdate = t.Object(
  {
    status: t.Optional(
      t.Union(
        [t.Literal("OPEN"), t.Literal("IN_PROGRESS"), t.Literal("RESOLVED")],
        { additionalProperties: false },
      ),
    ),
    category: t.Optional(
      __nullable__(
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
    ),
    priority: t.Optional(__nullable__(t.Integer())),
    resolvedAt: t.Optional(__nullable__(t.Date())),
    resolvedByUserAt: t.Optional(__nullable__(t.Date())),
  },
  { additionalProperties: false },
);

export const ComplaintRelationsInputCreate = t.Object(
  {
    user: t.Object(
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
    assignedAgent: t.Optional(
      t.Object(
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
    ),
    messages: t.Optional(
      t.Object(
        {
          connect: t.Array(
            t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            { additionalProperties: false },
          ),
        },
        { additionalProperties: false },
      ),
    ),
    result: t.Optional(
      t.Object(
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
    ),
  },
  { additionalProperties: false },
);

export const ComplaintRelationsInputUpdate = t.Partial(
  t.Object(
    {
      user: t.Object(
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
      assignedAgent: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
      messages: t.Partial(
        t.Object(
          {
            connect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
            disconnect: t.Array(
              t.Object(
                {
                  id: t.Integer({ additionalProperties: false }),
                },
                { additionalProperties: false },
              ),
              { additionalProperties: false },
            ),
          },
          { additionalProperties: false },
        ),
      ),
      result: t.Partial(
        t.Object(
          {
            connect: t.Object(
              {
                id: t.Integer({ additionalProperties: false }),
              },
              { additionalProperties: false },
            ),
            disconnect: t.Boolean(),
          },
          { additionalProperties: false },
        ),
      ),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
          id: t.Integer(),
          userId: t.Integer(),
          assignedAgentId: t.Integer(),
          status: t.Union(
            [
              t.Literal("OPEN"),
              t.Literal("IN_PROGRESS"),
              t.Literal("RESOLVED"),
            ],
            { additionalProperties: false },
          ),
          category: t.Union(
            [
              t.Literal("BUG"),
              t.Literal("PAYMENT"),
              t.Literal("ACCOUNT"),
              t.Literal("HARASSMENT"),
              t.Literal("OTHER"),
            ],
            { additionalProperties: false },
          ),
          priority: t.Integer(),
          createdAt: t.Date(),
          resolvedAt: t.Date(),
          resolvedByUserAt: t.Date(),
        },
        { additionalProperties: false },
      ),
    { $id: "Complaint" },
  ),
);

export const ComplaintWhereUnique = t.Recursive(
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
              userId: t.Integer(),
              assignedAgentId: t.Integer(),
              status: t.Union(
                [
                  t.Literal("OPEN"),
                  t.Literal("IN_PROGRESS"),
                  t.Literal("RESOLVED"),
                ],
                { additionalProperties: false },
              ),
              category: t.Union(
                [
                  t.Literal("BUG"),
                  t.Literal("PAYMENT"),
                  t.Literal("ACCOUNT"),
                  t.Literal("HARASSMENT"),
                  t.Literal("OTHER"),
                ],
                { additionalProperties: false },
              ),
              priority: t.Integer(),
              createdAt: t.Date(),
              resolvedAt: t.Date(),
              resolvedByUserAt: t.Date(),
            },
            { additionalProperties: false },
          ),
        ),
      ],
      { additionalProperties: false },
    ),
  { $id: "Complaint" },
);

export const ComplaintSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      userId: t.Boolean(),
      assignedAgentId: t.Boolean(),
      status: t.Boolean(),
      category: t.Boolean(),
      priority: t.Boolean(),
      createdAt: t.Boolean(),
      resolvedAt: t.Boolean(),
      resolvedByUserAt: t.Boolean(),
      user: t.Boolean(),
      assignedAgent: t.Boolean(),
      messages: t.Boolean(),
      result: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintInclude = t.Partial(
  t.Object(
    {
      status: t.Boolean(),
      category: t.Boolean(),
      user: t.Boolean(),
      assignedAgent: t.Boolean(),
      messages: t.Boolean(),
      result: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const ComplaintOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      userId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      assignedAgentId: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      priority: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      createdAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      resolvedAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      resolvedByUserAt: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
    },
    { additionalProperties: false },
  ),
);

export const Complaint = t.Composite([ComplaintPlain, ComplaintRelations], {
  additionalProperties: false,
});

export const ComplaintInputCreate = t.Composite(
  [ComplaintPlainInputCreate, ComplaintRelationsInputCreate],
  { additionalProperties: false },
);

export const ComplaintInputUpdate = t.Composite(
  [ComplaintPlainInputUpdate, ComplaintRelationsInputUpdate],
  { additionalProperties: false },
);
