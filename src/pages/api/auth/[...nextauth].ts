import { query as q } from "faunadb";

import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  jwt: {
    encode: async (user) => {
      user.maxAge = 1000 * 60 * 60 * 24; // 1 week
      user.secret = process.env.SIGNIN_KEY;
      return JSON.stringify(user.token);
    },
    decode: async (token) => {
      return JSON.parse(token.token);
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(q.Match(q.Index("user_by_email"), q.Casefold(email)))
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(q.Match(q.Index("user_by_email"), q.Casefold(email)))
          )
        );

        return true;
      } catch {
        return false;
      }
    },
  },
});
