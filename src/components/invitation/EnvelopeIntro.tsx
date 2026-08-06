'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'

interface Props {
  groomName:            string
  brideName:            string
  guestName:            string
  themeColor:           string
  themeColorSecondary?: string
  eventDate:            string
  venueName:            string
  onComplete:           () => void
}

const EASE_OPEN = [0.76, 0, 0.24, 1] as const

export default function EnvelopeIntro({ groomName, brideName, themeColor, themeColorSecondary, onComplete }: Props) {
  const [phase, setPhase] = useState<'idle' | 'open'>('idle')
  const open = phase === 'open'

  useEffect(() => {
    // Phase 1 — l'enveloppe apparaît, un temps de pause
    const t1 = setTimeout(() => setPhase('open'), 1000)
    // Phase 2 — les rabats sont sortis de l'écran, l'invitation apparaît directement
    const t2 = setTimeout(() => onComplete(), 2300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onComplete])

  const gold      = themeColor || '#C9A96E'
  const goldLight = themeColorSecondary || gold
  const monogram  = `${groomName?.[0] ?? ''}${brideName?.[0] ?? ''}`.toUpperCase()

  const flapBase = {
    position:   'absolute' as const,
    inset:      0,
    background: `linear-gradient(145deg, ${goldLight}, ${gold})`,
  }

  const texture = (
    <div style={{
      position:       'absolute',
      inset:          0,
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.35) 1px, transparent 1px)',
      backgroundSize: '22px 22px',
      opacity:        0.25,
      mixBlendMode:   'overlay',
    }} />
  )

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'absolute', inset: 0 }}
      >
        {/* Rabat haut */}
        <motion.div
          animate={{ y: open ? '-100%' : '0%' }}
          transition={{ duration: 1.1, ease: EASE_OPEN }}
          style={{ ...flapBase, clipPath: 'polygon(50% 50%, 0% 0%, 100% 0%)', boxShadow: `inset 0 -1px 0 ${goldLight}80` }}
        >
          {texture}
        </motion.div>

        {/* Rabat bas */}
        <motion.div
          animate={{ y: open ? '100%' : '0%' }}
          transition={{ duration: 1.1, ease: EASE_OPEN }}
          style={{ ...flapBase, clipPath: 'polygon(50% 50%, 0% 100%, 100% 100%)', boxShadow: `inset 0 1px 0 ${goldLight}80` }}
        >
          {texture}
        </motion.div>

        {/* Rabat gauche */}
        <motion.div
          animate={{ x: open ? '-100%' : '0%' }}
          transition={{ duration: 1.1, ease: EASE_OPEN }}
          style={{ ...flapBase, clipPath: 'polygon(50% 50%, 0% 0%, 0% 100%)', boxShadow: `inset -1px 0 0 ${goldLight}80` }}
        >
          {texture}
        </motion.div>

        {/* Rabat droit */}
        <motion.div
          animate={{ x: open ? '100%' : '0%' }}
          transition={{ duration: 1.1, ease: EASE_OPEN }}
          style={{ ...flapBase, clipPath: 'polygon(50% 50%, 100% 0%, 100% 100%)', boxShadow: `inset 1px 0 0 ${goldLight}80` }}
        >
          {texture}
        </motion.div>

        {/* Sceau central */}
        <motion.div
          animate={{ opacity: open ? 0 : 1, scale: open ? 0.4 : 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position:      'absolute',
            top:            '50%',
            left:           '50%',
            transform:      'translate(-50%, -50%)',
            width:          'clamp(56px, 12vw, 76px)',
            height:         'clamp(56px, 12vw, 76px)',
            borderRadius:   '50%',
            background:     `radial-gradient(circle at 35% 30%, ${goldLight}, ${gold})`,
            border:         `1px solid rgba(255,255,255,0.5)`,
            boxShadow:      '0 8px 24px rgba(0,0,0,0.35)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontFamily:     'var(--font-script)',
            fontSize:       'clamp(1.1rem, 2.5vw, 1.5rem)',
            color:          '#fff',
            zIndex:         5,
          }}
        >
          {monogram}
        </motion.div>
      </motion.div>
    </div>
  )
}
