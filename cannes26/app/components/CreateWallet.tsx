import { useState } from "react";
import { Wallet, HDNodeWallet } from "ethers";
import { invoke } from "@tauri-apps/api/core";

export default function CreateWallet() {
    const [wallet, setWallet] = useState<HDNodeWallet>();

    async function newWallet(e : React.FormEvent<HTMLFormElement>) {
        /* 
        Fonction qui permet de créer un nouveau wallet, le crypter (par le mot de passe entré par l'utilisateur, lui même crypté) 
        avant de le stocker et retourner la seed phrase 
        */
        e.preventDefault();

        // Remplace ce chemin par un emplacement sur ton disque ou USB
        const filePath = "C:/Users/quent/Desktop/Test/mon_texte.txt";

        try{
            const newWallet = Wallet.createRandom(); // Crypter directement le wallet avec le mot de passe de l'utilisateur ?
            setWallet(newWallet);
            const encryptedWallet = await newWallet.encrypt(e.currentTarget.password.value);
            const content : string = JSON.stringify({
                token: [{
                    "name": "Ethereum",
                    "symbol": "ETH",
                    "decimals": 18,
                    "balance": "0"
                }],
                wallet: encryptedWallet
            });


            const response = await invoke("write_text_to_file", {filePath, content: newWallet ? content : "No wallet generated"});
            console.log(response);

        } catch(err) {
            console.log("Erreur : " + err)
        }
    }

    return (
    <main>
        <div>
            <h3>Saisissez un mot de passe</h3>
            <form onSubmit={newWallet}>
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
