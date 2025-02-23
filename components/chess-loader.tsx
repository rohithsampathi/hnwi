"use client"

import type React from "react"
import { motion } from "framer-motion"

const ChessLoader: React.FC = () => {
  const pieces = ["♔", "♕", "♖", "♗", "♘", "♙"]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center"
      >
        <div className="grid grid-cols-3 gap-4">
          {pieces.map((piece, index) => (
            <motion.div
              key={index}
              className="text-4xl"
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360, 0],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
              }}
            >
              {piece}
            </motion.div>
          ))}
        </div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-200"
        >
          Fetching Playbook...
        </motion.p>
      </motion.div>
    </div>
  )
}

export default ChessLoader

