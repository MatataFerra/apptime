import type { Contribution } from "@prisma/client";

import prisma from "#/prisma/client";

class ContributionService {
  contributions: Omit<Contribution, "id">[];
  constructor(contributions: Omit<Contribution, "id">[]) {
    this.contributions = contributions;
  }

  async create() {
    const contributionsFromDB = await ContributionService.getAll();
    const filtered = this.prepareContributionsToCreate(contributionsFromDB);
    const toCreate = filtered
      .filter((contribution) => !contribution.exists)
      .map(({ contribution }) => contribution);
    let existing: Contribution[] = [];

    const newContributions = await this.createNewContributions(toCreate);

    for (const contribution of this.contributions) {
      const findContribution = contributionsFromDB.find(
        (userContribution) => userContribution.name === contribution.name
      );
      if (findContribution) existing.push(findContribution);
    }

    return newContributions.concat(existing.map((contribution) => ({ id: contribution.id })));
  }

  static async getAll() {
    return prisma.contribution.findMany();
  }

  private async createNewContributions(toCreate: Omit<Contribution, "id">[]) {
    const created = toCreate.map(async (contribution) => {
      const newContribution = await prisma.contribution.create({
        data: {
          name: contribution.name,
          value: contribution.value,
          description: contribution.description,
        },
      });
      return { id: newContribution.id };
    });

    return Promise.all(created);
  }

  prepareContributionsToCreate(dbItems: Contribution[]) {
    return this.contributions.map((local) => {
      const existing = dbItems.find((contribDb) => contribDb.name === local.name) as Contribution;
      if (existing) {
        return { id: existing.id, exists: true, contribution: local };
      } else {
        return { exists: false, contribution: local };
      }
    });
  }
}

export default ContributionService;
