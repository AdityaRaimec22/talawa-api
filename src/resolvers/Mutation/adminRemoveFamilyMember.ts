import {
  FAMILY_NOT_FOUND_ERROR,
  USER_NOT_AUTHORIZED_ERROR,
} from "../../constants";
import type { MutationResolvers } from "../../types/generatedGraphQLTypes";
import { errors, requestContext } from "../../libraries";
import { User } from "../../models";
import { Family } from "../../models/Family";
import { superAdminCheck } from "../../utilities";
/**
 * This function enables to remove a user from group chat.
 * @param _parent - parent of current request
 * @param args - payload provided with the request
 * @param context - context of entire publication
 * @remarks The following checks are done:
 * 1. If the family exists.
 * 2. If the user to be removed is member of the organisation.
 * @returns Updated group chat.
 */
export const removeUserFromFamily: MutationResolvers["removeUserFromFamily"] =
  async (_parent, args, context) => {
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

    //Check whether family exists
    if (!family) {
      throw new errors.NotFoundError(
        requestContext.translate(FAMILY_NOT_FOUND_ERROR.MESSAGE),
        FAMILY_NOT_FOUND_ERROR.CODE,
        FAMILY_NOT_FOUND_ERROR.PARAM
      );
    }

    const userIsMemberOfFamily = family.users.some((user) => {
      user.equals(args.userId);
    });

    // Checks if user with _id === args.userId is not a member of family.
    if (userIsMemberOfFamily === false) {
      throw new errors.UnauthorizedError(
        requestContext.translate(USER_NOT_AUTHORIZED_ERROR.MESSAGE),
        USER_NOT_AUTHORIZED_ERROR.CODE,
        USER_NOT_AUTHORIZED_ERROR.PARAM
      );
    }

    //Removes args.userId from users list of family ans return the updated family.
    return await Family.findOneAndUpdate(
      {
        _id: args.familyId,
      },
      {
        $set: {
          users: family.users.filter(
            (user) => user.toString() !== args.userId.toString()
          ),
        },
      },
      {
        new: true,
      }
    ).lean();
  };
