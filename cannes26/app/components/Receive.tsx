import React from "react";
import QRCode from "react-qr-code";

const Receive = ({ adresse, show, onClose }: { adresse: string; show: boolean; onClose: () => void }) => {
  if (!adresse) return null;

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
            <h3>Adresse de l'utilisateur</h3>
            <p>{adresse}</p>
            <QRCode value={adresse} size={180} />
        </div>
    </main>
  );
};

export default Receive;