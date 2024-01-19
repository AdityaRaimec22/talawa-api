import "dotenv/config";
import type mongoose from "mongoose";
import { Types } from "mongoose";
import { Family } from "../../../src/models/Family";
import { removeFamily as removeFamilyResolver } from "../../../src/resolvers/Mutation/removeFamilyGroup";
import type { MutationRemoveFamilyArgs } from "../../../src/types/generatedGraphQLTypes";
import { connect, disconnect } from "../../helpers/db";

import {
  FAMILY_NOT_FOUND_ERROR,
  USER_NOT_AUTHORIZED_SUPERADMIN,
} from "../../../src/constants";
import {
  beforeAll,
  afterAll,
  describe,
  it,
  expect,
  afterEach,
  vi,
} from "vitest";
import type { TestUserType } from "../../helpers/user";
import type { TestFamilyType } from "../../helpers/family";
import { createTestFamily } from "../../helpers/family";

let MONGOOSE_INSTANCE: typeof mongoose;
let testUser: TestUserType;
let testFamily: TestFamilyType;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const temp = await createTestFamily();
  testUser = temp[0];
  testFamily = temp[1];
  testFamily = await Family.findOneAndUpdate(
    {
      _id: testFamily?._id,
    },
    {
      new: true,
    }
  );
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolvers -> Mutation -> removeFamily", () => {
  afterEach(() => {
    vi.resetAllMocks();
    vi.doMock("../../src/constants");
    vi.resetModules();
  });

  it(`throws User is not SUPERADMIN error if current user is with _id === context.userId is not a  SUPERADMIN`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementation((message) => message);

    try {
      const args: MutationRemoveFamilyArgs = {
        familyId: testFamily?.id,
      };

      const context = {
        userId: testUser?.id,
      };

      const { removeFamily: removeFamilyResolver } = await import(
        "../../../src/resolvers/Mutation/removeFamilyGroup"
      );

      await removeFamilyResolver?.({}, args, context);
    } catch (error: any) {
      expect(spy).toHaveBeenCalledWith(USER_NOT_AUTHORIZED_SUPERADMIN.MESSAGE);
      expect(error.message).toEqual(
        `Translated ${USER_NOT_AUTHORIZED_SUPERADMIN.MESSAGE}`
      );
    }
  });

  it(`throws NotFoundError if no family exists with _id === args.familyId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementation((message) => `Translated ${message}`);

    try {
      const args: MutationRemoveFamilyArgs = {
        familyId: { input: Types.ObjectId().toString(), output: "" },
      };

      const context = {
        userId: testUser?._id,
      };

      const { removeFamily: removeFamilyResolver } = await import(
        "../../../src/resolvers/Mutation/removeFamilyGroup"
      );

      await removeFamilyResolver?.({}, args, context);
    } catch (error: any) {
      expect(spy).toHaveBeenCalledWith(FAMILY_NOT_FOUND_ERROR.MESSAGE);
      expect(error.message).toEqual(
        `Translated ${FAMILY_NOT_FOUND_ERROR.MESSAGE}`
      );
    }
  });

  it(`removes the family with _id === args.familyId and returns it`, async () => {
    const args: MutationRemoveFamilyArgs = {
      familyId: testFamily!._id,
    };

    const context = {
      userId: testUser!._id,
    };

    const removeFamilyPayload = await removeFamilyResolver?.({}, args, context);

    expect(removeFamilyPayload).toEqual(testFamily!.toObject());

    const testRemovedFamily = await Family.findOne({
      _id: testFamily!._id,
    });

    expect(testRemovedFamily).toEqual(null);
  });
});
