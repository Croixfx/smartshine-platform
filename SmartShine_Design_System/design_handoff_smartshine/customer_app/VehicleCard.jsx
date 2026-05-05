// SmartShine — VehicleCard Component
function VehicleCard({ vehicle }) {
  return React.createElement('div', {
    style: {
      background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,.04)',
      padding: '18px',
    }
  },
    React.createElement('div', {
      style: { fontSize: '16px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '.04em', fontFamily: "'DM Sans', sans-serif" }
    }, vehicle.plate_number),
    React.createElement('div', {
      style: { fontSize: '13px', color: '#555', marginTop: '5px', fontFamily: "'DM Sans', sans-serif" }
    }, `${vehicle.make} ${vehicle.model} · ${vehicle.vehicle_type}`),
    vehicle.color && React.createElement('div', {
      style: { fontSize: '11px', color: '#aaa', marginTop: '3px', fontFamily: "'DM Sans', sans-serif" }
    }, vehicle.color)
  );
}
Object.assign(window, { VehicleCard });
