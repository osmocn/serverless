import { itemDal } from "../dal/item";
import {
  BadRequestError,
  ConflictError,
  InternalError,
  NotFoundError,
} from "../helpers/errors";

function normalizeTitle(title: string) {
  return title.trim();
}

export const itemController = {
  async createItem(input: { title: string }) {
    const title = normalizeTitle(input.title);

    if (!title) {
      throw new BadRequestError("Title is required");
    }

    const existingItem = await itemDal.getByTitle(title);

    if (existingItem) {
      throw new ConflictError("Item with this title already exists");
    }

    const item = await itemDal.create({ title });

    if (!item) {
      throw new InternalError("Failed to create item");
    }

    return item;
  },

  async getItemById(id: string) {
    const item = await itemDal.getById(id);

    if (!item) {
      throw new NotFoundError("Item not found");
    }

    return item;
  },

  async getAllItems() {
    const items = await itemDal.getAll();
    return items;
  },

  async updateItem(id: string, data: Partial<{ title: string }>) {
    const existing = await itemDal.getById(id);

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    if (data.title === undefined) {
      return existing;
    }

    const title = normalizeTitle(data.title);

    if (!title) {
      throw new BadRequestError("Title is required");
    }

    if (title === existing.title) {
      return existing;
    }

    const conflictingItem = await itemDal.getByTitle(title);

    if (conflictingItem && conflictingItem.id !== id) {
      throw new ConflictError("Item with this title already exists");
    }

    const updated = await itemDal.updateById(id, { title });

    if (!updated) {
      throw new InternalError("Failed to update item");
    }

    return updated;
  },

  async deleteItem(id: string) {
    const existing = await itemDal.getById(id);

    if (!existing) {
      throw new NotFoundError("Item not found");
    }

    const deleted = await itemDal.deleteById(id);

    if (!deleted) {
      throw new InternalError("Failed to delete item");
    }

    return deleted;
  },
};
