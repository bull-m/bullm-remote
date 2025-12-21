use tokio::net::UdpSocket;
use tokio::prelude::*;

#[tokio::main]
async fn main() {
    let socket = UdpSocket::bind("127.0.0.1:8080").await.unwrap();
    println!("UDP 服务器在 127.0.0.1:8080 启动");

    let mut buf = [0; 1024];
    loop {
        let (size, addr) = socket.recv_from(&mut buf).await.unwrap();
        println!("收到来自 {:?} 的消息: {}", addr, String::from_utf8_lossy(&buf[..size]));

        // 回送数据
        socket.send_to(&buf[..size], &addr).await.unwrap();
    }
}