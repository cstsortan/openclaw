import type { Static } from "@sinclair/typebox";
import { Type } from "@sinclair/typebox";

// auth.profile.set - Save OAuth credentials
export const AuthProfileSetParamsSchema = Type.Object({
  profileId: Type.String(),
  provider: Type.String(),
  credential: Type.Object({
    type: Type.Literal("oauth"),
    access: Type.String(),
    refresh: Type.Optional(Type.String()),
    expires: Type.Number(),
    accountId: Type.Optional(Type.String()),
    email: Type.Optional(Type.String()),
    enterpriseUrl: Type.Optional(Type.String()),
    projectId: Type.Optional(Type.String()),
  }),
  agentDir: Type.Optional(Type.String()),
});

export const AuthProfileSetResultSchema = Type.Object({
  ok: Type.Boolean(),
  profileId: Type.String(),
  provider: Type.String(),
});

// auth.profile.list - List auth profiles
export const AuthProfileListParamsSchema = Type.Object({
  provider: Type.Optional(Type.String()),
  agentDir: Type.Optional(Type.String()),
});

export const AuthProfileListResultSchema = Type.Object({
  profiles: Type.Array(
    Type.Object({
      profileId: Type.String(),
      provider: Type.String(),
      type: Type.Union([Type.Literal("oauth"), Type.Literal("api_key"), Type.Literal("token")]),
      email: Type.Optional(Type.String()),
      hasCredentials: Type.Boolean(),
    }),
  ),
});

// auth.profile.delete - Delete auth profile
export const AuthProfileDeleteParamsSchema = Type.Object({
  profileId: Type.String(),
  agentDir: Type.Optional(Type.String()),
});

export const AuthProfileDeleteResultSchema = Type.Object({
  ok: Type.Boolean(),
  profileId: Type.String(),
});

export type AuthProfileSetParams = Static<typeof AuthProfileSetParamsSchema>;
export type AuthProfileSetResult = Static<typeof AuthProfileSetResultSchema>;
export type AuthProfileListParams = Static<typeof AuthProfileListParamsSchema>;
export type AuthProfileListResult = Static<typeof AuthProfileListResultSchema>;
export type AuthProfileDeleteParams = Static<typeof AuthProfileDeleteParamsSchema>;
export type AuthProfileDeleteResult = Static<typeof AuthProfileDeleteResultSchema>;
