import type { MutationResolvers } from "../../types/generatedGraphQLTypes";
import { User } from "../../models";
import { errors, requestContext } from "../../libraries";
import {
  LENGTH_VALIDATION_ERROR,
  FAMILY_MIN_MEMBERS_ERROR_CODE,
} from "../../constants";
import { superAdminCheck } from "../../utilities";
import { isValidString } from "../../libraries/validators/validateString";
import { Family } from "../../models/Family";
/**
 * This Function enables to create Family Groups
 * @param _parent - parent of current request
 * @param args - payload provided with the request
 * @param context - context of entire application
 * @remarks - The following checks are done:
 * 1. If the user exists
 * @returns Created Family Group
 */
export const createFamilyGroup: MutationResolvers["createFamilyGroup"] = async (
  _parent,
  args,
  context
) => {
  const currentUser = await User.findById({
    _id: context.userId,
  });

  if (currentUser) {
    superAdminCheck(currentUser);
  }

  let ValidationResultName = {
    isLessThanMaxLength: false,
  };

  if (args && args.data && typeof args.data.title === 'string') {
    ValidationResultName = isValidString(args.data.title, 256);
  }

  if (!ValidationResultName.isLessThanMaxLength) {
    throw new errors.InputValidationError(
      requestContext.translate(
        `${LENGTH_VALIDATION_ERROR.MESSAGE} 256 characters in name`
      ),
      LENGTH_VALIDATION_ERROR.CODE
    );
  }

  // Check if there are at least 2 members
  if (args.data?.userIds && args.data?.userIds.length < 2) {
    throw new errors.InputValidationError(
      requestContext.translate("Family must have at least 2 members."),
      FAMILY_MIN_MEMBERS_ERROR_CODE.CODE
    );
  }

  const familyTitle = args.data?.title;

  const createdFamily = await Family.create({
    ...args.data,
    title: familyTitle,
    users: [context.userId],
  });

  return createdFamily.toObject();
};
