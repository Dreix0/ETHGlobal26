import React from "react";
// import { QRCode } from "qrcode.react";

interface ReceiveProps {
  adresse: string;
  show: boolean;
  onClose: () => void;
}

const Receive: React.FC<ReceiveProps> = ({ adresse, show, onClose }) => {
  if (!adresse || !show) return null;

  const handlePopupClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  return (
    <main className="overlay" onClick={onClose}>
      <div className="popup" onClick={handlePopupClick}>
        <button className="closeBtn" onClick={onClose}>
          &times;
        </button>
        <h3>Adresse de l'utilisateur</h3>
        <p>{adresse}</p>
        <div style={{ width: 128, height: 128 }}>
          {/* <QRCode value={adresse} size={128} /> */}
        </div>
      </div>
    </main>
  );
};

export default Receive;