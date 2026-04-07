import { eq } from "drizzle-orm";
import db from "../db";
import { items } from "../schema";

export const itemDal = {
  async create(data: { title: string }) {
    const [item] = await db.insert(items).values(data).returning();

    return item ?? null;
  },

  async getById(id: string) {
    const [item] = await db.select().from(items).where(eq(items.id, id));

    return item ?? null;
  },

  async getByTitle(title: string) {
    const [item] = await db.select().from(items).where(eq(items.title, title));

    return item ?? null;
  },

  async getAll() {
    return db.select().from(items);
  },

  async updateById(id: string, data: Partial<{ title: string }>) {
    const [item] = await db
      .update(items)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();

    return item ?? null;
  },

  async deleteById(id: string) {
    const [item] = await db.delete(items).where(eq(items.id, id)).returning();

    return item ?? null;
  },
};
