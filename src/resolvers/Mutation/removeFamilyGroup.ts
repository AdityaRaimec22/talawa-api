import { superAdminCheck } from "../../utilities";
import { FAMILY_NOT_FOUND_ERROR } from "../../constants";
import type { MutationResolvers } from "../../types/generatedGraphQLTypes";
import { errors, requestContext } from "../../libraries";
import { Family } from "../../models/Family";
import { User } from "../../models";
/**
 * This function enables to remove a family group.
 * @param _parent - parent of current request
 * @param args - payload provided with the request
 * @context The following checks are done:
 * 1. If the family group exists
 * 2. If the user is superAdmin
 * @returns Deleted family group.
 */
export const removeFamily: MutationResolvers["removeFamily"] = async (
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

  if (currentUser) {
    superAdminCheck(currentUser);
  }

  // Checks if a family with _id === args.familyId exists
  if (!family) {
    throw new errors.NotFoundError(
      requestContext.translate(FAMILY_NOT_FOUND_ERROR.MESSAGE),
      FAMILY_NOT_FOUND_ERROR.CODE,
      FAMILY_NOT_FOUND_ERROR.PARAM
    );
  }

  await Family.deleteOne({
    _id: family._id,
  });

  return family;
};
