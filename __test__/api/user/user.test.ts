import { NextApiRequest, NextApiResponse } from "next";
import userHandler from "@/pages/api/user";
import { prismaMock } from "#/prisma/singleton";
import mockedUser from "#/__test__/mocks/user.prisma.json";

describe("userHandler", () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    req = {} as NextApiRequest;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as NextApiResponse;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return a user when one exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUser.user);

    await userHandler(req, res);

    expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "success",
      response: true,
      user: mockedUser.user,
    });
  });

  it("should return an error when no user exists", async () => {
    (prismaMock.user.findFirst as jest.Mock).mockResolvedValue(null);

    await userHandler(req, res);

    expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "User not found",
      response: false,
    });
  });

  it("should return an error when data parsing fails", async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUser.user);

    const originalData = JSON.parse(JSON.stringify(mockedUser.user));

    // @ts-ignore
    mockedUser.user.email = 12345;

    await userHandler(req, res);

    expect(prismaMock.user.findFirst).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid input",
      response: false,
    });

    mockedUser.user.email = originalData.email;
  });
});
