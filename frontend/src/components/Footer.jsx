export default function Footer() {
  return (
    <footer style={{
      background: '#1a1a2e', color: '#888', textAlign: 'center',
      fontSize: 12, padding: '16px 24px', marginTop: 'auto',
      fontFamily: "'DM Sans',sans-serif",
    }}>
      &copy; {new Date().getFullYear()} SmartShine Car Wash Platform. All rights reserved.
    </footer>
  )
}
