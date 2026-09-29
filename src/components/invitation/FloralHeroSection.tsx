import { EventData, GuestData } from '@/types/invitation'
import { parseEventDate } from '@/lib/date-utils'

export default function FloralHeroSection({ event, guest }: { event: EventData; guest: GuestData }) {
  const { full: date, time } = parseEventDate(event.eventDate)
  const photo = event.galleryImages[0] || event.backgroundImageUrl
  return (
    <section className="floral-hero" style={{
      minHeight:'100svh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'min(14vh,120px) 20px 70px', textAlign:'center', position:'relative',
      background:"url('/images/floral-invitation-v2.webp') center/cover no-repeat",
      color:'#684d51',
    }}>
      <div style={{ width:'min(100%,560px)', position:'relative', zIndex:1 }}>
        <p style={{ fontSize:11, letterSpacing:'.25em', textTransform:'uppercase' }}>Invitation au mariage</p>
        <h1 style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:'clamp(46px,11vw,80px)', fontWeight:400, lineHeight:1.08, margin:'26px 0 12px' }}>
          {event.groomName} <span style={{ color:'#af8384', fontSize:'.7em' }}>&amp;</span> {event.brideName}
        </h1>
        <p style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:'clamp(17px,3vw,23px)', lineHeight:1.6 }}>
          {event.heroMessage || 'ont le bonheur de vous inviter à célébrer leur union'}
        </p>
        {photo && <div style={{
          width:'min(60vw,270px)', height:'min(32vh,300px)', margin:'28px auto',
          backgroundImage:`url("${photo.replaceAll('"', '%22')}")`, backgroundPosition:'center',
          backgroundSize:'cover', border:'6px solid #fff5ef', borderRadius:'48% 48% 4px 4px',
          boxShadow:'0 12px 35px #8b606044',
        }} role="img" aria-label="Photo du couple" />}
        <p style={{ fontFamily:'Georgia,serif', fontSize:'clamp(18px,3vw,25px)', margin:'14px auto 0' }}>{date} · {time}</p>
        <p style={{ fontSize:14, marginTop:9 }}>{event.venueName}</p>
        <div style={{ width:80, borderTop:'1px solid #bd8d8b', margin:'26px auto' }} />
        <p style={{ fontFamily:'Georgia,serif', fontStyle:'italic', fontSize:18 }}>Pour {guest.fullName}</p>
        <p style={{ fontSize:11, letterSpacing:'.18em', marginTop:30 }}>DÉCOUVRIR L’INVITATION ↓</p>
      </div>
    </section>
  )
}
