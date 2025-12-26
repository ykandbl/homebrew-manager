use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::Emitter;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Package {
    pub name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub pkg_type: String,
    pub installed: bool,
    pub outdated: bool,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PackageInfo {
    pub name: String,
    pub full_name: String,
    pub version: String,
    #[serde(rename = "type")]
    pub pkg_type: String,
    pub description: String,
    pub homepage: String,
    pub installed: bool,
    pub installed_version: Option<String>,
    pub outdated: bool,
    pub dependencies: Vec<String>,
    pub install_path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OutdatedPackage {
    pub name: String,
    pub current_version: String,
    pub latest_version: String,
    #[serde(rename = "type")]
    pub pkg_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CommandOutput {
    pub success: bool,
    pub stdout: String,
    pub stderr: String,
    pub exit_code: i32,
}

/// 获取 brew 命令的完整路径
fn get_brew_path() -> String {
    // 尝试常见的 Homebrew 安装路径
    let paths = [
        "/opt/homebrew/bin/brew",  // Apple Silicon Mac
        "/usr/local/bin/brew",      // Intel Mac
        "brew",                      // 在 PATH 中
    ];
    
    for path in paths {
        if let Ok(output) = Command::new("test").args(["-x", path]).status() {
            if output.success() {
                return path.to_string();
            }
        }
    }
    
    "brew".to_string()
}

/// 执行 brew 命令
fn execute_brew_command(args: &[&str]) -> Result<CommandOutput, String> {
    let brew_path = get_brew_path();
    
    let output = Command::new(&brew_path)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute brew command: {}", e))?;
    
    Ok(CommandOutput {
        success: output.status.success(),
        stdout: String::from_utf8_lossy(&output.stdout).to_string(),
        stderr: String::from_utf8_lossy(&output.stderr).to_string(),
        exit_code: output.status.code().unwrap_or(-1),
    })
}

/// 检查 Homebrew 是否安装
#[tauri::command]
pub async fn check_homebrew() -> Result<bool, String> {
    let brew_path = get_brew_path();
    
    let output = Command::new(&brew_path)
        .arg("--version")
        .output();
    
    match output {
        Ok(o) => Ok(o.status.success()),
        Err(_) => Ok(false),
    }
}

/// 列出所有已安装的包
#[tauri::command]
pub async fn list_installed() -> Result<Vec<Package>, String> {
    let mut packages = Vec::new();
    
    // 获取已安装的 formulas
    let formula_output = execute_brew_command(&["list", "--formula", "--versions"])?;
    if formula_output.success {
        for line in formula_output.stdout.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if let Some(name) = parts.first() {
                let version = parts.get(1).unwrap_or(&"").to_string();
                packages.push(Package {
                    name: name.to_string(),
                    version,
                    pkg_type: "formula".to_string(),
                    installed: true,
                    outdated: false,
                    description: None,
                });
            }
        }
    }
    
    // 获取已安装的 casks
    let cask_output = execute_brew_command(&["list", "--cask", "--versions"])?;
    if cask_output.success {
        for line in cask_output.stdout.lines() {
            let parts: Vec<&str> = line.split_whitespace().collect();
            if let Some(name) = parts.first() {
                let version = parts.get(1).unwrap_or(&"").to_string();
                packages.push(Package {
                    name: name.to_string(),
                    version,
                    pkg_type: "cask".to_string(),
                    installed: true,
                    outdated: false,
                    description: None,
                });
            }
        }
    }
    
    // 获取过时的包并标记
    if let Ok(outdated) = get_outdated_internal() {
        for outdated_pkg in outdated {
            if let Some(pkg) = packages.iter_mut().find(|p| p.name == outdated_pkg.name) {
                pkg.outdated = true;
            }
        }
    }
    
    Ok(packages)
}

/// 内部函数：获取过时的包
fn get_outdated_internal() -> Result<Vec<OutdatedPackage>, String> {
    let output = execute_brew_command(&["outdated", "--json"])?;
    
    if !output.success {
        return Ok(vec![]);
    }
    
    #[derive(Debug, Deserialize)]
    struct OutdatedJson {
        formulae: Vec<OutdatedFormula>,
        casks: Vec<OutdatedCask>,
    }
    
    #[derive(Debug, Deserialize)]
    struct OutdatedFormula {
        name: String,
        installed_versions: Vec<String>,
        current_version: String,
    }
    
    #[derive(Debug, Deserialize)]
    struct OutdatedCask {
        name: String,
        installed_versions: String,
        current_version: String,
    }
    
    let json: OutdatedJson = serde_json::from_str(&output.stdout)
        .map_err(|e| format!("Failed to parse outdated JSON: {}", e))?;
    
    let mut result = Vec::new();
    
    for f in json.formulae {
        result.push(OutdatedPackage {
            name: f.name,
            current_version: f.installed_versions.first().cloned().unwrap_or_default(),
            latest_version: f.current_version,
            pkg_type: "formula".to_string(),
        });
    }
    
    for c in json.casks {
        result.push(OutdatedPackage {
            name: c.name,
            current_version: c.installed_versions,
            latest_version: c.current_version,
            pkg_type: "cask".to_string(),
        });
    }
    
    Ok(result)
}

/// 搜索包
#[tauri::command]
pub async fn search_packages(query: String) -> Result<Vec<Package>, String> {
    if query.trim().is_empty() {
        return Ok(vec![]);
    }
    
    let output = execute_brew_command(&["search", &query])?;
    
    if !output.success {
        return Err(format!("Search failed: {}", output.stderr));
    }
    
    let mut packages = Vec::new();
    let mut is_cask_section = false;
    
    for line in output.stdout.lines() {
        let line = line.trim();
        
        if line.is_empty() {
            continue;
        }
        
        if line.starts_with("==> Formulae") {
            is_cask_section = false;
            continue;
        }
        
        if line.starts_with("==> Casks") {
            is_cask_section = true;
            continue;
        }
        
        if line.starts_with("==>") {
            continue;
        }
        
        // 解析包名（可能包含版本信息）
        let name = line.split_whitespace().next().unwrap_or(line);
        
        packages.push(Package {
            name: name.to_string(),
            version: String::new(),
            pkg_type: if is_cask_section { "cask" } else { "formula" }.to_string(),
            installed: false,
            outdated: false,
            description: None,
        });
    }
    
    Ok(packages)
}

/// 获取包详情
#[tauri::command]
pub async fn get_package_info(name: String, is_cask: bool) -> Result<PackageInfo, String> {
    let args = if is_cask {
        vec!["info", "--cask", "--json=v2", &name]
    } else {
        vec!["info", "--json=v2", &name]
    };
    
    let output = execute_brew_command(&args)?;
    
    if !output.success {
        return Err(format!("Failed to get package info: {}", output.stderr));
    }
    
    #[derive(Debug, Deserialize)]
    struct InfoJson {
        formulae: Vec<FormulaInfo>,
        casks: Vec<CaskInfo>,
    }
    
    #[derive(Debug, Deserialize)]
    struct FormulaVersions {
        stable: Option<String>,
    }
    
    #[derive(Debug, Deserialize)]
    struct InstalledVersion {
        version: String,
    }
    
    #[derive(Debug, Deserialize)]
    struct FormulaInfo {
        name: String,
        full_name: String,
        desc: Option<String>,
        homepage: Option<String>,
        versions: FormulaVersions,
        installed: Vec<InstalledVersion>,
        outdated: bool,
        dependencies: Option<Vec<String>>,
    }
    
    #[derive(Debug, Deserialize)]
    struct CaskInfo {
        token: String,
        full_token: String,
        desc: Option<String>,
        homepage: Option<String>,
        version: String,
        installed: Option<String>,
        outdated: bool,
    }
    
    let json: InfoJson = serde_json::from_str(&output.stdout)
        .map_err(|e| format!("Failed to parse info JSON: {}", e))?;
    
    if is_cask {
        if let Some(cask) = json.casks.first() {
            return Ok(PackageInfo {
                name: cask.token.clone(),
                full_name: cask.full_token.clone(),
                version: cask.version.clone(),
                pkg_type: "cask".to_string(),
                description: cask.desc.clone().unwrap_or_default(),
                homepage: cask.homepage.clone().unwrap_or_default(),
                installed: cask.installed.is_some(),
                installed_version: cask.installed.clone(),
                outdated: cask.outdated,
                dependencies: vec![],
                install_path: None,
            });
        }
    } else {
        if let Some(formula) = json.formulae.first() {
            let installed_version = formula.installed.first().map(|v| v.version.clone());
            return Ok(PackageInfo {
                name: formula.name.clone(),
                full_name: formula.full_name.clone(),
                version: formula.versions.stable.clone().unwrap_or_default(),
                pkg_type: "formula".to_string(),
                description: formula.desc.clone().unwrap_or_default(),
                homepage: formula.homepage.clone().unwrap_or_default(),
                installed: !formula.installed.is_empty(),
                installed_version,
                outdated: formula.outdated,
                dependencies: formula.dependencies.clone().unwrap_or_default(),
                install_path: None,
            });
        }
    }
    
    Err("Package not found".to_string())
}

/// 安装包（带实时输出）
#[tauri::command]
pub async fn install_package(
    name: String,
    is_cask: bool,
    window: tauri::Window,
) -> Result<CommandOutput, String> {
    let args: Vec<String> = if is_cask {
        vec!["install".to_string(), "--cask".to_string(), name.clone()]
    } else {
        vec!["install".to_string(), name.clone()]
    };
    
    execute_brew_command_with_progress(&args, &window, &name).await
}

/// 执行 brew 命令并实时发送进度
async fn execute_brew_command_with_progress(
    args: &[String],
    window: &tauri::Window,
    package_name: &str,
) -> Result<CommandOutput, String> {
    use std::io::{BufRead, BufReader};
    use std::process::Stdio;
    
    let brew_path = get_brew_path();
    
    let mut child = Command::new(&brew_path)
        .args(args)
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn brew command: {}", e))?;
    
    let stdout = child.stdout.take();
    let stderr = child.stderr.take();
    
    let mut all_stdout = String::new();
    let mut all_stderr = String::new();
    
    // 读取 stdout
    if let Some(stdout) = stdout {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            if let Ok(line) = line {
                all_stdout.push_str(&line);
                all_stdout.push('\n');
                // 发送进度事件到前端
                let _ = window.emit("install-progress", serde_json::json!({
                    "package": package_name,
                    "line": line,
                    "type": "stdout"
                }));
            }
        }
    }
    
    // 读取 stderr（brew 的进度信息通常在 stderr）
    if let Some(stderr) = stderr {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            if let Ok(line) = line {
                all_stderr.push_str(&line);
                all_stderr.push('\n');
                // 发送进度事件到前端
                let _ = window.emit("install-progress", serde_json::json!({
                    "package": package_name,
                    "line": line,
                    "type": "stderr"
                }));
            }
        }
    }
    
    let status = child.wait().map_err(|e| format!("Failed to wait for command: {}", e))?;
    
    Ok(CommandOutput {
        success: status.success(),
        stdout: all_stdout,
        stderr: all_stderr,
        exit_code: status.code().unwrap_or(-1),
    })
}

/// 卸载包（带实时输出）
#[tauri::command]
pub async fn uninstall_package(
    name: String,
    is_cask: bool,
    window: tauri::Window,
) -> Result<CommandOutput, String> {
    let args: Vec<String> = if is_cask {
        vec!["uninstall".to_string(), "--cask".to_string(), name.clone()]
    } else {
        vec!["uninstall".to_string(), name.clone()]
    };
    
    execute_brew_command_with_progress(&args, &window, &name).await
}

/// 更新包（带实时输出）
#[tauri::command]
pub async fn upgrade_package(
    name: String,
    is_cask: bool,
    window: tauri::Window,
) -> Result<CommandOutput, String> {
    let args: Vec<String> = if is_cask {
        vec!["upgrade".to_string(), "--cask".to_string(), name.clone()]
    } else {
        vec!["upgrade".to_string(), name.clone()]
    };
    
    execute_brew_command_with_progress(&args, &window, &name).await
}

/// 获取过时的包
#[tauri::command]
pub async fn get_outdated() -> Result<Vec<OutdatedPackage>, String> {
    get_outdated_internal()
}


/// 更新 Homebrew（brew update）
#[tauri::command]
pub async fn update_homebrew(window: tauri::Window) -> Result<CommandOutput, String> {
    let args = vec!["update".to_string()];
    execute_brew_command_with_progress(&args, &window, "homebrew").await
}

/// 清理缓存（brew cleanup）
#[tauri::command]
pub async fn cleanup_homebrew(window: tauri::Window) -> Result<CommandOutput, String> {
    let args = vec!["cleanup".to_string(), "--prune=all".to_string()];
    execute_brew_command_with_progress(&args, &window, "cleanup").await
}

/// 批量更新所有过时的包
#[tauri::command]
pub async fn upgrade_all(window: tauri::Window) -> Result<CommandOutput, String> {
    let args = vec!["upgrade".to_string()];
    execute_brew_command_with_progress(&args, &window, "all").await
}

/// 获取 Homebrew 信息（版本、缓存大小等）
#[tauri::command]
pub async fn get_homebrew_info() -> Result<HomebrewInfo, String> {
    let brew_path = get_brew_path();
    
    // 获取版本
    let version_output = Command::new(&brew_path)
        .arg("--version")
        .output()
        .map_err(|e| format!("Failed to get version: {}", e))?;
    
    let version = String::from_utf8_lossy(&version_output.stdout)
        .lines()
        .next()
        .unwrap_or("Unknown")
        .to_string();
    
    // 获取缓存大小
    let cache_output = Command::new(&brew_path)
        .args(["--cache"])
        .output()
        .map_err(|e| format!("Failed to get cache path: {}", e))?;
    
    let cache_path = String::from_utf8_lossy(&cache_output.stdout).trim().to_string();
    
    let cache_size = if !cache_path.is_empty() {
        get_directory_size(&cache_path).unwrap_or(0)
    } else {
        0
    };
    
    Ok(HomebrewInfo {
        version,
        cache_path,
        cache_size,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct HomebrewInfo {
    pub version: String,
    pub cache_path: String,
    pub cache_size: u64,
}

/// 获取目录大小（字节）
fn get_directory_size(path: &str) -> Result<u64, String> {
    let output = Command::new("du")
        .args(["-sk", path])
        .output()
        .map_err(|e| format!("Failed to get directory size: {}", e))?;
    
    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        let size_kb: u64 = stdout
            .split_whitespace()
            .next()
            .and_then(|s| s.parse().ok())
            .unwrap_or(0);
        Ok(size_kb * 1024) // 转换为字节
    } else {
        Ok(0)
    }
}


/// 锁定包版本（brew pin）
#[tauri::command]
pub async fn pin_package(name: String) -> Result<CommandOutput, String> {
    execute_brew_command(&["pin", &name])
}

/// 解锁包版本（brew unpin）
#[tauri::command]
pub async fn unpin_package(name: String) -> Result<CommandOutput, String> {
    execute_brew_command(&["unpin", &name])
}

/// 获取已锁定的包列表
#[tauri::command]
pub async fn get_pinned() -> Result<Vec<String>, String> {
    let output = execute_brew_command(&["list", "--pinned"])?;
    
    if !output.success {
        return Ok(vec![]);
    }
    
    let pinned: Vec<String> = output.stdout
        .lines()
        .filter(|line| !line.trim().is_empty())
        .map(|line| line.trim().to_string())
        .collect();
    
    Ok(pinned)
}

/// 获取包的依赖关系
#[tauri::command]
pub async fn get_dependencies(name: String, is_cask: bool) -> Result<DependencyInfo, String> {
    let mut deps = Vec::new();
    let mut reverse_deps = Vec::new();
    
    if !is_cask {
        // 获取依赖
        let deps_output = execute_brew_command(&["deps", "--installed", &name])?;
        if deps_output.success {
            deps = deps_output.stdout
                .lines()
                .filter(|line| !line.trim().is_empty())
                .map(|line| line.trim().to_string())
                .collect();
        }
        
        // 获取反向依赖（谁依赖这个包）
        let uses_output = execute_brew_command(&["uses", "--installed", &name])?;
        if uses_output.success {
            reverse_deps = uses_output.stdout
                .lines()
                .filter(|line| !line.trim().is_empty())
                .map(|line| line.trim().to_string())
                .collect();
        }
    }
    
    Ok(DependencyInfo {
        name,
        dependencies: deps,
        reverse_dependencies: reverse_deps,
    })
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DependencyInfo {
    pub name: String,
    pub dependencies: Vec<String>,
    pub reverse_dependencies: Vec<String>,
}
