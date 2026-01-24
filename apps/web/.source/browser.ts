// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"api-reference/cli.mdx": () => import("../content/api-reference/cli.mdx?collection=docs"), "api-reference/config.mdx": () => import("../content/api-reference/config.mdx?collection=docs"), "configuration/config-file.mdx": () => import("../content/configuration/config-file.mdx?collection=docs"), "configuration/options.mdx": () => import("../content/configuration/options.mdx?collection=docs"), "configuration/routes.mdx": () => import("../content/configuration/routes.mdx?collection=docs"), "features/hot-reload.mdx": () => import("../content/features/hot-reload.mdx?collection=docs"), "features/nested-types.mdx": () => import("../content/features/nested-types.mdx?collection=docs"), "features/smart-generation.mdx": () => import("../content/features/smart-generation.mdx?collection=docs"), "getting-started/installation.mdx": () => import("../content/getting-started/installation.mdx?collection=docs"), "getting-started/introduction.mdx": () => import("../content/getting-started/introduction.mdx?collection=docs"), "getting-started/quick-start.mdx": () => import("../content/getting-started/quick-start.mdx?collection=docs"), }),
};
export default browserCollections;