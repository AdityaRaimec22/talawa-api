import type { PopulatedDoc, Types, Document, Model } from "mongoose";
import { Schema, model, models } from "mongoose";
import type { InterfaceUser } from "./User";
/**
 * This is an interface that represents a database(MongoDB) document for Family.
 */

export interface InterfaceFamily {
  _id: Types.ObjectId;
  title: string;
  users: PopulatedDoc<InterfaceUser & Document>[];
}

/**
 * @param  title - Name of the Family (type: String)
 * Description: Name of the Family.
 */

/**
 * @param  users - Members associated with the Family (type: String)
 * Description: Members associated with the Family.
 */
const FamilySchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  users: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
});

// $2a$12$usOiKueW0FsZfpUuGNrAQuxvM.AB/nCOsHLdpE0liAcUr5PHOuc2K

//token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlblZlcnNpb24iOjcsInVzZXJJZ

const familyModel = (): Model<InterfaceFamily> =>
  model<InterfaceFamily>("Family", FamilySchema);

// This syntax is needed to prevent Mongoose OverwriteModelError while running tests.
export const Family = (models.Family || familyModel()) as ReturnType<
  typeof familyModel
>;
