"use client";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  visible: boolean;
};

export default function SceneTransitionOverlay({
  visible,
}: Props) {
  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          animate={{
            opacity: 1,
            backdropFilter: "blur(20px)",
          }}
          exit={{
            opacity: 0,
            backdropFilter: "blur(0px)",
          }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="fixed inset-0 z-[9999] bg-[rgba(8,8,8,.72)] pointer-events-none"
        />
      )}
    </AnimatePresence>
  );
}