import "dotenv/config";
import type mongoose from "mongoose";
import { Types } from "mongoose";
import { User } from "../../../src/models";
import { Family } from "../../../src/models/Family";
import type { MutationRemoveUserFromFamilyArgs } from "../../../src/types/generatedGraphQLTypes";
import { connect, disconnect } from "../../helpers/db";

import { removeUserFromFamily as removeUserFromFamilyResolver } from "../../../src/resolvers/Mutation/adminRemoveFamilyMember";
import {
  FAMILY_NOT_FOUND_ERROR,
  USER_NOT_AUTHORIZED_ERROR,
} from "../../../src/constants";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import type { TestUserType } from "../../helpers/user";
import type { TestFamilyType } from "../../helpers/family";
import { createTestFamily } from "../../helpers/family";

let MONGOOSE_INSTANCE: typeof mongoose;
let testUser: TestUserType;
let testFamily: TestFamilyType;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const resultArray = await createTestFamily();
  testUser = resultArray[0];
  testFamily = resultArray[1];
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolver -> Mutation -> removerUserFromFamily", () => {
  it(`throws NotFoundError if no family exists with _id === args.familyId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementationOnce((message) => message);
    try {
      const args: MutationRemoveUserFromFamilyArgs = {
        familyId: Types.ObjectId().toString(),
        userId: "",
      };

      const context = {
        userId: testUser?._id,
      };

      const { removeUserFromFamily: removeUserFromFamilyResolver } =
        await import("../../../src/resolvers/Mutation/adminRemoveFamilyMember");

      await removeUserFromFamilyResolver?.({}, args, context);
    } catch (error: any) {
      expect(spy).toBeCalledWith(FAMILY_NOT_FOUND_ERROR.MESSAGE);
      expect(error.message).toEqual(FAMILY_NOT_FOUND_ERROR.MESSAGE);
    }
  });

  it(`throws UnauthorizedError if users field of family with _id === args.familyId
    does not contain user with _id === args.userId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementationOnce((message) => message);
    try {
      await User.updateOne({
        _id: testUser?._id,
      });

      const args: MutationRemoveUserFromFamilyArgs = {
        familyId: testFamily?.id,
        userId: "",
      };

      const context = {
        userId: testUser?.id,
      };

      const { removeUserFromFamily: removeUserFromFamilyResolver } =
        await import("../../../src/resolvers/Mutation/adminRemoveFamilyMember");

      await removeUserFromFamilyResolver?.({}, args, context);
    } catch (error: any) {
      expect(spy).toBeCalledWith(USER_NOT_AUTHORIZED_ERROR.MESSAGE);
      expect(error.message).toEqual(USER_NOT_AUTHORIZED_ERROR.MESSAGE);
    }
  });

  it(`removes user with _id === args.userId from users list field of family
      with _id === args.familyId and returns the updated family`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    vi.spyOn(requestContext, "translate").mockImplementationOnce(
      (message) => `Translated${message}`
    );

    await Family.updateOne(
      {
        _id: testFamily?.id,
      },
      {
        $push: {
          users: testUser?.id,
        },
      }
    );

    const args: MutationRemoveUserFromFamilyArgs = {
      familyId: testFamily?.id,
      userId: testUser?.id,
    };

    const context = {
      userId: testUser?.id,
    };

    const removerUserFromFamilyPayload = await removeUserFromFamilyResolver?.(
      {},
      args,
      context
    );

    const testRemoveUserFromFamilyPayload = await Family.findOne({
      _id: testFamily?._id,
    }).lean();

    expect(removerUserFromFamilyPayload).toEqual(
      testRemoveUserFromFamilyPayload
    );
  });
});
