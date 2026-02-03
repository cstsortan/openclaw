import type { GatewayRequestHandlers } from "./types.js";
import {
  listProfilesForProvider,
  loadAuthProfileStore,
  saveAuthProfileStore,
  upsertAuthProfile,
} from "../../agents/auth-profiles.js";
import {
  ErrorCodes,
  errorShape,
  formatValidationErrors,
  validateAuthProfileDeleteParams,
  validateAuthProfileListParams,
  validateAuthProfileSetParams,
} from "../protocol/index.js";

export const authHandlers: GatewayRequestHandlers = {
  "auth.profile.set": async ({ params, respond }) => {
    if (!validateAuthProfileSetParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid auth.profile.set params: ${formatValidationErrors(validateAuthProfileSetParams.errors)}`,
        ),
      );
      return;
    }

    const { profileId, provider, credential, agentDir } = params as {
      profileId: string;
      provider: string;
      credential: {
        type: "oauth";
        access: string;
        refresh?: string;
        expires: number;
        accountId?: string;
        email?: string;
        enterpriseUrl?: string;
        projectId?: string;
      };
      agentDir?: string;
    };

    try {
      // Build the credential object with only defined fields
      const authCredential: any = {
        type: "oauth" as const,
        provider,
        access: credential.access,
        expires: credential.expires,
      };

      // Add optional fields only if they exist
      if (credential.refresh) authCredential.refresh = credential.refresh;
      if (credential.accountId) authCredential.accountId = credential.accountId;
      if (credential.email) authCredential.email = credential.email;
      if (credential.enterpriseUrl) authCredential.enterpriseUrl = credential.enterpriseUrl;
      if (credential.projectId) authCredential.projectId = credential.projectId;

      // Use the existing upsertAuthProfile function
      upsertAuthProfile({
        profileId,
        credential: authCredential,
        agentDir,
      });

      respond(
        true,
        {
          ok: true,
          profileId,
          provider,
        },
        undefined,
      );
    } catch (err) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.UNAVAILABLE,
          `failed to save auth profile: ${err instanceof Error ? err.message : "unknown error"}`,
        ),
      );
    }
  },

  "auth.profile.list": async ({ params, respond }) => {
    if (!validateAuthProfileListParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid auth.profile.list params: ${formatValidationErrors(validateAuthProfileListParams.errors)}`,
        ),
      );
      return;
    }

    const { provider, agentDir } = params as {
      provider?: string;
      agentDir?: string;
    };

    try {
      const store = loadAuthProfileStore();
      const allProfiles = Object.entries(store.profiles);

      const filtered = provider
        ? allProfiles.filter(([, cred]) => cred.provider === provider)
        : allProfiles;

      const profiles = filtered.map(([id, cred]) => ({
        profileId: id,
        provider: cred.provider,
        type: cred.type,
        email: cred.type === "oauth" || cred.type === "api_key" ? cred.email : undefined,
        hasCredentials: true,
      }));

      respond(true, { profiles }, undefined);
    } catch (err) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.UNAVAILABLE,
          `failed to list auth profiles: ${err instanceof Error ? err.message : "unknown error"}`,
        ),
      );
    }
  },

  "auth.profile.delete": async ({ params, respond }) => {
    if (!validateAuthProfileDeleteParams(params)) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.INVALID_REQUEST,
          `invalid auth.profile.delete params: ${formatValidationErrors(validateAuthProfileDeleteParams.errors)}`,
        ),
      );
      return;
    }

    const { profileId, agentDir } = params as {
      profileId: string;
      agentDir?: string;
    };

    try {
      const store = loadAuthProfileStore();

      if (!store.profiles[profileId]) {
        respond(
          false,
          undefined,
          errorShape(ErrorCodes.INVALID_REQUEST, `profile not found: ${profileId}`),
        );
        return;
      }

      delete store.profiles[profileId];
      saveAuthProfileStore(store, agentDir);

      respond(
        true,
        {
          ok: true,
          profileId,
        },
        undefined,
      );
    } catch (err) {
      respond(
        false,
        undefined,
        errorShape(
          ErrorCodes.UNAVAILABLE,
          `failed to delete auth profile: ${err instanceof Error ? err.message : "unknown error"}`,
        ),
      );
    }
  },
};
