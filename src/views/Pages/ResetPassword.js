import React, { useState } from "react";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Input,
  Link,
  Text,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertDescription,
} from "@chakra-ui/react";
// Assets
import signInImage from "assets/img/signInImage.png";
import { useHistory, useLocation, Link as RouterLink } from "react-router-dom";
import authService from "services/authService";

function ResetPassword() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("gray.700", "blue.500");
  const toast = useToast();
  const history = useHistory();
  const location = useLocation();

  // Detectar si hay un token en la URL (para paso 2)
  const urlParams = new URLSearchParams(location.search);
  const tokenFromUrl = urlParams.get('token');

  const [step, setStep] = useState(tokenFromUrl ? 2 : 1); // Paso 1: solicitar token, Paso 2: restablecer contraseña
  const [email, setEmail] = useState("");
  const [token, setToken] = useState(tokenFromUrl || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");

  // Paso 1: Solicitar token de restablecimiento
  const handleRequestReset = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingrese su correo electrónico",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const result = await authService.forgotPassword(email);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo con las instrucciones para restablecer su contraseña",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Mostrar el token en la interfaz (solo para desarrollo/pruebas)
      if (result.data?.token) {
        setResetToken(result.data.token);
        setToken(result.data.token);
      }

      // Cambiar al paso 2
      setStep(2);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Paso 2: Restablecer contraseña con token
  const handleResetPassword = async () => {
    if (!token || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const result = await authService.resetPassword(token, newPassword);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Contraseña restablecida",
        description: "Su contraseña ha sido actualizada correctamente. Ahora puede iniciar sesión",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      // Redirigir al login
      setTimeout(() => {
        history.push("/auth/signin");
      }, 2000);
    } else {
      toast({
        title: "Error",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Flex position='relative' mb='40px'>
      <Flex
        minH={{ md: "1000px" }}
        h={{ sm: "initial", md: "75vh", lg: "85vh" }}
        w='100%'
        maxW='1044px'
        mx='auto'
        justifyContent='space-between'
        mb='30px'
        pt={{ md: "0px" }}>
        <Flex
          w='100%'
          h='100%'
          alignItems='center'
          justifyContent='center'
          mb='60px'
          mt={{ base: "50px", md: "20px" }}>
          <Flex
            zIndex='2'
            direction='column'
            w='445px'
            background='transparent'
            borderRadius='15px'
            p='40px'
            mx={{ base: "100px" }}
            m={{ base: "20px", md: "auto" }}
            bg={bgForm}
            boxShadow={useColorModeValue(
              "0px 5px 14px rgba(0, 0, 0, 0.05)",
              "unset"
            )}>
            <Text
              fontSize='xl'
              color={textColor}
              fontWeight='bold'
              textAlign='center'
              mb='16px'>
              {step === 1 ? 'Restablecer Contraseña' : 'Nueva Contraseña'}
            </Text>
            <Text
              fontSize='sm'
              color='gray.400'
              fontWeight='normal'
              textAlign='center'
              mb='22px'>
              {step === 1
                ? 'Ingrese su correo electrónico y le enviaremos instrucciones para restablecer su contraseña.'
                : 'Ingrese su nueva contraseña.'
              }
            </Text>

            {/* Mostrar token en desarrollo (solo para pruebas) */}
            {resetToken && step === 2 && (
              <Alert status='info' mb='20px' borderRadius='8px'>
                <AlertIcon />
                <AlertDescription fontSize='xs'>
                  Token de prueba: {resetToken.substring(0, 20)}...
                </AlertDescription>
              </Alert>
            )}

            {step === 1 ? (
              // Paso 1: Solicitar token
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Correo electrónico
                </FormLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant='auth'
                  fontSize='sm'
                  ms='4px'
                  type='email'
                  placeholder='Su dirección de correo electrónico'
                  mb='24px'
                  size='lg'
                />
                <Button
                  onClick={handleRequestReset}
                  isLoading={loading}
                  fontSize='10px'
                  variant='dark'
                  fontWeight='bold'
                  w='100%'
                  h='45'
                  mb='24px'>
                  ENVIAR LINK DE RESTABLECIMIENTO
                </Button>
              </FormControl>
            ) : (
              // Paso 2: Restablecer contraseña
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Token de Restablecimiento
                </FormLabel>
                <Input
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  variant='auth'
                  fontSize='sm'
                  ms='4px'
                  type='text'
                  placeholder='Token recibido por email'
                  mb='24px'
                  size='lg'
                />
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nueva Contraseña
                </FormLabel>
                <Input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant='auth'
                  fontSize='sm'
                  ms='4px'
                  type='password'
                  placeholder='Mínimo 6 caracteres'
                  mb='24px'
                  size='lg'
                />
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Confirmar Nueva Contraseña
                </FormLabel>
                <Input
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleResetPassword()}
                  variant='auth'
                  fontSize='sm'
                  ms='4px'
                  type='password'
                  placeholder='Confirme su nueva contraseña'
                  mb='24px'
                  size='lg'
                />
                <Button
                  onClick={handleResetPassword}
                  isLoading={loading}
                  fontSize='10px'
                  variant='dark'
                  fontWeight='bold'
                  w='100%'
                  h='45'
                  mb='24px'>
                  RESTABLECER CONTRASEÑA
                </Button>
                <Button
                  onClick={() => setStep(1)}
                  fontSize='10px'
                  variant='outline'
                  fontWeight='normal'
                  w='100%'
                  h='35'
                  mb='24px'>
                  Volver al paso anterior
                </Button>
              </FormControl>
            )}
            <Flex
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              maxW='100%'
              mt='0px'>
              <Text color={textColor} fontWeight='medium'>
                ¿Recuerdas tu contraseña?
                <Link
                  as={RouterLink}
                  to='/auth/signin'
                  color={titleColor}
                  ms='5px'
                  fontWeight='bold'>
                  Iniciar sesión
                </Link>
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box
          overflowX='hidden'
          h='100%'
          w='100%'
          left='0px'
          position='absolute'
          bgImage={signInImage}>
          <Box
            w='100%'
            h='100%'
            bgSize='cover'
            bg='blue.500'
            opacity='0.8'></Box>
        </Box>
      </Flex>
    </Flex>
  );
}

export default ResetPassword;
