import { FC } from "react";
import styles from "./UsdToggle.module.scss";
import { FaDollarSign } from "react-icons/fa";
import { ReactComponent as CoinStack } from "./../../../../assets/images/coinStack.svg";

interface IProps {
    showInUsd: boolean;
    handleToggleShowInUsdc: () => void;
}

export const UsdToggle: FC<IProps> = ({ showInUsd, handleToggleShowInUsdc }) => {
    return (
        <div className={styles.darkmode_toggle_container}>
            <div
                className={`${styles.lighttoggle} ${showInUsd && styles.lighttoggle_on}`}
                onClick={handleToggleShowInUsdc}
            >
                <div style={{ padding: 3, display: "flex", justifyContent: "center", alignItems: "center" }}>
                    {showInUsd ? <CoinStack width={16} height={16} /> : <FaDollarSign size={16} />}
                </div>
                <div className={`${styles.lighttoggle_switch} ${showInUsd && styles.lighttoggle_switch_on}`}>
                    {showInUsd ? <FaDollarSign size={16} /> : <CoinStack width={16} height={16} />}
                </div>
            </div>
        </div>
    );
};
