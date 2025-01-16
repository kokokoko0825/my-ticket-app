import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import type { MetaFunction } from "@remix-run/node";
import * as styles from "./styles.css";
import {
  Links,
  LiveReload,
  Meta,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

import { db, auth } from "../root";

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
      if (!auth.currentUser) { 
        alert("ログインしてください。");
        return;
      }
      await setDoc(doc(db, "tickets", newUuid), {
        name: name,
        id: newUuid,
        status: "未",
        createdBy: auth.currentUser.uid,
      });

      // QRコードの生成
      setQrCode(window.location.origin + "/ticket/" + newUuid);
      //setName(""); // 入力フィールドをクリア
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
        <link href="https://fonts.googleapis.com/css2?family=Irish+Grover&display=swap" rel="stylesheet"></link>
      </head>
      <body>
        <div className={styles.window}>
          <div className={styles.windowTitle}>電子チケット発行</div>
          <div className={styles.inputContainer}>
            <input className={styles.input}
              type="text"
              placeholder="名前"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <button onClick={generateTicket}>チケット発行</button>
          </div>
          {/* QRコードの表示 */}
          {qrCode && (
            <div>
              <p>下記の画像を保存またはスクリーンショットしてください。</p>
              <div className={styles.ticket}>
                <div className={styles.text}>{ name }さん用入場チケット</div>
                <div className={styles.title}>BorderLess</div>
                <div className={styles.placeContainer}>
                  <div className={styles.text}>in Suzuka Sound Stage</div>
                </div>
                <div className={styles.otherContainer}>
                  <div className={styles.textContainer}>
                    <div className={styles.text}>Date: 3/8 ,3/9</div>
                    <div className={styles.text}>Open:</div>
                    <div className={styles.text}>/ Day1, 14:30 ~ /</div>
                    <div className={styles.text}>/ Day2, 15:30 ~ /</div>
                    <div className={styles.text}>Price: 1000円 + 1dr</div>
                  </div>
                  <QRCodeCanvas value={qrCode} size={75} level="H" />
                </div>
              </div>
              <div className={styles.ticket}>
                <div className={styles.backContainer}>
                  <div className={styles.text}>*注意事項*</div>
                  <div className={styles.text}>・当日はドリンク代として500円を持ってきてください。</div>
                  <div className={styles.text}>・ライブハウスには駐車場がないので電車、バスの利用をお願いします。</div>
                  <div className={styles.locationTextContainer}>
                    <div className={styles.text}>会場の場所はこちら↓</div>
                    <a className={styles.text} href="https://maps.app.goo.gl/ZfY37uVqmYHM926Y8">Suzuka Sound Stage</a>
                  </div>
                </div>
              </div>
            </div>
          )}
          <ScrollRestoration />
          <Scripts />
          <LiveReload />
        </div>
      </body>
    </html>
  );
}
