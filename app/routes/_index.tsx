import { useState, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";
import { auth } from "../root";
import { signOut, onAuthStateChanged } from "firebase/auth";
import firebase from "firebase/compat/app";
import { 
  Button, 
  Input, 
  Card, 
  CardHeader, 
  CardContent, 
  Header, 
  PageContainer, 
  ContentWrapper,
  FormGroup 
} from "../components";
import {
  indexPage,
  responsiveGrid,
  heroSection,
  heroTitle,
  heroText,
  sectionCard,
  sectionTitle,
  featureDescription,
  usageGuide,
  usageGuideHeader,
  usageGuideTitle,
  stepBadge,
  usageGuideContent,
  usageStepsGrid,
  usageStepBlue,
  usageStepPink,
  usageStepGreen,
  usageStepOrange,
  stepContainer,
  stepNumberBlue,
  stepNumberPink,
  stepNumberGreen,
  stepNumberOrange,
  stepTitleBlue,
  stepTitlePink,
  stepTitleGreen,
  stepTitleOrange,
  stepDescription
} from "../styles/pages/index.css";

export const meta: MetaFunction = () => {
  return [
    { charSet: "utf-8"},
    { title: "チケット管理システム" },
    { name: "description", content: "イベントチケット管理システム" },
  ];
};

export default function Index() {
  const [eventTitle, setEventTitle] = useState(""); // イベントタイトル入力フィールドの状態
  const [user, setUser] = useState<firebase.User | null>(null);
  const navigate = useNavigate();

  const navigateToAdmin = () => {
    if (!eventTitle.trim()) {
      alert("イベントタイトルを入力してください。");
      return;
    }
    // イベントタイトルをURLパラメータとして渡してadminページに遷移
    navigate(`/admin?title=${encodeURIComponent(eventTitle)}`);
  };

  const navigateToOwner = () => {
    navigate("/owner");
  };

  const navigateToQRReader = () => {
    navigate("/qr-reader");
  };

  // ユーザー認証状態の監視
  useEffect(() => { 
    const unsubscribe = onAuthStateChanged(auth, (user) => setUser(user as firebase.User | null));
    return () => unsubscribe();
  }, []);

  // ログアウト処理
  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
          <PageContainer className={indexPage}>


      {/* ヘッダー */}
      <Header
        title="🎫 チケット管理システム"
        user={user}
        onSignOut={signOutUser}
      />

      <ContentWrapper>
        
        <div className={heroSection}>
          <h2 className={heroTitle}>✨ 新形式チケットシステム</h2>
          <p className={heroText}>
            イベント作成からチケット発行まで、すべて統合管理
          </p>
        </div>
        
        {/* メイン機能グリッド */}
        <div className={responsiveGrid}>
          {/* イベント管理者向けセクション */}
          <Card hover className={sectionCard}>
            <CardHeader>
              <h2 className={sectionTitle}>👑 イベント管理者</h2>
            </CardHeader>
            <CardContent>
              <div>
                <p className={featureDescription}>
                  イベントの作成・編集・全体管理を行います。複数のイベントを統合管理できます。
                </p>
              </div>
              <div>
                <Button onClick={navigateToOwner} size="lg">
                  📋 イベント管理画面
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* チケット発行担当者向けセクション */}
          <Card hover className={sectionCard}>
            <CardHeader type="secondary">
              <h2 className={sectionTitle}>🎫 チケット発行担当</h2>
            </CardHeader>
            <CardContent>
              <div>
                <p className={featureDescription}>
                  特定のイベントでチケットを発行・管理します。来場者情報とQRコードを生成できます。
                </p>
                <FormGroup>
                  <Input
                    placeholder="担当するイベント名を入力してください"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    inputMode="text"
                    autoComplete="off"
                  />
                </FormGroup>
              </div>
              <div>
                <Button 
                  type="secondary"
                  onClick={navigateToAdmin}
                  size="lg"
                >
                  🎫 チケット発行画面
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* QRコード読み取りセクション */}
          <Card hover className={sectionCard}>
            <CardHeader type="success">
              <h2 className={sectionTitle}>📱 QRコード読み取り</h2>
            </CardHeader>
            <CardContent>
              <div>
                <p className={featureDescription}>
                  チケットのQRコードをスキャンして入場確認を行います。リアルタイムで入場状況を更新します。
                </p>
              </div>
              <div>
                <Button 
                  onClick={navigateToQRReader}
                  type="success"
                  size="lg"
                >
                  📸 QRコードを読み取る
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 使い方ガイド */}
        <div className={usageGuide}>
          <div className={usageGuideHeader}>
            <h3 className={usageGuideTitle}>
              📋 システムの使い方
              <span className={stepBadge}>
                4ステップ
              </span>
            </h3>
          </div>
          <div className={usageGuideContent}>
            <div className={usageStepsGrid}>
              <div className={usageStepBlue}>
                <div className={stepContainer}>
                  <div className={stepNumberBlue}>1</div>
                  <div>
                    <strong className={stepTitleBlue}>イベント管理者</strong>
                    <p className={stepDescription}>
                      新しいイベントを作成し、基本情報（日程、場所、料金など）を設定します。複数のイベントを統合管理できます。
                    </p>
                  </div>
                </div>
              </div>
              <div className={usageStepPink}>
                <div className={stepContainer}>
                  <div className={stepNumberPink}>2</div>
                  <div>
                    <strong className={stepTitlePink}>チケット発行担当</strong>
                    <p className={stepDescription}>
                      来場者にチケットを発行し、QRコード付きのデジタルチケットを生成します。リアルタイムで発行状況を管理できます。
                    </p>
                  </div>
                </div>
              </div>
              <div className={usageStepGreen}>
                <div className={stepContainer}>
                  <div className={stepNumberGreen}>3</div>
                  <div>
                    <strong className={stepTitleGreen}>QRコード読み取り</strong>
                    <p className={stepDescription}>
                      来場者のチケットをスキャンして入場確認を行い、リアルタイムで状況を更新します。高速で正確な読み取りが可能です。
                    </p>
                  </div>
                </div>
              </div>
              <div className={usageStepOrange}>
                <div className={stepContainer}>
                  <div className={stepNumberOrange}>4</div>
                  <div>
                    <strong className={stepTitleOrange}>入場完了</strong>
                    <p className={stepDescription}>
                      QRコードスキャンにより入場処理が完了し、チケットステータスが自動更新されます。入場履歴も記録されます。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentWrapper>
    </PageContainer>
  );
}
