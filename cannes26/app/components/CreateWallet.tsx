import { useState } from "react";
import { Wallet, HDNodeWallet } from "ethers";
import { invoke } from "@tauri-apps/api/core";
import { useRouter } from "next/navigation";
import { open } from "@tauri-apps/plugin-dialog";

export default function CreateWallet({ show, onClose }: { show: boolean, onClose: () => void }) {
    const [wallet, setWallet] = useState<HDNodeWallet>();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [folderPath, setFolderPath] = useState<string | null>(null);
    const [password, setPassword] = useState("");
    const router = useRouter();

    // Slide 1 : Choisir un dossier
    const SlideFolder = (
        <div>
            <h2>Étape 1 : Choisir un dossier</h2>
            <p>Choisissez un dossier où votre wallet sera enregistré.</p>
            <button
                onClick={async () => {
                    const path = await open({ title: "Choisir un dossier", multiple: false, directory: true });
                    console.log("Dossier sélectionné : ", path);
                    if (path) {
                        setFolderPath(path as string);
                        setCurrentSlide(1);
                    }
                }}
            >
                Sélectionner un dossier
            </button>
        </div>
    );

    // Slide 2 : Mot de passe
    const SlidePassword = (
        <div>
            <h2>Étape 2 : Définir un mot de passe</h2>
            {folderPath && <p>Dossier sélectionné : {folderPath}</p>}
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    if (!folderPath) {
                        alert("Veuillez d'abord sélectionner un dossier");
                        setCurrentSlide(0);
                        return;
                    }
                    if (!password) {
                        alert("Veuillez entrer un mot de passe");
                        return;
                    }

                    try {
                        const newWallet = Wallet.createRandom();
                        setWallet(newWallet);

                        const encryptedWallet = await newWallet.encrypt(password);
                        const content: string = JSON.stringify({
                            token: [
                                { name: "Ethereum", symbol: "ETH", address: "", decimals: 18, balance: "0" },
                            ],
                            wallet: encryptedWallet,
                        });

                        const filePath = folderPath + "/wallet.plr";
                        await invoke("write_text_to_file", { filePath, content });

                        setCurrentSlide(2);
                    } catch (err) {
                        console.error("Erreur : ", err);
                        alert("Erreur lors de la création du wallet");
                    }
                }}
            >
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mot de passe"
                    required
                />
                <button type="submit">Suivant</button>
            </form>
        </div>
    );

    // Slide 3 : Affichage de la mnemonic
    const SlideMnemonic = (
        <div>
            <h2>Étape 3 : Récupérer votre seed phrase</h2>
            <p>
                Conservez cette seed phrase précieusement. Elle permet de restaurer votre wallet :
            </p>
            <textarea
                readOnly
                value={wallet?.mnemonic?.phrase || ""}
                style={{ width: "100%", height: "100px" }}
            />
            <br />
            <button onClick={() => router.push("/dashboard")}>Terminer</button>
        </div>
    );

    const slides = [SlideFolder, SlidePassword, SlideMnemonic];

    // Fonction pour stopper la propagation du clic à l'overlay
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

            <div className="slideContent">
            {slides[currentSlide]}
            </div>
        </div>
    </main>
    );
}
