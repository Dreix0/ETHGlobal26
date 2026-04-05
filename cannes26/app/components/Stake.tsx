import React from "react";
import QRCode from "react-qr-code";

const Stake = ({ show, onClose }: { show: boolean; onClose: () => void }) => {

    const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };
    
    if (!show) return null;
    return (
    <main className="overlay" onClick={onClose}>
        <div className="popup" onClick={handlePopupClick}>
            <button className="closeBtn" onClick={onClose}>
            &times;
            </button>
            <h3>Comming soon</h3>
        </div>
    </main>
  );
};

export default Stake;