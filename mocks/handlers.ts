import {
  DefaultBodyType,
  PathParams,
  ResponseComposition,
  rest,
  RestContext,
  RestRequest,
} from "msw";

export async function post_waiting_list(
  req: RestRequest<DefaultBodyType, PathParams<string>>,
  res: ResponseComposition<DefaultBodyType>,
  ctx: RestContext
) {
  return res(ctx.status(200), ctx.json({ message: "Added to waiting list" }));
}

export const handlers = [rest.post("/api/waiting-list", post_waiting_list)];
