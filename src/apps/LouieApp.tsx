import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'

const REACTIONS = [
  'Louie leans into your hand.',
  'A sleepy tail thump.',
  'He sighs, perfectly content.',
  'Soft ears. Softer heart.',
  'Best boy energy: maximum.',
]

export function LouieApp() {
  const [pets, setPets] = useState(0)
  const [bounce, setBounce] = useState(0)
  const reduced = useReducedMotion()
  const reaction = REACTIONS[pets % REACTIONS.length]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <motion.button
        type="button"
        aria-label="Pet Louie"
        className="relative flex size-28 flex-col items-center justify-center rounded-full bg-cream-soft text-plum shadow-inner outline-none ring-plum/20 transition hover:ring-4 focus-visible:ring-4"
        onClick={() => {
          setPets((n) => n + 1)
          setBounce((n) => n + 1)
        }}
        animate={
          reduced
            ? undefined
            : {
                scale: bounce % 2 === 0 ? 1 : 1.06,
                rotate: bounce % 2 === 0 ? 0 : -3,
              }
        }
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        whileTap={reduced ? undefined : { scale: 0.94 }}
      >
        <span className="font-display text-[11px] leading-none">Louie</span>
        <span className="mt-2 text-[10px] text-mauve">pet me</span>
      </motion.button>

      <div>
        <p className="mt-1 text-sm text-plum-ink">{reaction}</p>
        <p className="mt-1 text-xs text-mauve">
          {pets === 0 ? 'Click to give him a pet.' : `Pets today: ${pets}`}
        </p>
      </div>
    </div>
  )
}
