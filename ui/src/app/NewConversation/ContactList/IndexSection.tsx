import { IonItemDivider, IonLabel } from "@ionic/react";
import React from "react";
import { Profile } from "../../../redux/profile/types";
import { useContacts } from "../context";
import ContactItem from "./ContactItem";

interface Props {
  char: string;
  contacts: Profile[];
}

const IndexSection: React.FC<Props> = ({ char, contacts }) => {
  const setContacts = useContacts()[1];
  const setSelectedContacts = useContacts()[3];

  const handleOnClick = (contact: Profile) => {
    setSelectedContacts((currContacts) => {
      currContacts[JSON.stringify(contact.id)] = contact;
      return currContacts;
    });
    setContacts((currContacts) => {
      delete currContacts[JSON.stringify(contact.id)];
      return { ...currContacts };
    });
  };

  return (
    <React.Fragment key={char}>
      <IonItemDivider>
        <IonLabel>{char}</IonLabel>
      </IonItemDivider>
      {contacts.map((contact) => (
        <ContactItem
          key={JSON.stringify(contact)}
          contact={contact}
          onClick={handleOnClick}
        />
      ))}
    </React.Fragment>
  );
};

export default IndexSection;