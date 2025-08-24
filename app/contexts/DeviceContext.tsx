import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface DeviceContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  viewportWidth: number;
  viewportHeight: number;
}

const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

interface DeviceProviderProps {
  children: ReactNode;
}

export function DeviceProvider({ children }: DeviceProviderProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    viewportWidth: 0,
    viewportHeight: 0,
  });

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // モバイルデバイスの検出
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // 画面サイズに基づく判定
      const isMobileSize = width <= 768;
      const isTabletSize = width > 768 && width <= 1024;
      const isDesktopSize = width > 1024;
      
      // デバイスと画面サイズの両方を考慮
      const isMobile = isMobileDevice || isMobileSize;
      const isTablet = isTabletSize && !isMobile;
      const isDesktop = isDesktopSize && !isMobile && !isTablet;

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        viewportWidth: width,
        viewportHeight: height,
      });

      // モバイルデバイスでの強制修正
      if (isMobile || isMobileSize) {
        // ビューポートの強制修正
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          // ビューポートメタタグが存在しない場合は作成
          viewport = document.createElement('meta');
          viewport.setAttribute('name', 'viewport');
          document.head.appendChild(viewport);
        }
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
        
        // CSSの強制適用
        document.documentElement.style.width = '100vw';
        document.documentElement.style.maxWidth = '100vw';
        document.documentElement.style.overflowX = 'hidden';
        document.documentElement.style.minWidth = '100vw';
        document.body.style.width = '100vw';
        document.body.style.maxWidth = '100vw';
        document.body.style.overflowX = 'hidden';
        document.body.style.minWidth = '100vw';
        
        // ルート要素の修正
        const rootElement = document.getElementById('root');
        if (rootElement) {
          rootElement.style.width = '100vw';
          rootElement.style.maxWidth = '100vw';
          rootElement.style.overflowX = 'hidden';
          rootElement.style.minWidth = '100vw';
        }
        
        // 強制的にリサイズをトリガー
        window.dispatchEvent(new Event('resize'));
      }
    };

    // 初期設定
    updateDeviceInfo();

    // リサイズ時の更新
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  return (
    <DeviceContext.Provider value={deviceInfo}>
      {children}
    </DeviceContext.Provider>
  );
}

export function useDevice(): DeviceContextType {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
}
