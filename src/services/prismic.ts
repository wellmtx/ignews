import * as Prismic from "@prismicio/client";

const repoName = process.env.PRISMIC_REPO_NAME;
const endpoint = Prismic.getRepositoryEndpoint(repoName);

export function getPrismicClient() {
  const prismic = Prismic.createClient(endpoint, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
  });

  return prismic;
}
