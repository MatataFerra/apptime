import type { Contribution } from "@prisma/client";

import type { SalaryItemInput } from "@/types";

import "server-only";

import prisma from "#/prisma/client";

/**
 * Each user owns their rows, and a row is only reused when the name *and*
 * rate match, so a shift never ends up with a different percentage.
 */
function sameItem(a: { name: string; value: number }, b: { name: string; value: number }) {
  return a.name === b.name && Number(a.value) === Number(b.value);
}

class ContributionService {
  contributions: SalaryItemInput[];
  userId: string;
  constructor(contributions: SalaryItemInput[], userId: string) {
    this.contributions = contributions;
    this.userId = userId;
  }

  async create() {
    const contributionsFromDB = await ContributionService.getAll(this.userId);
    const filtered = this.prepareContributionsToCreate(contributionsFromDB);
    const toCreate = filtered
      .filter((contribution) => !contribution.exists)
      .map(({ contribution }) => contribution);
    let existing: Contribution[] = [];

    const newContributions = await this.createNewContributions(toCreate);

    for (const contribution of this.contributions) {
      const findContribution = contributionsFromDB.find((userContribution) =>
        sameItem(userContribution, contribution)
      );
      if (findContribution) existing.push(findContribution);
    }

    await this.unarchive(existing);
    return newContributions.concat(existing.map((contribution) => ({ id: contribution.id })));
  }

  /** The user's own rows, archived ones included (they can be reused). */
  static async getAll(userId: string) {
    return prisma.contribution.findMany({ where: { userId }, orderBy: { archived: "asc" } });
  }

  /** A removed item that gets typed in again shows up in the picker again. */
  private async unarchive(items: { id: number; archived: boolean }[]) {
    const ids = items.filter((item) => item.archived).map((item) => item.id);
    if (ids.length === 0) return;
    await prisma.contribution.updateMany({
      where: { id: { in: ids }, userId: this.userId },
      data: { archived: false },
    });
  }

  private async createNewContributions(toCreate: SalaryItemInput[]) {
    const created = toCreate.map(async (contribution) => {
      const newContribution = await prisma.contribution.create({
        data: {
          name: contribution.name,
          value: contribution.value,
          userId: this.userId,
          description: contribution.description,
        },
      });
      return { id: newContribution.id };
    });

    return Promise.all(created);
  }

  prepareContributionsToCreate(dbItems: Contribution[]) {
    return this.contributions.map((local) => {
      const existing = dbItems.find((contribDb) => sameItem(contribDb, local)) as Contribution;
      if (existing) {
        return { id: existing.id, exists: true, contribution: local };
      } else {
        return { exists: false, contribution: local };
      }
    });
  }
}

export default ContributionService;
