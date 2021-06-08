import { serializeHash } from "@holochain-open-dev/core-types";
import { AgentPubKey } from "@holochain/conductor-api";
import { FUNCTIONS, ZOMES } from "../../../../connection/types";
import {
  deserializeAgentPubKey,
  timestampToDate,
} from "../../../../utils/helpers";
import { Profile } from "../../../profile/types";
import { ThunkAction } from "../../../types";
import { AddGroupAction, ADD_GROUP, GroupConversation } from "../../types";

const addedToGroup =
  (signalPayload: any): ThunkAction =>
  async (dispatch, getState, { callZome, getAgentId }) => {
    const { payload } = signalPayload;

    const contacts = getState().contacts.contacts;
    const username = getState().profile.username!; // At this point, username is non-nullable
    const id = await getAgentId();
    const myAgentId = serializeHash(id!); // AgentPubKey should be non-nullable here

    const groupData: GroupConversation = {
      originalGroupId: serializeHash(payload.groupId),
      originalGroupRevisionId: serializeHash(payload.groupRevisionId),
      name: payload.latestName,
      members: payload.members.map((member: Buffer) => serializeHash(member)),
      createdAt: timestampToDate(payload.created),
      creator: serializeHash(payload.creator),
      /* 
        Messages are empty at the creation of group
        This creates a tad bit of delay in rendering group in Conversations page
        as group conversation is created first and then the first message
        arrives with signal
      */
      messages: [],
    };

    /* 
    Attempt to get the profile of group members from own contacts list.
    If not found from contacts nor own AgentPubKey, then push it to
    undefinedProfiles
    */
    const groupMembers = [...groupData.members, groupData.creator];
    const membersProfile: { [key: string]: Profile } = {};
    const nonAddedProfiles: AgentPubKey[] = groupMembers.reduce(
      (res, member: any) => {
        const memberProfile: Profile | null = contacts[member]
          ? contacts[member]
          : member === myAgentId
          ? {
              id: myAgentId,
              username,
            }
          : null;
        if (memberProfile) {
          membersProfile[member] = memberProfile;
        } else {
          const pubkey = deserializeAgentPubKey(member);
          res.push(pubkey);
        }
        return res;
      },
      [] as AgentPubKey[]
    );

    // get the profiles not in contacts from HC
    if (nonAddedProfiles?.length) {
      const profiles = await callZome({
        zomeName: ZOMES.USERNAME,
        fnName: FUNCTIONS[ZOMES.USERNAME].GET_USERNAMES,
        payload: nonAddedProfiles,
      });
      profiles.forEach(({ agentId, username }: any) => {
        let base64 = serializeHash(agentId);
        membersProfile[base64] = {
          id: base64,
          username,
        };
      });
    }
    dispatch<AddGroupAction>({
      type: ADD_GROUP,
      groupData,
      membersProfile,
    });
  };

export default addedToGroup;
