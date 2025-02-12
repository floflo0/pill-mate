import React from "react";
import { Calendar, ClipboardList, Scan, Settings } from "lucide-react";
import styles from "./Dashboard.module.css"; // Import du fichier CSS

const Dashboard: React.FC = () => {
  const buttons = [
    {
      label: "Calendrier",
      icon: <Calendar size={200} />,
      className: styles.blue,
    },
    {
      label: "Gestion des stocks",
      icon: <ClipboardList size={200} />,
      className: styles.green,
    },
    { label: "Ordonnance", icon: <Scan size={200} />, className: styles.red },
    {
      label: "Paramètres",
      icon: <Settings size={200} />,
      className: styles.orange,
    },
  ];

  return (
    <div className={styles.container}>
      {buttons.map((btn, index) => (
        <div key={index} className={`${styles.button} ${btn.className}`}>
          <div
            className={styles.icon}
            onClick={() => console.log(`${btn.label} cliqué !`)}
          >
            {btn.icon}
          </div>
          <span>{btn.label}</span>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
