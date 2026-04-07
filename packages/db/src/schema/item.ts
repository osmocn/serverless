import { text } from "drizzle-orm/pg-core";
import { primaryKeyColumns, timestampColumns } from "../helpers/base-column.js";
import { createTable } from "../helpers/create-table.js";

export const items = createTable("item", {
  ...primaryKeyColumns(),
  ...timestampColumns(),
  title: text("title"),
});
