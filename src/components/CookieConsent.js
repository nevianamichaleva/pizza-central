'use client';

import { useEffect, useState } from 'react';
import { Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    // Проверяваме дали потребителят вече е дал съгласие
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    } else if (consent === 'granted') {
      setConsentGiven(true);
      // Изпращаме събитие към GTM dataLayer
      if (typeof window !== 'undefined' && window.dataLayer) {
        window.dataLayer.push({
          event: 'consent_update',
          consent_type: 'analytics_storage',
          consent_status: 'granted'
        });
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'granted');
    setShowBanner(false);
    setConsentGiven(true);
    
    // Обновяваме Consent Mode v2
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted'
      });
    }
    
    // Изпращаме събитие към GTM dataLayer
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        consent_type: 'analytics_storage',
        consent_status: 'granted'
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'denied');
    setShowBanner(false);
    
    // Обновяваме Consent Mode v2
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied'
      });
    }
    
    // Изпращаме събитие към GTM dataLayer
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'consent_update',
        consent_type: 'analytics_storage',
        consent_status: 'denied'
      });
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 9999,
        borderTop: '1px solid #e0e0e0'
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
        <div style={{ flex: '1', minWidth: '300px' }}>
          <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.5' }}>
            Използваме бисквитки и аналитични инструменти, за да подобрим вашето изживяване. 
            С приемане на бисквитките, вие се съгласявате с използването им за аналитични цели.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleAccept}
            style={{ backgroundColor: '#c9a961', borderColor: '#c9a961' }}
          >
            Приемам
          </Button>
          <Button
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
          >
            Отказвам
          </Button>
        </div>
      </div>
    </div>
  );
}

