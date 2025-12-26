mod homebrew;

use homebrew::{
    check_homebrew, cleanup_homebrew, get_homebrew_info, get_outdated, get_package_info,
    install_package, list_installed, search_packages, uninstall_package, update_homebrew,
    upgrade_all, upgrade_package,
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
            upgrade_all,
            get_outdated,
            update_homebrew,
            cleanup_homebrew,
            get_homebrew_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
