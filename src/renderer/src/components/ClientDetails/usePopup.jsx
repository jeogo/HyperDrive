import { useState } from 'react'

export const usePopup = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupContent, setPopupContent] = useState(null)

  const openPopup = (content) => {
    setPopupContent(content)
    setIsPopupOpen(true)
  }

  const closePopup = () => {
    setPopupContent(null)
    setIsPopupOpen(false)
  }

  return {
    isPopupOpen,
    popupContent,
    openPopup,
    closePopup
  }
}
