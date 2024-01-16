import { nanoid } from "nanoid";
import type { InterfaceFamily } from "../../src/models/Family";
import { Family } from "../../src/models/Family";
import { createTestUser } from "./user";
import type { TestUserType } from "./user";

import type { Document } from "mongoose";

export type TestFamilyType =
  | (InterfaceFamily & Document<any, any, InterfaceFamily>)
  | null;

export const createTestFamily = async (): Promise<
  [TestUserType, TestFamilyType]
> => {
  const testUser = await createTestUser();
  if (testUser) {
    const testFamily = await Family.create({
      title: `name${nanoid().toLocaleLowerCase()}`,
      users: [testUser._id],
    });

    return [testUser, testFamily];
  } else {
    return [testUser, null];
  }
};
