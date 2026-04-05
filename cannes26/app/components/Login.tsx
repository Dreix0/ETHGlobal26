import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { open } from "@tauri-apps/plugin-dialog";
import { Wallet } from "ethers";

export default function Login() {

  const router = useRouter();
  const [filePath, setFilePath] = useState<string | null>(null);

  async function getPath(){
    try {
        const filePath = await open({
        title: 'Choose a .plr file',
        multiple: false,
        filters: [
            {
            name: 'PLR Files',
            extensions: ['plr']
            }
        ]
        });

        setFilePath(filePath);
        localStorage.setItem("filePath", filePath as string);
        console.log("Selected file path: ", filePath);
    } catch (err) {
        console.error('Error selecting file:', err);
    }
  }

  async function readFile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      const data = await invoke("read_text_from_file", {filePath}) as string;

      const encryptedWallet = JSON.parse(data).wallet as string;
      const password = (e.currentTarget.elements.namedItem("password") as HTMLInputElement).value;
      const decryptedWallet = Wallet.fromEncryptedJsonSync(encryptedWallet, password);
      
      localStorage.setItem("auth", "true");
      router.push("/dashboard");
    } catch (err) {
      console.log("Error: " + err);
    }
  }

  return (
    <main>
      <h1>Login</h1>
      <button onClick={getPath}>
          Select your wallet
      </button> 

      {filePath && 
          <form onSubmit={readFile}>
              <input type="password" name="password" placeholder='Password'/>
              <button type="submit" >Suivant</button>
          </form>
      }
    </main>
  );
}
