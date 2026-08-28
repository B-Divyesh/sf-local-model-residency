use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::time::Duration;
use sysinfo::System;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager,
};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ModelRecord {
    id: String,
    runtime: String,
    size_bytes: u64,
    vram_bytes: u64,
    expires_at: Option<String>,
    process_name: Option<String>,
    pid: Option<u32>,
    process_ram_bytes: Option<u64>,
    confidence: String,
    evidence: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeRecord {
    name: String,
    endpoint: String,
    state: String,
    detail: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ScanResult {
    scanned_at: String,
    models: Vec<ModelRecord>,
    runtimes: Vec<RuntimeRecord>,
}

#[derive(Debug, Deserialize)]
struct OllamaResponse {
    #[serde(default)]
    models: Vec<OllamaModel>,
}

#[derive(Debug, Deserialize)]
struct OllamaModel {
    name: String,
    #[serde(default)]
    size: u64,
    #[serde(default)]
    size_vram: u64,
    expires_at: Option<String>,
}

#[derive(Clone)]
struct ProcessMatch {
    name: String,
    pid: u32,
    memory: u64,
}

fn process_for(system: &System, terms: &[&str]) -> Option<ProcessMatch> {
    system
        .processes()
        .iter()
        .filter_map(|(pid, process)| {
            let name = process.name().to_string_lossy().to_string();
            let lowered = name.to_lowercase();
            terms
                .iter()
                .any(|term| lowered.contains(term))
                .then(|| ProcessMatch {
                    name,
                    pid: pid.as_u32(),
                    memory: process.memory(),
                })
        })
        .max_by_key(|process| process.memory)
}

fn ollama_models(body: &str, process: Option<&ProcessMatch>) -> Result<Vec<ModelRecord>, String> {
    let response: OllamaResponse = serde_json::from_str(body).map_err(|error| error.to_string())?;
    Ok(response
        .models
        .into_iter()
        .map(|model| ModelRecord {
            id: model.name,
            runtime: "Ollama".into(),
            size_bytes: model.size,
            vram_bytes: model.size_vram,
            expires_at: model.expires_at,
            process_name: process.map(|item| item.name.clone()),
            pid: process.map(|item| item.pid),
            process_ram_bytes: process.map(|item| item.memory),
            confidence: if process.is_some() {
                "confirmed"
            } else {
                "partial"
            }
            .into(),
            evidence: if process.is_some() {
                "Listed by Ollama /api/ps and matched to the Ollama process.".into()
            } else {
                "Listed by Ollama /api/ps. No matching OS process was visible.".into()
            },
        })
        .collect())
}

fn lm_studio_models(
    body: &str,
    process: Option<&ProcessMatch>,
) -> Result<Vec<ModelRecord>, String> {
    let value: Value = serde_json::from_str(body).map_err(|error| error.to_string())?;
    let entries = value
        .get("models")
        .and_then(Value::as_array)
        .cloned()
        .unwrap_or_default();
    Ok(entries.into_iter().filter_map(|entry| {
        let loaded_instances = entry.get("loaded_instances").and_then(Value::as_array);
        let state_loaded = entry.get("state").and_then(Value::as_str).is_some_and(|state| state.eq_ignore_ascii_case("loaded"));
        if !state_loaded && loaded_instances.is_none_or(|items| items.is_empty()) { return None; }
        let id = entry.get("id").or_else(|| entry.get("key")).and_then(Value::as_str)?.to_string();
        let size = entry.get("size_bytes").or_else(|| entry.get("size")).and_then(Value::as_u64).unwrap_or(0);
        Some(ModelRecord {
            id,
            runtime: "LM Studio".into(),
            size_bytes: size,
            vram_bytes: 0,
            expires_at: None,
            process_name: process.map(|item| item.name.clone()),
            pid: process.map(|item| item.pid),
            process_ram_bytes: process.map(|item| item.memory),
            confidence: "partial".into(),
            evidence: "Listed as loaded by LM Studio. LM Studio does not report per-model GPU memory here.".into(),
        })
    }).collect())
}

#[tauri::command]
async fn scan_local_runtimes() -> Result<ScanResult, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_millis(900))
        .no_proxy()
        .build()
        .map_err(|error| error.to_string())?;
    let mut system = System::new_all();
    system.refresh_all();
    let ollama_process = process_for(&system, &["ollama"]);
    let lm_process = process_for(&system, &["lm studio", "lm-studio", "lms"]);
    let mut models = Vec::new();
    let mut runtimes = Vec::new();

    match client.get("http://127.0.0.1:11434/api/ps").send().await {
        Ok(response) if response.status().is_success() => match response.text().await {
            Ok(body) => match ollama_models(&body, ollama_process.as_ref()) {
                Ok(found) => {
                    let count = found.len();
                    models.extend(found);
                    runtimes.push(RuntimeRecord {
                        name: "Ollama".into(),
                        endpoint: "127.0.0.1:11434".into(),
                        state: "connected".into(),
                        detail: format!("Status answered with {count} resident model(s)"),
                    });
                }
                Err(_) => runtimes.push(RuntimeRecord {
                    name: "Ollama".into(),
                    endpoint: "127.0.0.1:11434".into(),
                    state: "limited".into(),
                    detail: "Status answered in an unsupported format".into(),
                }),
            },
            Err(_) => runtimes.push(RuntimeRecord {
                name: "Ollama".into(),
                endpoint: "127.0.0.1:11434".into(),
                state: "limited".into(),
                detail: "Status response could not be read".into(),
            }),
        },
        _ => runtimes.push(RuntimeRecord {
            name: "Ollama".into(),
            endpoint: "127.0.0.1:11434".into(),
            state: "unavailable".into(),
            detail: "No local server answered".into(),
        }),
    }

    match client
        .get("http://127.0.0.1:1234/api/v1/models")
        .send()
        .await
    {
        Ok(response) if response.status().is_success() => match response.text().await {
            Ok(body) => match lm_studio_models(&body, lm_process.as_ref()) {
                Ok(found) => {
                    let count = found.len();
                    models.extend(found);
                    runtimes.push(RuntimeRecord {
                        name: "LM Studio".into(),
                        endpoint: "127.0.0.1:1234".into(),
                        state: "connected".into(),
                        detail: format!("Status answered with {count} resident model(s)"),
                    });
                }
                Err(_) => runtimes.push(RuntimeRecord {
                    name: "LM Studio".into(),
                    endpoint: "127.0.0.1:1234".into(),
                    state: "limited".into(),
                    detail: "Status answered in an unsupported format".into(),
                }),
            },
            Err(_) => runtimes.push(RuntimeRecord {
                name: "LM Studio".into(),
                endpoint: "127.0.0.1:1234".into(),
                state: "limited".into(),
                detail: "Status response could not be read".into(),
            }),
        },
        _ => runtimes.push(RuntimeRecord {
            name: "LM Studio".into(),
            endpoint: "127.0.0.1:1234".into(),
            state: "unavailable".into(),
            detail: "No local server answered".into(),
        }),
    }

    let jan = client.get("http://127.0.0.1:1337/v1/models").send().await;
    runtimes.push(match jan {
        Ok(response) if response.status().is_success() => RuntimeRecord {
            name: "Jan".into(),
            endpoint: "127.0.0.1:1337".into(),
            state: "limited".into(),
            detail: "Server answered, but its model list does not prove residency".into(),
        },
        _ => RuntimeRecord {
            name: "Jan".into(),
            endpoint: "127.0.0.1:1337".into(),
            state: "unavailable".into(),
            detail: "No local server answered".into(),
        },
    });

    Ok(ScanResult {
        scanned_at: Utc::now().to_rfc3339(),
        models,
        runtimes,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(icon) = app.default_window_icon().cloned() {
                let show = MenuItemBuilder::with_id("show", "Show residency").build(app)?;
                let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
                let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;
                TrayIconBuilder::new()
                    .icon(icon)
                    .tooltip("Local Model Residency")
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "quit" => app.exit(0),
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            if let Some(window) = tray.app_handle().get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    })
                    .build(app)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![scan_local_runtimes])
        .run(tauri::generate_context!())
        .expect("Local Model Residency could not start");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_ollama_residency_fields() {
        let body = r#"{"models":[{"name":"llama3.2:8b","size":5231411712,"size_vram":4821114880,"expires_at":"2026-08-28T09:47:18Z"}]}"#;
        let models = ollama_models(
            body,
            Some(&ProcessMatch {
                name: "ollama".into(),
                pid: 42,
                memory: 612_000_000,
            }),
        )
        .unwrap();
        assert_eq!(models.len(), 1);
        assert_eq!(models[0].runtime, "Ollama");
        assert_eq!(models[0].vram_bytes, 4_821_114_880);
        assert_eq!(models[0].process_ram_bytes, Some(612_000_000));
        assert_eq!(models[0].confidence, "confirmed");
    }

    #[test]
    fn lists_only_loaded_lm_studio_models() {
        let body = r#"{"models":[{"id":"loaded","loaded_instances":[{"id":"one"}]},{"id":"disk-only","loaded_instances":[]}]}"#;
        let models = lm_studio_models(body, None).unwrap();
        assert_eq!(models.len(), 1);
        assert_eq!(models[0].id, "loaded");
        assert_eq!(models[0].confidence, "partial");
    }
}
