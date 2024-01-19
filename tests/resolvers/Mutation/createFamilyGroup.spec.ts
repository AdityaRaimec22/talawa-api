import "dotenv/config";
import type mongoose from "mongoose";
import { Types } from "mongoose";
import type { MutationCreateFamilyGroupArgs } from "../../../src/types/generatedGraphQLTypes";
import { connect, disconnect } from "../../helpers/db";

import { createFamilyGroup as createFamilyGroupResolver } from "../../../src/resolvers/Mutation/createFamilyGroup";
import { USER_NOT_FOUND_ERROR } from "../../../src/constants";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import type { TestUserType } from "../../helpers/userAndOrg";
import { createTestUser } from "../../helpers/user";

let testUser: TestUserType;
let MONGOOSE_INSTANCE: typeof mongoose;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const resultsArray = await createTestUser();

  testUser = resultsArray;
  const { requestContext } = await import("../../../src/libraries");
  vi.spyOn(requestContext, "translate").mockImplementation(
    (message) => message
  );
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolvers -> Mutation -> createFamilyGroup", () => {
  it(`throws NotFoundError if no user exists for any one of the ids in args.data.userIds`, async () => {
    try {
      const args: MutationCreateFamilyGroupArgs = {
        data: {
          title: "",
          userIds: [Types.ObjectId().toString()],
        },
      };

      const context = {
        userIds: testUser?.id,
      };

      await createFamilyGroupResolver?.({}, args, context);
    } catch (error: any) {
      expect(error.message).toEqual(USER_NOT_FOUND_ERROR.MESSAGE);
    }
  });

  it(`creates the Family and returns it`, async () => {
    const args: MutationCreateFamilyGroupArgs = {
      data: {
        title: "title",
        userIds: [testUser?.id],
      },
    };

    const context = {
      userId: testUser?.id,
    };

    const createFamilyGroupPayload = await createFamilyGroupResolver?.(
      {},
      args,
      context
    );

    expect(createFamilyGroupPayload).toEqual(
      expect.objectContaining({
        title: "title",
        users: [testUser?.id],
      })
    );
  });
});
