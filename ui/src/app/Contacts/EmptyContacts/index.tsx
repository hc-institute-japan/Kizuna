import { IonIcon, IonText } from "@ionic/react";
import { sadOutline } from "ionicons/icons";
import React from "react";
import { useIntl } from "react-intl";
import styles from "./style.module.css";

const EmptyContacts: React.FC = () => {
  const intl = useIntl();
  return (
    <div className={styles["empty-contacts"]}>
      <IonIcon icon={sadOutline} />
      <IonText className="ion-padding ion-margin-bottom">
        {intl.formatMessage({ id: "app.contacts.empty-contact-list" })}
      </IonText>
    </div>
  );
};

export default EmptyContacts;
