import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { SocialProviders } from "better-auth/social-providers"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"
import { scryptSync } from "node:crypto"

function getSocialProviders(options?: { clientSecret: string }) {
  return {
    line: {
      clientId: "2006544455",
      clientSecret: options?.clientSecret,
      scope: [ "openid", "profile" ],
      // Email を取得するには LINE に申請しなくてはならず、
      // また、このアプリには必要ないので適当な値を設定する
      mapProfileToUser: (profile) => ({ ...profile, email: profile.sub + "@example.com" }),
    }
  } satisfies SocialProviders
}

export const auth = betterAuth({
  emailAndPassword: { enabled: true },
  database: drizzleAdapter(drizzle({} as D1Database), { provider: "sqlite" }),
  socialProviders: getSocialProviders(),
  user: {
    additionalFields: {
      defaultGroup: { type: "number", required: false }
    }
  }
})

export function initAuth(db: DrizzleD1Database, oauthClientSecret: string) {
  return betterAuth({
    emailAndPassword: {
      enabled: true,
      // CPU Timelimit 対策
      // https://github.com/better-auth/better-auth/issues/969#issuecomment-3024999773
      password: {
        hash: async (password) => {
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

          const key = scryptSync(
            password.normalize("NFKC"),
            saltHex,
            64,
            {
              N: 16384,
              r: 16,
              p: 1,
              maxmem: 128 * 16384 * 16 * 2
            }
          );

          const keyHex = Array.from(key).map(b => b.toString(16).padStart(2, '0')).join('');
          return `${saltHex}:${keyHex}`;
        },
        verify: async ({ hash, password }) => {
          const [saltHex, keyHex] = hash.split(":");

          const targetKey = scryptSync(
            password.normalize("NFKC"),
            saltHex,
            64,
            {
              N: 16384,
              r: 16,
              p: 1,
              maxmem: 128 * 16384 * 16 * 2
            }
          );

          const targetKeyHex = Array.from(targetKey).map(b => b.toString(16).padStart(2, '0')).join('');
          return targetKeyHex === keyHex;
        },
      }
    },
    database: drizzleAdapter(db, { provider: "sqlite" }),
    socialProviders: getSocialProviders({ clientSecret: oauthClientSecret }),
    user: {
      additionalFields: {
        defaultGroup: { type: "number", required: false }
      }
    }
  })
}