import { t } from "elysia";

import { __transformDate__ } from "./__transformDate__";

import { __nullable__ } from "./__nullable__";

export const UserPlain = t.Object(
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
);

export const UserRelations = t.Object(
  {
    complaints: t.Array(
      t.Object(
        {
          id: t.Integer(),
          userId: t.Integer(),
          assignedAgentId: __nullable__(t.Integer()),
          status: t.Union(
            [
              t.Literal("OPEN"),
              t.Literal("IN_PROGRESS"),
              t.Literal("RESOLVED"),
            ],
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
      { additionalProperties: false },
    ),
    assignedCases: t.Array(
      t.Object(
        {
          id: t.Integer(),
          userId: t.Integer(),
          assignedAgentId: __nullable__(t.Integer()),
          status: t.Union(
            [
              t.Literal("OPEN"),
              t.Literal("IN_PROGRESS"),
              t.Literal("RESOLVED"),
            ],
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
      { additionalProperties: false },
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
  },
  { additionalProperties: false },
);

export const UserPlainInputCreate = t.Object(
  {
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
  },
  { additionalProperties: false },
);

export const UserPlainInputUpdate = t.Object(
  {
    email: t.Optional(t.String()),
    passwordHash: t.Optional(t.String()),
    role: t.Optional(
      t.Union(
        [t.Literal("USER"), t.Literal("AGENT"), t.Literal("LEAD_AGENT")],
        { additionalProperties: false },
      ),
    ),
    birthDate: t.Optional(t.Date()),
    gender: t.Optional(
      t.Union([t.Literal("MALE"), t.Literal("FEMALE")], {
        additionalProperties: false,
      }),
    ),
  },
  { additionalProperties: false },
);

export const UserRelationsInputCreate = t.Object(
  {
    complaints: t.Optional(
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
    assignedCases: t.Optional(
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
  },
  { additionalProperties: false },
);

export const UserRelationsInputUpdate = t.Partial(
  t.Object(
    {
      complaints: t.Partial(
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
      assignedCases: t.Partial(
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
    },
    { additionalProperties: false },
  ),
);

export const UserWhere = t.Partial(
  t.Recursive(
    (Self) =>
      t.Object(
        {
          AND: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          NOT: t.Union([Self, t.Array(Self, { additionalProperties: false })]),
          OR: t.Array(Self, { additionalProperties: false }),
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
    { $id: "User" },
  ),
);

export const UserWhereUnique = t.Recursive(
  (Self) =>
    t.Intersect(
      [
        t.Partial(
          t.Object(
            { id: t.Integer(), email: t.String() },
            { additionalProperties: false },
          ),
          { additionalProperties: false },
        ),
        t.Union(
          [t.Object({ id: t.Integer() }), t.Object({ email: t.String() })],
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
              email: t.String(),
              passwordHash: t.String(),
              role: t.Union(
                [
                  t.Literal("USER"),
                  t.Literal("AGENT"),
                  t.Literal("LEAD_AGENT"),
                ],
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
      ],
      { additionalProperties: false },
    ),
  { $id: "User" },
);

export const UserSelect = t.Partial(
  t.Object(
    {
      id: t.Boolean(),
      email: t.Boolean(),
      passwordHash: t.Boolean(),
      role: t.Boolean(),
      birthDate: t.Boolean(),
      gender: t.Boolean(),
      complaints: t.Boolean(),
      assignedCases: t.Boolean(),
      messages: t.Boolean(),
      createdAt: t.Boolean(),
      updatedAt: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserInclude = t.Partial(
  t.Object(
    {
      role: t.Boolean(),
      gender: t.Boolean(),
      complaints: t.Boolean(),
      assignedCases: t.Boolean(),
      messages: t.Boolean(),
      _count: t.Boolean(),
    },
    { additionalProperties: false },
  ),
);

export const UserOrderBy = t.Partial(
  t.Object(
    {
      id: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      email: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      passwordHash: t.Union([t.Literal("asc"), t.Literal("desc")], {
        additionalProperties: false,
      }),
      birthDate: t.Union([t.Literal("asc"), t.Literal("desc")], {
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

export const User = t.Composite([UserPlain, UserRelations], {
  additionalProperties: false,
});

export const UserInputCreate = t.Composite(
  [UserPlainInputCreate, UserRelationsInputCreate],
  { additionalProperties: false },
);

export const UserInputUpdate = t.Composite(
  [UserPlainInputUpdate, UserRelationsInputUpdate],
  { additionalProperties: false },
);
