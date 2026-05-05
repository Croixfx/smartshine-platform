// SmartShine — Footer Component
function Footer() {
  return React.createElement('footer', {
    style: {
      background: '#1a1a2e', color: '#888', textAlign: 'center',
      fontSize: '12px', padding: '16px 24px', marginTop: 'auto',
    }
  }, `© ${new Date().getFullYear()} SmartShine Car Wash Platform. All rights reserved.`);
}
Object.assign(window, { Footer });
