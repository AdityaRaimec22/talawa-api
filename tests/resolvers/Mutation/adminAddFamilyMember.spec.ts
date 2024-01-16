import "dotenv/config";
import type mongoose from "mongoose";
import { Types } from "mongoose";
import { Family } from "../../../src/models/Family";
import type { MutationAddUserToFamilyArgs } from "../../../src/types/generatedGraphQLTypes";
import { connect, disconnect } from "../../helpers/db";

import {
  USER_ALREADY_MEMBER_ERROR,
  USER_NOT_FOUND_ERROR,
  FAMILY_NOT_FOUND_ERROR,
} from "../../../src/constants";
import { beforeAll, afterAll, describe, it, expect, vi } from "vitest";
import type { TestUserType } from "../../helpers/user";
import type { TestFamilyType } from "../../helpers/family";
import { createTestFamily } from "../../helpers/family";

let testUser: TestUserType;
let testFamily: TestFamilyType;
let MONGOOSE_INSTANCE: typeof mongoose;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const resultsArray = await createTestFamily();
  testUser = resultsArray[0];
  testFamily = resultsArray[1];
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolver -> mutation -> addUserToFamily", () => {
  afterAll(() => {
    vi.doUnmock("../../../src/constants");
    vi.resetModules();
  });

  it(`throws NotFoundError if no Family exists with _id === args.familyId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementation((message) => message);
    try {
      const args: MutationAddUserToFamilyArgs = {
        familyId: Types.ObjectId().toString(),
        userId: testUser?.id,
      };

      const context = {
        userId: testUser?.id,
      };

      const { addUserToFamily } = await import(
        "../../../src/resolvers/Mutation/adminAddFamilyMember"
      );
      await addUserToFamily?.({}, args, context);
    } catch (error: any) {
      expect(spy).toBeCalledWith(FAMILY_NOT_FOUND_ERROR.MESSAGE);
      expect(error.message).toEqual(FAMILY_NOT_FOUND_ERROR.MESSAGE);
    }
  });

  it(`throws NotFoundError if no user exists with _id === args.userId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementation((message) => message);
    try {
      const args: MutationAddUserToFamilyArgs = {
        familyId: testFamily?._id,
        userId: Types.ObjectId().toString(),
      };

      const context = {
        userId: testUser?._id,
      };

      const { addUserToFamily } = await import(
        "../../../src/resolvers/Mutation/adminAddFamilyMember"
      );
      await addUserToFamily?.({}, args, context);
    } catch (error: any) {
      expect(spy).toBeCalledWith(USER_NOT_FOUND_ERROR.MESSAGE);
      expect(error.message).toEqual(USER_NOT_FOUND_ERROR.MESSAGE);
    }
  });

  it(`throws ConflictError if user with _id === args.userId is already a member 
  of groupChat with _id === args.chatId`, async () => {
    const { requestContext } = await import("../../../src/libraries");
    const spy = vi
      .spyOn(requestContext, "translate")
      .mockImplementation((message) => message);
    try {
      const args: MutationAddUserToFamilyArgs = {
        familyId: testFamily?._id,
        userId: testUser?.id,
      };

      const context = {
        userId: testUser?._id,
      };

      const { addUserToFamily } = await import(
        "../../../src/resolvers/Mutation/adminAddFamilyMember"
      );
      await addUserToFamily?.({}, args, context);
    } catch (error: any) {
      expect(spy).toBeCalledWith(USER_ALREADY_MEMBER_ERROR.MESSAGE);
      expect(error.message).toEqual(USER_ALREADY_MEMBER_ERROR.MESSAGE);
    }
  });

  it(`add the groupChat with _id === args.familyId and returns it`, async () => {
    await Family.updateOne(
      {
        _id: testFamily?._id,
      },
      {
        $set: {
          users: [],
        },
      }
    );

    const args: MutationAddUserToFamilyArgs = {
      familyId: testFamily?.id,
      userId: testUser?.id,
    };

    const context = {
      userId: testUser?.id,
    };

    const { addUserToFamily } = await import(
      "../../../src/resolvers/Mutation/adminAddFamilyMember"
    );
    const addUserToFamilyPayload = await addUserToFamily?.({}, args, context);
    expect(addUserToFamilyPayload?._id).toEqual(testFamily?._id);
    expect(addUserToFamilyPayload?.users).toEqual([testUser?._id]);
  });
});
