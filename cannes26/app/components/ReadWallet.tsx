// Utile ??


import { useState } from "react";
import { HDNodeWallet, Wallet } from "ethers";
import { invoke } from "@tauri-apps/api/core";

export default function ReadWallet() {
  const [wallet, setWallet] = useState<HDNodeWallet | Wallet>();

  async function connect(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Remplace ce chemin par un emplacement sur ton disque ou USB
    const filePath = "C:/Users/quent/Desktop/Test/mon_texte.txt";

    try {
      const data = await invoke("read_text_from_file", {filePath}) as string;
      const encryptedWallet = JSON.parse(data).wallet as string;

      const decryptedWallet = Wallet.fromEncryptedJsonSync(encryptedWallet, e.target.password.value);
      setWallet(decryptedWallet);

    } catch (err) {
      console.log("Erreur : " + err);
    }
  }

  return (
    <main>
      <div>
          <h3>Saisissez un mot de passe</h3>
          <form onSubmit={connect}>
              <input type="password" name="password" placeholder='Mot de passe'/>
              <button type="submit" >Suivant</button>
          </form>
      </div>
      <br />
      <p>Address: {wallet ? wallet.address : "No wallet generated"}</p>
      <p>Private Key: {wallet ? wallet.privateKey : "No wallet generated"}</p>
      <p>Mnemonic: {wallet ? wallet.mnemonic?.phrase : "No wallet generated"}</p>
    </main>
  );
}
