import React from 'react';
import { QRCodeDisplay } from '../ui/QRCodeDisplay';

interface TicketData {
  uuid: string;
  name: string;
  bandName: string;
  createdBy: string;
  status: "未" | "済";
  createdAt: Date | string | { seconds: number; nanoseconds: number };
}

interface EventData {
  id: string;
  title: string;
  dates?: string[];
  location?: string;
  price?: number;
  oneDrink?: boolean;
  openTime?: string;
}

interface TicketDisplayProps {
  ticket: TicketData;
  event: EventData;
  eventTitle: string;
  eventCollectionName: string;
  eventUuid: string;
  showInstructions?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const TicketDisplay: React.FC<TicketDisplayProps> = ({
  ticket,
  event,
  eventTitle,
  eventCollectionName,
  eventUuid,
  showInstructions = true,
  className = '',
  style = {},
}) => {
  const formatTime = (dates?: string[], fallbackTime?: string): string => {
    if (dates && dates.length > 0) {
      try {
        const firstDate = dates[0];
        if (firstDate.includes('T')) {
          const timePart = firstDate.split('T')[1];
          return timePart || '18:00';
        } else {
          const dateObj = new Date(firstDate);
          const hours = dateObj.getHours().toString().padStart(2, '0');
          const minutes = dateObj.getMinutes().toString().padStart(2, '0');
          return `${hours}:${minutes}`;
        }
      } catch {
        return '18:00';
      }
    }
    return fallbackTime || '18:00';
  };

  const formatDate = (dates?: string[]): string => {
    if (dates && dates.length > 0) {
      return dates.map(date => {
        try {
          const dateObj = new Date(date);
          return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        } catch {
          return date;
        }
      }).join(', ');
    }
    return '';
  };

  const getOneDrinkText = (): string => {
    const isOneDrink = event?.oneDrink !== undefined ? event.oneDrink : true;
    return isOneDrink ? ' + 1dr' : '';
  };

  return (
    <div className={className} style={style}>
      {/* メインチケット */}
      <div style={{
        backgroundColor: 'white',
        color: 'black',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '16px',
        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        border: '2px solid black'
      }}>
        <div style={{ fontSize: '14px', marginBottom: '8px' }}>
          {ticket.name}さん用入場チケット
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '600',
          textAlign: 'center',
          margin: '16px 0',
          fontFamily: 'Irish Grover, cursive'
        }}>
          {event?.title || eventTitle}
        </div>
        <div style={{ fontSize: '14px', textAlign: 'right', marginBottom: '16px' }}>
          {event?.location ? `in ${event.location}` : 'in Suzuka Sound Stage'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {event?.dates && event.dates.length > 0 && (
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Date: {formatDate(event.dates)}
              </div>
            )}
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              Open: {formatTime(event?.dates, event?.openTime)}
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
              バンド: {ticket.bandName}
            </div>
            {event?.price !== undefined && (
              <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Price: ¥{event.price.toLocaleString()}{getOneDrinkText()}
              </div>
            )}
          </div>
          <QRCodeDisplay
            value={`${window.location.origin}/ticket/${eventCollectionName}/${eventUuid}/${ticket.uuid}`}
            size={75}
            level="H"
          />
        </div>
      </div>

      {/* 注意事項 */}
      {showInstructions && (
        <div style={{
          backgroundColor: 'white',
          color: 'black',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          border: '2px solid black'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '12px', fontSize: '14px' }}>
            *注意事項*
          </div>
          <div style={{ fontSize: '14px', marginBottom: '8px' }}>
            ・当日はドリンク代として500円を持ってきてください。
          </div>
          <div style={{ fontSize: '14px', marginBottom: '16px' }}>
            ・ライブハウスには駐車場がないので電車、バスの利用をお願いします。
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '14px', marginBottom: '8px' }}>
              会場の場所はこちら↓
            </div>
            <div style={{ fontSize: '14px' }}>
              {event?.location || '〒510-0256 三重県鈴鹿市磯山1-9-8'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
