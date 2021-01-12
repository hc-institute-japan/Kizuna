#![allow(unused_imports)]// temporaly added

use hdk3::prelude::*;

mod entries;
mod utils;
mod test_utils;

use entries::group::{
    Group,
    GroupMembers,
    CreateGroupInput,
    GroupSecretKey
};

use entries::group;

entry_defs![Group::entry_def(),GroupMembers::entry_def(), GroupSecretKey::entry_def() ];

#[hdk_extern]
fn recv_remote_signal(signal: SerializedBytes) -> ExternResult<()> {
    emit_signal(&signal)?;
    Ok(())
}

#[hdk_extern]
fn create_group(create_group_input: CreateGroupInput) -> ExternResult<Group>{
    group::handlers::create_group(create_group_input)
}

// testing methods 
#[hdk_extern]
fn get_group_members(group:Group)->HdkResult<GroupMembers>{
    test_utils::get_group_members(group)
}