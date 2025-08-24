import React from 'react';
import { useNavigate } from '@remix-run/react';
import firebase from 'firebase/compat/app';
import { header, headerTypes, nav, title, backButton, userActions, userInfo, headerButton } from '~/styles/layout/header.css';

interface HeaderProps {
  title: string;
  user?: firebase.User | null;
  onSignOut?: () => void;
  showBackButton?: boolean;
  backUrl?: string;
  type?: 'primary' | 'secondary' | 'success';
  className?: string;
  style?: React.CSSProperties;
}

export const Header: React.FC<HeaderProps> = ({
  title: headerTitle,
  user,
  onSignOut,
  showBackButton = false,
  backUrl = '/',
  type = 'primary',
  className = '',
  style = {},
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(backUrl);
  };

  return (
    <div className={`${header} ${headerTypes[type]} ${className}`} style={style}>
      <div className={nav}>
        {showBackButton ? (
          <button
            className={backButton}
            onClick={handleBackClick}
          >
            ← 戻る
          </button>
        ) : (
          <div></div>
        )}
        <h1 className={title}>
          {headerTitle}
        </h1>
        <div className={userActions}>
          {user && (
            <>
              <div className={userInfo}>
                {user.displayName}さん
              </div>
              <button
                className={headerButton}
                onClick={onSignOut}
              >
                ログアウト
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
