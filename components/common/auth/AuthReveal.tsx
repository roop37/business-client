"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Children, ReactNode } from "react";

/**
 * Staggered entrance for auth form columns — fades/blurs/slides each direct
 * child in, adapting the sign-in reference's `animate-element` signature into
 * the Owner system. Keeps the caller's wrapper classes so layout is unchanged.
 */
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const AuthReveal = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => {
  const reduce = useReducedMotion();

  // ponytail: reduced-motion → render untouched, no wrappers, no animation.
  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {Children.map(children, (child) => (
        <motion.div variants={item}>{child}</motion.div>
      ))}
    </motion.div>
  );
};

export default AuthReveal;
