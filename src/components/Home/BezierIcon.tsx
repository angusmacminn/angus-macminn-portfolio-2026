'use client'

import { motion, useReducedMotion } from 'motion/react'

const nodeTopPath =
  'M5.41519 0.585787C5.79026 0.96086 6.00097 1.46957 6.00097 2L6.00195 4C6.00321 4.53043 5.82104 5.01902 5.44686 5.39498C5.07268 5.77094 4.56448 5.98286 4.03405 5.98413L2.00097 6C1.47054 6 0.96183 5.78929 0.586757 5.41421C0.211684 5.03914 0.000971794 4.53043 0.000971794 4L0.000971794 2C0.000971794 1.46957 0.211684 0.96086 0.586757 0.585787C0.96183 0.210714 1.47054 0 2.00097 0L4.00097 0C4.5314 0 5.04011 0.210714 5.41519 0.585787Z'
const nodeBottomPath =
  'M11.5848 21.4142C11.2097 21.0391 10.999 20.5304 10.999 20L10.9981 18C10.9968 17.4696 11.179 16.981 11.5531 16.605C11.9273 16.2291 12.4355 16.0171 12.966 16.0159L14.999 16C15.5295 16 16.0382 16.2107 16.4132 16.5858C16.7883 16.9609 16.999 17.4696 16.999 18V20C16.999 20.5304 16.7883 21.0391 16.4132 21.4142C16.0382 21.7893 15.5295 22 14.999 22H12.999C12.4686 22 11.9599 21.7893 11.5848 21.4142Z'
const handleBottomPath =
  'M3.61133 17.5508C3.93028 17.4653 4.26915 17.4879 4.57422 17.6143C4.84041 17.7246 5.06899 17.9084 5.23242 18.1436V19.8555C5.06896 20.091 4.84066 20.2753 4.57422 20.3857C4.26915 20.5121 3.93028 20.5347 3.61133 20.4492C3.29251 20.3637 3.01051 20.175 2.80957 19.9131C2.60867 19.6512 2.5 19.3301 2.5 19C2.5 18.6699 2.60867 18.3488 2.80957 18.0869C3.01051 17.825 3.29251 17.6363 3.61133 17.5508ZM11.5 18.5V19.5H6.23242V18.5H11.5Z'
const handleTopPath =
  'M13.3887 4.42188C13.0697 4.50734 12.7308 4.48476 12.4258 4.3584C12.1596 4.2481 11.931 4.06428 11.7676 3.8291V2.11719C11.931 1.88169 12.1593 1.69732 12.4258 1.58691C12.7308 1.46055 13.0697 1.43798 13.3887 1.52344C13.7075 1.60894 13.9895 1.79769 14.1904 2.05957C14.3913 2.32149 14.5 2.64255 14.5 2.97266C14.5 3.30276 14.3913 3.62382 14.1904 3.88574C13.9895 4.14762 13.7075 4.33637 13.3887 4.42188ZM5.5 3.47266V2.47266L10.7676 2.47266V3.47266L5.5 3.47266Z'
const curvePath =
  'M6.14927 6.5428C5.63931 5.58053 4.86133 4.75784 4 4.14667L6.66667 3C7.51534 3.8681 8.3842 4.90518 8.86531 6.05013C9.34642 7.19508 9.5935 8.42474 9.592 9.66667V12.3333C9.59165 13.4224 9.85811 14.4949 10.3681 15.4572C10.878 16.4195 11.0986 16.3888 12 17L10.3681 19C9.47993 18.1319 8.13313 17.0948 7.65203 15.9499C7.17092 14.8049 6.92383 13.5753 6.92533 12.3333V9.66667C6.92568 8.57762 6.65923 7.50507 6.14927 6.5428Z'

export function BezierIcon() {
  const reduce = useReducedMotion()

  return (
    <motion.svg
      width="28"
      height="36"
      viewBox="0 0 17 22"
      fill="none"
      aria-hidden
      style={{ display: 'block' }}
      animate="rest"
      whileHover={reduce ? undefined : 'hover'}
    >
      <motion.g
        variants={
          reduce
            ? undefined
            : {
                rest: { x: 0 },
                hover: {
                  x: [-0.4, 0.5, -0.2, 0],
                  transition: { duration: 0.7, ease: 'easeInOut' as const },
                },
              }
        }
      >
        <path d={nodeTopPath} fill="currentColor" />
      </motion.g>

      <motion.g
        variants={
          reduce
            ? undefined
            : {
                rest: { x: 0 },
                hover: {
                  x: [0.4, -0.55, 0.2, 0],
                  transition: { duration: 0.7, ease: 'easeInOut' as const },
                },
              }
        }
      >
        <path d={nodeBottomPath} fill="currentColor" />
      </motion.g>

      <motion.g
        variants={
          reduce
            ? undefined
            : {
                rest: { x: 0 },
                hover: {
                  x: [-0.25, 0.35, 0],
                  transition: { duration: 0.7, ease: 'easeInOut' as const },
                },
              }
        }
      >
        <path d={handleTopPath} fill="currentColor" stroke="currentColor" />
      </motion.g>

      <motion.g
        variants={
          reduce
            ? undefined
            : {
                rest: { x: 0 },
                hover: {
                  x: [0.25, -0.35, 0],
                  transition: { duration: 0.7, ease: 'easeInOut' as const },
                },
              }
        }
      >
        <path d={handleBottomPath} fill="currentColor" stroke="currentColor" />
      </motion.g>

      <motion.path
        d={curvePath}
        fill="currentColor"
        variants={
          reduce
            ? undefined
            : {
                rest: {
                  x: 0,
                  scaleX: 1,
                },
                hover: {
                  x: [-0.15, 0.15, 0],
                  scaleX: [0.985, 1.015, 1],
                  transition: { duration: 0.7, ease: 'easeInOut' as const },
                },
              }
        }
        style={{ transformOrigin: '50% 50%' }}
      />
    </motion.svg>
  )
}
