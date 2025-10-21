import React, { useState, useEffect } from "react";
// Chakra imports
import {
  Box,
  Flex,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  IconButton,
  Link,
  Switch,
  Text,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
// Assets
import signInImage from "assets/img/signInImage.png";
import { FaApple, FaFacebook, FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { useHistory, Link as RouterLink } from "react-router-dom";
import authService from "services/authService";

function SignIn() {
  // Chakra color mode
  const textColor = useColorModeValue("gray.700", "white");
  const bgForm = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("gray.700", "blue.500");
  const colorIcons = useColorModeValue("gray.700", "white");
  const bgIcons = useColorModeValue("trasnparent", "navy.700");
  const bgIconsHover = useColorModeValue("gray.50", "whiteAlpha.100");
  const toast = useToast();
  const history = useHistory();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Cargar email guardado al montar el componente
  useEffect(() => {
    const rememberedEmail = authService.getRememberedEmail();
    const isRememberMeActive = authService.isRememberMeActive();

    if (rememberedEmail && isRememberMeActive) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail
      }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const result = await authService.login(formData.email, formData.password, rememberMe);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      // Redirigir al dashboard
      history.push("/admin/dashboard");
    } else {
      toast({
        title: "Error al iniciar sesión",
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
              mb='22px'>
              Iniciar sesión
            </Text>
            {/*<HStack spacing='15px' justify='center' mb='22px'>
              <Flex
                justify='center'
                align='center'
                w='75px'
                h='75px'
                borderRadius='8px'
                border={useColorModeValue("1px solid", "0px")}
                borderColor='gray.200'
                cursor='pointer'
                transition='all .25s ease'
                bg={bgIcons}
                _hover={{ bg: bgIconsHover }}>
                <Link href='#'>
                  <Icon as={FaFacebook} color={colorIcons} w='30px' h='30px' />
                </Link>
              </Flex>
              <Flex
                justify='center'
                align='center'
                w='75px'
                h='75px'
                borderRadius='8px'
                border={useColorModeValue("1px solid", "0px")}
                borderColor='gray.200'
                cursor='pointer'
                transition='all .25s ease'
                bg={bgIcons}
                _hover={{ bg: bgIconsHover }}>
                <Link href='#'>
                  <Icon
                    as={FaApple}
                    color={colorIcons}
                    w='30px'
                    h='30px'
                    _hover={{ filter: "brightness(120%)" }}
                  />
                </Link>
              </Flex>
              <Flex
                justify='center'
                align='center'
                w='75px'
                h='75px'
                borderRadius='8px'
                border={useColorModeValue("1px solid", "0px")}
                borderColor='gray.200'
                cursor='pointer'
                transition='all .25s ease'
                bg={bgIcons}
                _hover={{ bg: bgIconsHover }}>
                <Link href='#'>
                  <Icon
                    as={FaGoogle}
                    color={colorIcons}
                    w='30px'
                    h='30px'
                    _hover={{ filter: "brightness(120%)" }}
                  />
                </Link>
              </Flex>
            </HStack>*/}
            {/*<Text
              fontSize='lg'
              color='gray.400'
              fontWeight='bold'
              textAlign='center'
              mb='22px'>
              or
            </Text>*/}
            <FormControl>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal' htmlFor='email-input'>
                Correo electrónico
              </FormLabel>
              <Input
                id='email-input'
                name="email"
                value={formData.email}
                onChange={handleChange}
                variant='auth'
                fontSize='sm'
                ms='4px'
                type='email'
                placeholder='Su dirección de correo electrónico'
                mb='24px'
                size='lg'
              />
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal' htmlFor='password-input'>
                Contraseña
              </FormLabel>
              <InputGroup size='lg' mb='24px'>
                <Input
                  id='password-input'
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                  variant='auth'
                  fontSize='sm'
                  ms='4px'
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Tu contraseña'
                />
                <InputRightElement width='3rem'>
                  <IconButton
                    h='1.75rem'
                    size='sm'
                    onClick={() => setShowPassword(!showPassword)}
                    icon={<Icon as={showPassword ? FaEyeSlash : FaEye} />}
                    variant='ghost'
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  />
                </InputRightElement>
              </InputGroup>
              <FormControl display='flex' alignItems='center' mb='24px'>
                <Switch
                  id='remember-login'
                  colorScheme='blue'
                  me='10px'
                  isChecked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <FormLabel htmlFor='remember-login' mb='0' fontWeight='normal'>
                  Acuérdate de mí
                </FormLabel>
              </FormControl>
              <Button
                onClick={handleSubmit}
                isLoading={loading}
                fontSize='10px'
                variant='dark'
                fontWeight='bold'
                w='100%'
                h='45'
                mb='24px'>
                INICIAR SESIÓN
              </Button>
            </FormControl>
            <Flex
              flexDirection='column'
              justifyContent='center'
              alignItems='center'
              maxW='100%'
              mt='0px'>
              {/* <Text color={textColor} fontWeight='medium' mb='10px'>
                Don't have an account?
                <Link
                  color={titleColor}
                  as='span'
                  ms='5px'
                  href='#/auth/signup'
                  fontWeight='bold'>
                  Sign Up
                </Link>
              </Text> */}
              <Text color={textColor} fontWeight='medium'>
                ¿Olvidaste tu contraseña?
                <Link
                  as={RouterLink}
                  to='/auth/reset-password'
                  color={titleColor}
                  ms='5px'
                  fontWeight='bold'>
                  Restablecer contraseña
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
          bgImage={signInImage}
          zIndex='1'>
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

export default SignIn;
