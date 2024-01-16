import "dotenv/config";
import type { MutationResolvers } from "../../types/generatedGraphQLTypes";
import { errors, requestContext } from "../../libraries";
import { superAdminCheck } from "../../utilities";
import { User } from "../../models";
import { Family } from "../../models/Family";
import {
  FAMILY_NOT_FOUND_ERROR,
  USER_ALREADY_MEMBER_ERROR,
  USER_NOT_FOUND_ERROR,
} from "../../constants";
/**
 * This function adds user to the family.
 * @param _parent - parent of current request
 * @param args - payload provided with the request
 * @param context - context of the entire application
 * @remarks The following checks are done:
 * 1. If the family exists
 * 2. If the user exists
 * 3. If the user is already member of the family
 * @returns Updated family
 */
export const addUserToFamily: MutationResolvers["addUserToFamily"] = async (
  _parent,
  args,
  context
) => {
  const family = await Family.findOne({
    _id: args.familyId,
  }).lean();

  const currentUser = await User.findById({
    _id: context.userId,
  });

  //check whether user is superadmin
  if (currentUser) {
    superAdminCheck(currentUser);
  }

  //check wheather family exists
  if (!family) {
    throw new errors.NotFoundError(
      requestContext.translate(FAMILY_NOT_FOUND_ERROR.MESSAGE),
      FAMILY_NOT_FOUND_ERROR.CODE,
      FAMILY_NOT_FOUND_ERROR.PARAM
    );
  }

  // Checks whether user with _id === args.userId exists.
  if (currentUser === null) {
    throw new errors.NotFoundError(
      requestContext.translate(USER_NOT_FOUND_ERROR.MESSAGE),
      USER_NOT_FOUND_ERROR.CODE,
      USER_NOT_FOUND_ERROR.PARAM
    );
  }

  const isUserFamilyMember = family.users.some((user) => {
    user.equals(args.userId);
  });

  // Checks whether user with _id === args.userId is already a member of Family.
  if (isUserFamilyMember === true) {
    throw new errors.ConflictError(
      requestContext.translate(USER_ALREADY_MEMBER_ERROR.MESSAGE),
      USER_ALREADY_MEMBER_ERROR.CODE,
      USER_ALREADY_MEMBER_ERROR.PARAM
    );
  }

  // Adds args.userId to users lists on family group and return the updated family.
  return await Family.findOneAndUpdate(
    {
      _id: args.familyId,
    },
    {
      $push: {
        users: args.userId,
      },
    },
    {
      new: true,
    }
  ).lean();
};
