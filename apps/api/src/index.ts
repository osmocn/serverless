import { itemController } from "@grove/db/item-controller";
import { type Context, Hono } from "hono";

const app = new Hono();

const welcomeStrings = [
  "Hello from Grove API!",
  "The Grove monorepo is wired up with pnpm workspaces and Turborepo.",
];

type ItemRequestBody = {
  title?: unknown;
};

function getErrorStatus(error: unknown) {
  if (!(error instanceof Error)) {
    return 500;
  }

  switch (error.name) {
    case "BadRequestError":
      return 400;
    case "ForbiddenError":
      return 403;
    case "NotFoundError":
      return 404;
    case "ConflictError":
      return 409;
    default:
      return 500;
  }
}

function sendControllerError(c: Context, error: unknown) {
  if (error instanceof Error) {
    return c.json({ error: error.message }, getErrorStatus(error));
  }

  return c.json({ error: "Unexpected error" }, 500);
}

async function readJsonBody(c: Context) {
  try {
    const body = await c.req.json<ItemRequestBody>();

    if (body && typeof body === "object") {
      return body;
    }

    return null;
  } catch {
    return null;
  }
}

app.get("/", (c) => {
  return c.text(welcomeStrings.join("\n\n"));
});

app.get("/items", async (c) => {
  try {
    const items = await itemController.getAllItems();
    return c.json({ items });
  } catch (error) {
    return sendControllerError(c, error);
  }
});

app.get("/items/:id", async (c) => {
  try {
    const item = await itemController.getItemById(c.req.param("id"));
    return c.json({ item });
  } catch (error) {
    return sendControllerError(c, error);
  }
});

app.post("/items", async (c) => {
  const body = await readJsonBody(c);

  if (!body || typeof body.title !== "string") {
    return c.json({ error: "Request body must include a string title" }, 400);
  }

  try {
    const item = await itemController.createItem({ title: body.title });
    return c.json({ item }, 201);
  } catch (error) {
    return sendControllerError(c, error);
  }
});

app.patch("/items/:id", async (c) => {
  const body = await readJsonBody(c);

  if (!body) {
    return c.json({ error: "Request body must be a JSON object" }, 400);
  }

  if (
    "title" in body &&
    body.title !== undefined &&
    typeof body.title !== "string"
  ) {
    return c.json({ error: "title must be a string when provided" }, 400);
  }

  try {
    const updateInput =
      typeof body.title === "string" ? { title: body.title } : {};
    const item = await itemController.updateItem(
      c.req.param("id"),
      updateInput,
    );
    return c.json({ item });
  } catch (error) {
    return sendControllerError(c, error);
  }
});

app.delete("/items/:id", async (c) => {
  try {
    const item = await itemController.deleteItem(c.req.param("id"));
    return c.json({ item });
  } catch (error) {
    return sendControllerError(c, error);
  }
});

export default app;
