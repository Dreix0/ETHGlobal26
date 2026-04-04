import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { open } from "@tauri-apps/plugin-dialog";
import { Wallet } from "ethers";


type TokenData = {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  balance: bigint;
};

export default function Login() {

  const router = useRouter();
  const [filePath, setFilePath] = useState<string | null>(null);

  async function getPath(){
    try {
        const filePath = await open({
        title: 'Choisir un fichier .plr',
        multiple: false,
        filters: [
            {
            name: 'PLR Files',
            extensions: ['plr']
            }
        ]
        });

        // Vérifie que le fichier soit au bon format
        setFilePath(filePath);
        localStorage.setItem("filePath", filePath as string);
        console.log("Chemin du fichier sélectionné : ", filePath);
    } catch (err) {
        console.error('Erreur lors de la sélection du fichier :', err);
    }
  }

  async function readFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const data = await invoke("read_text_from_file", {filePath}) as string;

      const encryptedWallet = JSON.parse(data).wallet as string;
      const decryptedWallet = Wallet.fromEncryptedJsonSync(encryptedWallet, e.target.password.value);
      
      localStorage.setItem("auth", "true");
      router.push("/dashboard");
    } catch (err) {
      console.log("Erreur : " + err);
    }
  }

  return (
    <main>
        <button onClick={getPath}>
            Sélectionner un fichier .plr
        </button> 

        {filePath && 
            <form onSubmit={readFile}>
                <input type="password" name="password" placeholder='Mot de passe'/>
                <button type="submit" >Suivant</button>
            </form>
        }
    </main>
  );
}
