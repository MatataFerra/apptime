import { prismaMock } from "#/prisma/singleton";
import { NextResponse } from "next/server";
import mockedUser from "#/mocks/user.prisma.json";
import prisma from "#/prisma/client";

async function findFirstMock() {
  const user = await prisma.user.findFirst();

  return user;
}

const expectedUser = {
  id: expect.any(Number),
  email: expect.any(String),
  endHour: expect.any(Number),
  extraNightShiftPay: expect.any(Number),
  formCompleted: expect.any(Boolean),
  holidayPay: expect.any(Boolean),
  holidayPayRate: expect.any(Number),
  hourlyRate: expect.any(Number),
  lastname: expect.any(String),
  name: expect.any(String),
  nightShift: expect.any(Boolean),
  online: expect.any(Boolean),
  password: expect.any(String),
  startHour: expect.any(Number),
  unpaidBreaks: expect.any(Number),
  shifts: expect.arrayContaining([
    {
      id: expect.any(Number),
      amount: expect.any(Number),
      end: expect.any(String),
      endDate: expect.any(String),
      isClosed: expect.any(Boolean),
      isHoliday: expect.any(Boolean),
      notes: expect.any(String),
      start: expect.any(String),
      startDate: expect.any(String),
      userId: expect.any(Number),
    },
  ]),
};

describe("GET /user", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should return a user when one exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUser.user);
    const result = await findFirstMock();

    expect(result).not.toBeNull();
  });

  it("User from prisma should match expected user", async () => {
    prismaMock.user.findFirst.mockResolvedValue(mockedUser.user);
    const result = await findFirstMock();
    expect(result).toMatchObject(expectedUser);
  });

  it("should return a 404 when no user exists", async () => {
    prismaMock.user.findFirst.mockResolvedValue(null);
    const result = await findFirstMock();

    expect(result).toBeNull();
  });
});
