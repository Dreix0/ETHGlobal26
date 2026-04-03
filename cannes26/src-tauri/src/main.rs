// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
  tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![commands::write_text_to_file, commands::read_text_from_file])
        .run(tauri::generate_context!())
        .expect("Erreur lancement Tauri");
}