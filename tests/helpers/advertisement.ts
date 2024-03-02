import type { InterfaceUser } from "../../src/models";
import { Advertisement, AppUserProfile, User } from "../../src/models";
import type { InterfaceAdvertisement } from "../../src/models";
import type { Document, PopulatedDoc } from "mongoose";
import { createTestUserAndOrganization } from "./userAndOrg";
import { nanoid } from "nanoid";

export type TestAdvertisementType = {
  _id: string;
  organizationId: PopulatedDoc<InterfaceAdvertisement & Document>;
  name: string;
  mediaUrl: string;
  creatorId: PopulatedDoc<InterfaceUser & Document>;
  type: "POPUP" | "MENU" | "BANNER";
  startDate: string;
  endDate: string;
  createdAt: Date;
  updatedAt: Date;
};

// Function to create test advertisement
export const createTestAdvertisement =
  async (): Promise<TestAdvertisementType> => {
    const [testUser, testOrganization] = await createTestUserAndOrganization();

    // Create test advertisement in the database
    const createdAdvertisement = await Advertisement.create({
      name: "Test Advertisement",
      mediaUrl: "data:image/png;base64,bWVkaWEgY29udG",
      type: "POPUP",
      startDate: "2023-01-01",
      endDate: "2023-01-31",
      organizationId: testOrganization?._id,
      createdAt: "2024-01-13T18:23:00.316Z",
      updatedAt: "2024-01-13T20:28:21.292Z",
      creatorId: testUser?._id,
    });

    return createdAdvertisement.toObject();
  };
export type TestSuperAdminType =
  | (InterfaceUser & Document<unknown, unknown, InterfaceUser>)
  | null;

export const createTestSuperAdmin = async (): Promise<TestSuperAdminType> => {
  const testSuperAdmin = await User.create({
    email: `email${nanoid().toLowerCase()}@gmail.com`,
    password: `pass${nanoid().toLowerCase()}`,
    firstName: `firstName${nanoid().toLowerCase()}`,
    lastName: `lastName${nanoid().toLowerCase()}`,
    image: null,
  });
  const testSuperAdminAppProfile = await AppUserProfile.create({
    userId: testSuperAdmin._id,
    appLanguageCode: "en",
    isSuperAdmin: true,
  });
  await User.updateOne(
    {
      _id: testSuperAdmin._id,
    },
    {
      $set: {
        appUserProfileId: testSuperAdminAppProfile._id,
      },
    },
  );

  return testSuperAdmin;
};
