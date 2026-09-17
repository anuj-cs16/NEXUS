use tauri::Manager;

/// Health check IPC command — verifies Tauri shell is responsive.
#[tauri::command]
fn health_check() -> String {
    serde_json::json!({
        "status": "ok",
        "shell": "tauri",
        "version": env!("CARGO_PKG_VERSION")
    })
    .to_string()
}

/// Get backend API URL from app configuration.
#[tauri::command]
fn get_backend_url() -> String {
    // Default backend URL — configurable via settings in future
    "http://127.0.0.1:8000".to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![health_check, get_backend_url])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running NEXUS desktop application");
}
