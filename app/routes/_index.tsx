import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import type { MetaFunction } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { db } from "../root";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export default function Index() {
  const [name, setName] = useState(""); // 名前入力フィールドの状態
  const [qrCode, setQrCode] = useState(""); // 生成されたQRコードのURL

  const generateTicket = async () => {
    if (!name.trim()) { // 空白のみの名前入力を防ぐ
      alert("名前を入力してください。");
      return;
    }
    const newUuid = crypto.randomUUID(); // UUIDの生成

    try {
      // Firestoreにデータを保存
      await setDoc(doc(db, "tickets", newUuid), {
        name: name,
        id: newUuid,
        status: "未",
      });

      // QRコードの生成
      setQrCode(window.location.origin + "/ticket/" + newUuid);
      setName(""); // 入力フィールドをクリア
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("チケットの発行に失敗しました。"); // エラーメッセージを表示
    }
  };

  return (
    <html lang="ja">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <h1>電子チケット発行</h1>
        <input
          type="text"
          placeholder="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button onClick={generateTicket}>チケット発行</button>

        {/* QRコードの表示 */}
        {qrCode && (
          <div>
            <h2>QRコード</h2>
            <QRCodeCanvas value={qrCode} size={256} level="H" /> {/* QRコードのサイズとエラー訂正レベルを指定 */}
            <p>このQRコードを保存またはスクリーンショットしてください。</p>
          </div>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
