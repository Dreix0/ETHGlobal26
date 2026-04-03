use std::fs;
use std::path::Path;

#[tauri::command]
pub fn write_text_to_file(file_path: String, content: String) -> Result<String, String> {
    let path = Path::new(&file_path);

    // Crée le dossier si nécessaire
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            if let Err(e) = fs::create_dir_all(parent) {
                return Err(format!("Erreur création dossier : {}", e));
            }
        }
    }

    // Écrit le fichier
    match fs::write(&path, content) {
        Ok(_) => Ok(format!("Fichier enregistré : {}", path.display())),
        Err(e) => Err(format!("Erreur écriture fichier : {}", e)),
    }
}

#[tauri::command]
pub fn read_text_from_file(file_path: String) -> Result<String, String> {
    let path = Path::new(&file_path);

    // Vérifie que le fichier existe
    if !path.exists() {
        return Err(format!("Le fichier n'existe pas : {}", path.display()));
    }

    // Vérifie que c'est bien un fichier
    if !path.is_file() {
        return Err(format!("Le chemin n'est pas un fichier : {}", path.display()));
    }

    // Lit le fichier
    match fs::read_to_string(&path) {
        Ok(content) => Ok(content),
        Err(e) => Err(format!("Erreur lecture fichier : {}", e)),
    }
}