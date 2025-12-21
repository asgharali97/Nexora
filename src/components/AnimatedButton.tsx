'use client';
import { IconArrowRight, IconChevronRight } from '@tabler/icons-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

const AnimatedButton = ({ title }: { title: string;}) => {
  const buttonVaritent = {
    initial: {
      opacity: 0,
      filter: 'blur(10px)'
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)'
    },
    transition: {
      delay: 0.3,
      ease: 'easeInOut'
    },
    hover: {}
  };

  const childVaritent = {
    initial: { width: '3rem' },
    hover: {
      width: '100%',
      transition: {
        delay: 0.3,
        ease: 'easeInOut'
      }
    }
  };
  const chevronVariants = {
    initial: { opacity: 1, filter: 'blur(5px)' },
    animate: {
      filter: 'blur(0px)'
    },
    hover: {
      opacity: 0,
      x: -10,
      transition: { duration: 0.1, ease: 'easeInOut' }
    }
  };
  const arrowVariants = {
    initial: { opacity: 0, filter: 'blur(2px)' },
    hover: {
      opacity: 1,
      filter: 'blur(0px)',
      x: 10,
      transition: { duration: 0.2, delay: 0.3, ease: 'easeOut' }
    }
  };
  const ArrowVariants = motion(IconArrowRight);
  const ChevronVariants = motion(IconChevronRight);

  const textVariant = {
    initial: { color: '#0f090b' },
    hover: {
      color: '#ffffff',
      transition: {
        duration: 0.2,
        delay: 0.28,
        ease: 'easeInOut'
      }
    }
  };
  return (
    <>
      <div>
        <motion.button
          variants={buttonVaritent}
          initial="initial"
          animate="animate"
          transition="transition"
          whileHover="hover"
          className="text-foreground shadow-s relative flex w-48 cursor-pointer gap-2 rounded-full border border-neutral-200 text-lg font-medium"
        >
          <motion.span
            variants={childVaritent}
            className={cn(
              'bg-primary text-popover relative flex h-12 w-12 items-center overflow-hidden rounded-full'
            )}
          >
            <div className="pointer-events-none absolute top-3 left-3 -translate-y-1/2">
              <div className="absolute">
                <ChevronVariants variants={chevronVariants} className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute">
              <ArrowVariants variants={arrowVariants} className="h-6 w-6" />
            </div>
          </motion.span>
          <motion.span
            variants={textVariant}
            className="absolute top-0 right-0 bottom-0 left-8 py-2"
          >
            {title}
          </motion.span>
        </motion.button>
      </div>
    </>
  );
};

export default AnimatedButton;
