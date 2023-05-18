import { rest } from "msw";

export const handlers = [
  rest.get("/api/your-endpoint", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: "Mocked data",
      })
    );
  }),
];
