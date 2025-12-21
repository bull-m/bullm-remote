use lazy_static::lazy_static;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::{Emitter, Manager, Runtime};
use tokio::task::JoinHandle;
use tokio::{
    net::UdpSocket,
    sync::RwLock,
    time::{self, sleep},
};

pub(crate) struct Udp {
    pub task: JoinHandle<()>,
    pub sock: Arc<UdpSocket>,
}

#[derive(Serialize, Deserialize, Clone)]
pub(crate) struct Payload {
    pub id: String,
    pub addr: String,
    pub data: Vec<u8>,
}

// 创建 error 类型，表示程序中可能出现的所有错误
#[derive(Debug, thiserror::Error)]
enum Error {
    #[error(transparent)]
    Io(#[from] std::io::Error),
}

// 我们必须手动实现 serde::Serialize
impl serde::Serialize for Error {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

lazy_static! {
    static ref SOCKETS: RwLock<HashMap<String, Udp>> = RwLock::new(HashMap::new());
}

#[tauri::command]
pub async fn bind<R: Runtime>(
    window: tauri::Window<R>,
    bind_at: String,
    broadcast: bool,
) -> Result<(), String> {
    let mut sockets = SOCKETS.write().await;

    let id = bind_at.clone();

    if let Some(s) = sockets.get(&id) {
        s.task.abort();
        sockets.remove(&id);
        sleep(time::Duration::from_millis(100)).await;
    }

    let sock = UdpSocket::bind(&bind_at).await.map_err(|e| e.to_string())?;
    sock.set_broadcast(broadcast).map_err(|e| e.to_string())?;
    let arc = Arc::new(sock);
    let sock = arc.clone();
    // debug_println!("{} udp bond at {}", &id, &bind_at);
    let udp_id = id.clone();
    let task = tokio::task::spawn(async move {
        let mut buf = [0; 65535];
        loop {
            if let Ok((len, addr)) = sock.recv_from(&mut buf).await {
                if len == 1 && buf[0] == 0 {
                    break;
                }
                let _ = window.app_handle().emit_to(
                    window.label(),
                    "plugin://udp",
                    Payload {
                        id: id.clone(),
                        addr: addr.to_string(),
                        data: buf[..len].to_vec(),
                    },
                );
            }
        }
        ()
    });

    sockets.insert(udp_id, Udp { task, sock: arc });
    Ok(())
}

#[tauri::command]
pub async fn unbind(id: String) -> Result<(), String> {
    let mut sockets = SOCKETS.write().await;

    if let Some(s) = sockets.get(&id) {
        s.task.abort();
        sockets.remove(&id);
        Ok(())
    } else {
        Err(format!("ID {} not bond.", &id))
    }
}

#[tauri::command]
pub async fn send(id: String, target: String, message: Vec<u8>) -> Result<(), String> {
    // 检查消息是否为空
    if message.is_empty() {
        return Err("Message is empty".to_string());
    }

    let sockets = SOCKETS.read().await;
    if let Some(s) = sockets.get(&id) {
        s.sock
            .send_to(&message, &target)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err(format!("ID {} not bond.", &id))
    }
}
#[tauri::command]
pub async fn send_str(id: String, target: String, message: String) -> Result<(), String> {
    let sockets = SOCKETS.read().await;
    if let Some(s) = sockets.get(&id) {
        s.sock
            .send_to((&message).as_ref(), &target)
            .await
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err(format!("ID {} not bond.", &id))
    }
}
