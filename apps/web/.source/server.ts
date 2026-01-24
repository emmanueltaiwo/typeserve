// @ts-nocheck
import * as __fd_glob_15 from "../content/getting-started/quick-start.mdx?collection=docs"
import * as __fd_glob_14 from "../content/getting-started/introduction.mdx?collection=docs"
import * as __fd_glob_13 from "../content/getting-started/installation.mdx?collection=docs"
import * as __fd_glob_12 from "../content/features/smart-generation.mdx?collection=docs"
import * as __fd_glob_11 from "../content/features/nested-types.mdx?collection=docs"
import * as __fd_glob_10 from "../content/features/hot-reload.mdx?collection=docs"
import * as __fd_glob_9 from "../content/configuration/routes.mdx?collection=docs"
import * as __fd_glob_8 from "../content/configuration/options.mdx?collection=docs"
import * as __fd_glob_7 from "../content/configuration/config-file.mdx?collection=docs"
import * as __fd_glob_6 from "../content/api-reference/config.mdx?collection=docs"
import * as __fd_glob_5 from "../content/api-reference/cli.mdx?collection=docs"
import { default as __fd_glob_4 } from "../content/getting-started/meta.json?collection=docs"
import { default as __fd_glob_3 } from "../content/features/meta.json?collection=docs"
import { default as __fd_glob_2 } from "../content/configuration/meta.json?collection=docs"
import { default as __fd_glob_1 } from "../content/api-reference/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content", {"meta.json": __fd_glob_0, "api-reference/meta.json": __fd_glob_1, "configuration/meta.json": __fd_glob_2, "features/meta.json": __fd_glob_3, "getting-started/meta.json": __fd_glob_4, }, {"api-reference/cli.mdx": __fd_glob_5, "api-reference/config.mdx": __fd_glob_6, "configuration/config-file.mdx": __fd_glob_7, "configuration/options.mdx": __fd_glob_8, "configuration/routes.mdx": __fd_glob_9, "features/hot-reload.mdx": __fd_glob_10, "features/nested-types.mdx": __fd_glob_11, "features/smart-generation.mdx": __fd_glob_12, "getting-started/installation.mdx": __fd_glob_13, "getting-started/introduction.mdx": __fd_glob_14, "getting-started/quick-start.mdx": __fd_glob_15, });