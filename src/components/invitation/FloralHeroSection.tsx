import { EventData, GuestData } from '@/types/invitation'
import { parseEventDate } from '@/lib/date-utils'

export default function FloralHeroSection({ event, guest }: { event: EventData; guest: GuestData }) {
  const { full: date, time } = parseEventDate(event.eventDate)
  return (
    <section style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '72px 20px',
      background: 'linear-gradient(155deg,#fff8f5ed,#f1dcd9ed)',
      color: '#604548', textAlign: 'center', position: 'relative',
    }}>
      <div style={{ maxWidth: 680, width: '100%', border: '1px solid #d6aaa6', padding: 'clamp(35px,8vw,85px) 24px', background: '#fffaf4e8', boxShadow: '0 18px 60px #77565130' }}>
        <span style={{ fontSize: 55, color: '#d6a5a4', lineHeight: 1 }} aria-hidden="true">❀</span>
        <p style={{ letterSpacing: '.24em', textTransform: 'uppercase', fontSize: 11, marginTop: 20 }}>Invitation au mariage</p>
        <h1 style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 'clamp(45px,9vw,78px)', fontWeight: 400, lineHeight: 1.1, margin: '32px 0' }}>
          {event.groomName}<br /><span style={{ color: '#be9290', fontSize: '.6em' }}>&amp;</span><br />{event.brideName}
        </h1>
        {event.heroMessage && <p style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: 19, whiteSpace: 'pre-line', lineHeight: 1.6 }}>{event.heroMessage}</p>}
        <div style={{ width: 90, borderTop: '1px solid #cfa09d', margin: '35px auto' }} />
        <p style={{ fontFamily: 'Georgia,serif', fontSize: 17, lineHeight: 1.7 }}>
          {date} à {time}<br />{event.venueName}
        </p>
        <p style={{ fontSize: 13, marginTop: 40, letterSpacing: '.08em' }}>Une invitation personnelle pour {guest.fullName}</p>
        <span style={{ display: 'block', marginTop: 38, fontSize: 12, letterSpacing: '.15em' }}>DÉCOUVRIR LA SUITE ↓</span>
      </div>
    </section>
  )
}
