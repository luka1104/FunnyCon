import React, { useState, useEffect, useContext, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Box, Center, Button, Icon, Modal, ModalOverlay, ModalContent, ModalBody, Text } from '@chakra-ui/react'
import { BsFacebook, BsTelegram } from 'react-icons/bs'
import { AiFillTwitterCircle } from 'react-icons/ai'
import { AccountContext } from 'contexts/account'
import { calcTime } from 'utils'
import { useRouter } from 'next/router'
import PacmanLoader from "react-spinners/PacmanLoader"
import axios from 'axios'
import { Theme, Answer } from 'interfaces'
import { getStorageFileURL } from 'supabase/storage'

interface Props {
  theme: Theme
  answer: Answer
  setSelectedAnswer: Function
}

const ViewResult: React.FC<Props> = ({ theme, answer, setSelectedAnswer }) => {
  const router = useRouter()
  const finalRef = useRef(null)
  const { user } = useContext(AccountContext)
  const [loading, setLoading] = useState<boolean>(false)
  const [imagePath, setImagePath] = useState<string>('')
  const [date, setDate] = useState<Date>()

  const handleRenderImage = useCallback(async () => {
    if (!theme.imagePath) return;
    const path = await getStorageFileURL({
      bucketName: "themeimage",
      pathName: theme.imagePath,
    });
    if (!path) return;
    setImagePath(path);
  }, []);

  const checkResult = async () => {
    if(answer.place) return
    setLoading(true)
    const config = {
      headers: {
        'Content-Type': 'application/json',
      }
    }
    return new Promise((resolve, reject) => {
      axios.post('/api/collectResult', theme.id, config)
      .then(response => {
        if(response.status !== 200) throw Error("Server error")
        resolve(response)
        setLoading(false)
      })
      .catch(e => {
        reject(e);
        throw Error("Server error:" + e)
      })
    })
  }

  useEffect(() => {
    if(theme.type === 2) return
    handleRenderImage()
  }, [theme])

  useEffect(() => {
    checkResult()
    const deadlineDate = new Date(theme.deadline)
    setDate(deadlineDate)
  }, [answer])

  return (
    <>
      <Box ref={finalRef}>
        <Modal finalFocusRef={finalRef} isOpen={loading} onClose={() => {setLoading(false)}}>
          <ModalOverlay backdropFilter='blur(5px)' />
          <ModalContent bg='white' border='1px solid black' w='90%' h='350px' borderRadius='0' top='100px'>
            <ModalBody paddingInline='0'>
              <Box mt='20px'>
                <Text color='black' textAlign='center' fontWeight='bold' fontSize='25px'>
                  ZBTNを用意しています！
                </Text>
                <Center w='80%' mt='40px' mb='40px'>
                  <PacmanLoader
                    color='#F345BE'
                    loading={loading}
                    // cssOverride={override}
                    size={50}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </Center>
                <Center>
                  <Button
                    mt='50px'
                    color='black'
                    bg='white'
                    border='1px solid black'
                    borderRadius='30px'
                    w='90%'
                    h='60px'
                    fontSize='xl'
                    mb='30px'
                    onClick={() => {setLoading(false)}}
                  >
                    閉じる
                  </Button>
                </Center>
              </Box>
              <Center mt='60px' gap='10'>

              </Center>
            </ModalBody>
          </ModalContent>
        </Modal>
        <Box pt='20px'>
          {theme.type === 1 ? (
            <>
              <Box w={window.innerWidth} h={window.innerWidth} bg='white' border='2px solid black'>
                <Center w='100%' h='100%' position='relative'>
                  <Image
                    src={imagePath}
                    alt="preview"
                    fill={true}
                    style={{objectFit: "contain"}}
                  />
                </Center>
              </Box>
            </>
          ) : theme.type === 2 ? (
            <>
              <Box w={window.innerWidth} h={window.innerWidth} bg='white' border='2px solid black' >
                <Center w='100%' h='100%' fontWeight='bold' fontSize='30px' textAlign='center' color='black'>
                  {theme.contents}
                </Center>
              </Box>
            </>
          ) : (
            <>
              <Box position='relative' w={window.innerWidth} h={window.innerWidth} bg='white' border='2px solid black'>
                <Center>
                  <Image
                    src={imagePath}
                    alt="preview"
                    width={window.innerWidth * 0.8}
                    height={window.innerWidth * 0.8}
                  />
                </Center>
                <Box
                  w='100%'
                  h='100%'
                  p='5%'
                  color='black'
                  fontWeight='bold'
                  fontSize='19px'
                  textAlign='center'
                  position='absolute'
                >
                  {theme.contents}
                </Box>
              </Box>
            </>
          )}
        </Box>
        <Text
          mt='10px'
          w={window.innerWidth}
          h='80px'
          color='black'
          borderRadius='0'
          fontSize='30px'
          textAlign='center'
          fontWeight='bold'
        >
          {answer.contents}
        </Text>
        <Center color='black' mt='5px' fontWeight='bold' fontSize='12px'>
          {answer.place}位｜ {`${date?.getFullYear()}.${date?.getMonth()}.${date?.getDay()}`}
        </Center>
        <Center color='black' mt='20px' fontWeight='bold' fontSize='25px'>
          Let&apos;s Share!
        </Center>
        <Center gap='2'>
          <Icon as={BsFacebook} fontSize='40px' color='#1977F2' />
          <Icon as={AiFillTwitterCircle} fontSize='46px' color='#1C9BF0' />
          <Icon as={BsTelegram} fontSize='40px' color='#26A4E2' />
        </Center>
        <Center pt='20px' gap='5'>
          <Button w='45%' h='60px' fontSize='20px' color='black' bg='#F5F5F5' border='1px solid black' borderRadius='30px' onClick={() => {setSelectedAnswer()}}>
            戻る
          </Button>
          <Button w='45%' h='60px' fontSize='20px' color='black' bg='#F5F5F5' border='1px solid black' borderRadius='30px'>
            {/* 発行処理 */}
            NFTを発行する
          </Button>
        </Center>
      </Box>
    </>
  )
}

export default ViewResult
