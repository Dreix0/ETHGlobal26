// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use tauri_plugin_dialog;
use tauri_plugin_log;

fn main() {
  tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_log::Builder::default().level(log::LevelFilter::Info).build())
        .invoke_handler(tauri::generate_handler![commands::write_text_to_file, commands::read_text_from_file])
        .run(tauri::generate_context!())
        .expect("Error launching Tauri");
}