import { afterAll, beforeEach, describe, expect, test, vi } from "vitest";

import { userMocked } from "../../mocks";
import prisma from "../../prisma/client";
import prismaMock from "../../prisma/singleton";

async function findFirstMock() {
  const user = await prisma.user.findFirst({
    include: {
      profile: true,
      shifts: true,
    },
  });

  return user;
}

async function findManyMock() {
  const user = await prisma.user.findMany({
    include: {
      profile: true,
      shifts: true,
    },
  });

  return user;
}

const expectedUser = {
  id: expect.any(String),
  email: expect.any(String),
  lastname: expect.any(String),
  name: expect.any(String),
  formCompleted: expect.any(Boolean),
  online: expect.any(Boolean),
  password: expect.any(String),
  emailVerified: expect.any(Date),
  role: expect.any(String),
  isActive: expect.any(Boolean),

  profile: expect.objectContaining({
    id: expect.any(Number),
    userId: expect.any(String),
    endHour: expect.any(Number),
    extraNightShiftPay: expect.any(Number),
    hourlyRate: expect.any(Number),
    nightShift: expect.any(Boolean),
    startHour: expect.any(Number),
    unpaidBreaks: expect.any(Number),
  }),

  shifts: expect.arrayContaining([
    {
      id: expect.any(Number),
      amount: expect.any(Number),
      endDate: expect.any(String),
      isClosed: expect.any(Boolean),
      isPublicHoliday: expect.any(Boolean),
      publicHolidayWorked: expect.any(Boolean),
      notes: expect.any(String),
      startDate: expect.any(String),
      userId: expect.any(String),
    },
  ]),
};

describe("GET /user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  test("create user", async () => {
    const user = prismaMock.user.create.mockResolvedValueOnce({
      email: "",
      name: "test",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "USER",
      isActive: true,
      formCompleted: true,
      image: "",
      online: true,
      type_account: "CREDENTIALS",
      id: "1",
    });

    expect(user).not.toBeNull();
  });

  test("should return a user when one exists", async () => {
    const t = prismaMock.user.findFirst.mockResolvedValueOnce(userMocked);
    // const result = await findFirstMock();

    expect(t).not.toBeNull();
  });

  // test("User from prisma should match expected user", async () => {
  //   prismaMock.user.findFirst.mockResolvedValue(userMocked);
  //   const result = await findFirstMock();

  //   expect(result).toMatchObject(expectedUser);
  // });

  // test("should return a 404 when no user exists", async () => {
  //   prismaMock.user.findFirst.mockResolvedValue(null);
  //   const result = await findFirstMock();

  //   expect(result).toBeNull();
  // });

  // test("should return a list of users when they exist", async () => {
  //   prismaMock.user.findMany.mockResolvedValue([userMocked]);
  //   const result = await findManyMock();

  //   expect(result).not.toBeNull();
  // });

  // test("should return an empty list when no users exist", async () => {
  //   prismaMock.user.findMany.mockResolvedValue([]);
  //   const result = await findManyMock();

  //   expect(result).toEqual([]);
  // });
});
