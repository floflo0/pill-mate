import React, { useState } from "react";
import {
  Calendar,
  ClipboardList,
  Scan,
  Settings,
  Square,
  SquareCheckBig,
} from "lucide-react";
import styles from "./Dashboard.module.css"; // Import du fichier CSS

const Dashboard: React.FC = () => {
  const iconSize = "clamp(4rem, 10vw, 8rem)";
  const buttons = [
    {
      label: "Calendrier",
      icon: <Calendar size={iconSize} />,
      className: styles.blue,
    },
    {
      label: "Gestion des stocks",
      icon: <ClipboardList size={iconSize} />,
      className: styles.green,
    },
    {
      label: "Ordonnance",
      icon: <Scan size={iconSize} />,
      className: styles.red,
    },
    {
      label: "Paramètres",
      icon: <Settings size={iconSize} />,
      className: styles.orange,
    },
  ];
  const [isChecked, setIsChecked] = useState(false);
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  return (
    <div>
      <div className={styles.checkbox}>
        <label>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleCheckboxChange}
            style={{ display: "none" }}
          />
          <div className={styles.checkboxIcon}>
            {isChecked ? (
              <SquareCheckBig size={iconSize} />
            ) : (
              <Square size={iconSize} />
            )}
          </div>
        </label>
      </div>
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
    </div>
  );
};

export default Dashboard;
