mod homebrew;

use homebrew::{
    check_homebrew, get_outdated, get_package_info, install_package, list_installed,
    search_packages, uninstall_package, upgrade_package,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            check_homebrew,
            list_installed,
            search_packages,
            get_package_info,
            install_package,
            uninstall_package,
            upgrade_package,
            get_outdated,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
