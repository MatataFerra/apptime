import { PrismaClient } from "@prisma/client";
import {beforeEach,vi} from  'vitest'
import { mockDeep, mockReset } from 'vitest-mock-extended'


// vi.mock("./client", () => ({
//   __esModule: true,
//   default: mockDeep<PrismaClient>(),
// }));

beforeEach(() => {
  mockReset(prismaMock);
});

const prismaMock = mockDeep<PrismaClient>()

export default prismaMock
