'use client'

import React, { FC, useEffect, useState } from 'react'
import Image, { ImageProps } from 'next/image'
import { motion } from 'framer-motion'
import Modal from 'react-modal'
import { CloseIcon } from '@/components/icons/CloseIcon'

export const ImagePreview: FC<ImageProps> = (props) => {
  const [isModalOpen, setModalOpen] = useState(false)

  const openModal = () => setModalOpen(true)
  const closeModal = () => setModalOpen(false)

  useEffect(() => {
    Modal.setAppElement('body')
  }, [])

  return (
    <div>
      {/* Image with hover effect */}
      <motion.div
        initial={{ scale: 1 }} // Ensure this matches server-rendered scale
        whileHover={{ scale: 1.1 }} // Slight zoom-in on hover
        onClick={openModal} // Open modal on click
      >
        <Image
          className="cursor-pointer rounded-lg shadow-lg dark:shadow-lg dark:shadow-zinc-600"
          width="2000"
          height="1125"
          {...props}
        />
      </motion.div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 100,
          },
          content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '90%',
            height: '90%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'hidden',
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            className="rounded-lg shadow-lg"
            {...props}
            width="4000"
            height="2250"
          />
        </motion.div>
        <button
          onClick={closeModal}
          className="absolute right-2 top-2 rounded-full bg-gray-700 p-2 text-white shadow-lg hover:bg-gray-500"
        >
          <div className="flex h-6 w-6 items-center justify-center">
            <CloseIcon />
          </div>
        </button>
      </Modal>
    </div>
  )
}
