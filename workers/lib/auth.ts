import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import type { SocialProviders } from "better-auth/social-providers"
import { drizzle, DrizzleD1Database } from "drizzle-orm/d1"

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
    database: drizzleAdapter(db, { provider: "sqlite" }),
    socialProviders: getSocialProviders({ clientSecret: oauthClientSecret }),
    user: {
      additionalFields: {
        defaultGroup: { type: "number", required: false }
      }
    }
  })
}