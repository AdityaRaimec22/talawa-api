import "dotenv/config";
import { users as usersResolver } from "../../../src/resolvers/Family/users";
import { connect, disconnect } from "../../helpers/db";
import type mongoose from "mongoose";
import { User } from "../../../src/models";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
import type { TestFamilyType } from "../../helpers/family";
import { createTestFamily } from "../../helpers/family";

let testFamily: TestFamilyType;
let MONGOOSE_INSTANCE: typeof mongoose;

beforeAll(async () => {
  MONGOOSE_INSTANCE = await connect();
  const resultArray = await createTestFamily();
  testFamily = resultArray[1];
});

afterAll(async () => {
  await disconnect(MONGOOSE_INSTANCE);
});

describe("resolvers -> GroupChat -> users", () => {
  it(`returns user objects for parent.users`, async () => {
    const parent = testFamily!.toObject();

    const usersPayload = await usersResolver?.(parent, {}, {});

    const users = await User.find({
      _id: {
        $in: testFamily?.users,
      },
    }).lean();

    expect(usersPayload).toEqual(users);
  });
});
