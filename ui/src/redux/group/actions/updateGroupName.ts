import { deserializeHash, serializeHash } from "@holochain-open-dev/core-types";
import { FUNCTIONS, ZOMES } from "../../../connection/types";
import { pushError } from "../../error/actions";
import { ThunkAction } from "../../types";
import {
  // action payload types
  UpdateGroupNameAction,
  // IO
  UpdateGroupNameData,
  // action types
  UPDATE_GROUP_NAME,
} from "../types";

const updateGroupName =
  (updateGroupNameData: UpdateGroupNameData): ThunkAction =>
  async (dispatch, getState, { callZome }): Promise<UpdateGroupNameData> => {
    const state = getState();
    const group = state.groups.conversations[updateGroupNameData.groupId];

    /* return err right away if the group name is the same as the old one */
    if (group.name === updateGroupNameData.name) {
      return dispatch(
        pushError("TOAST", {}, { id: "redux.err.group.update-group-name.1" })
      );
    }

    /* deserialize fields for zome fn */
    const input = {
      name: updateGroupNameData.name,
      groupId: deserializeHash(updateGroupNameData.groupId),
      groupRevisionId: deserializeHash(updateGroupNameData.groupRevisionId),
    };

    try {
      const updateGroupNameOutput = await callZome({
        zomeName: ZOMES.GROUP,
        fnName: FUNCTIONS[ZOMES.GROUP].UPDATE_GROUP_NAME,
        payload: input,
      });

      /* serializeHash returned value from zome fn */
      const updateGroupNameDataFromRes: UpdateGroupNameData = {
        name: updateGroupNameOutput.name,
        groupId: serializeHash(updateGroupNameOutput.groupId),
        groupRevisionId: serializeHash(updateGroupNameOutput.groupRevisionId),
      };

      dispatch<UpdateGroupNameAction>({
        type: UPDATE_GROUP_NAME,
        updateGroupNameData: updateGroupNameDataFromRes,
      });

      return updateGroupNameData;
    } catch (e) {
      /*
        We are not handling the "same name with old group name"
        as it is safe to assume that it is being handled above
      */
      if (e.message === "failed to get the given group id") {
        return dispatch(
          pushError("TOAST", {}, { id: "redux.err.group.update-group-name.2" })
        );
      } else {
        return dispatch(pushError("TOAST", {}, { id: "redux.err.generic" }));
      }
    }
  };

export default updateGroupName;
