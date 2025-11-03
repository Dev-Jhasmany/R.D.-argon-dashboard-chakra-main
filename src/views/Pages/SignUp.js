// Chakra imports
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Link,
  Text,
  useColorModeValue,
  useToast,
  Select,
  Grid,
} from "@chakra-ui/react";
// Assets
import BgSignUp from "assets/img/BgSignUp.png";
import React, { useState } from "react";
import { FaApple, FaFacebook, FaGoogle } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import authService from "services/authService";

function SignUp() {
  const bgForm = useColorModeValue("white", "navy.800");
  const titleColor = useColorModeValue("gray.700", "blue.500");
  const textColor = useColorModeValue("gray.700", "white");
  const colorIcons = useColorModeValue("gray.700", "white");
  const bgIcons = useColorModeValue("trasnparent", "navy.700");
  const bgIconsHover = useColorModeValue("gray.50", "whiteAlpha.100");
  const toast = useToast();
  const history = useHistory();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    ci: "",
    full_name: "",
    full_last_name: "",
    gender: "other",
    date_of_birth: "",
    address: "",
    phone_number: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validar campos obligatorios
    if (!formData.username || !formData.email || !formData.password ||
        !formData.ci || !formData.full_name || !formData.full_last_name) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos obligatorios",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
      return;
    }

    setLoading(true);

    // Preparar datos para enviar (solo incluir opcionales si tienen valor)
    const dataToSend = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      ci: formData.ci,
      full_name: formData.full_name,
      full_last_name: formData.full_last_name,
      gender: formData.gender,
      ...(formData.date_of_birth && { date_of_birth: formData.date_of_birth }),
      ...(formData.address && { address: formData.address }),
      ...(formData.phone_number && { phone_number: formData.phone_number }),
    };

    const result = await authService.register(dataToSend);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Registro exitoso",
        description: "Su cuenta ha sido creada. Ahora puede iniciar sesión",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      history.push("/auth/signin");
    } else {
      toast({
        title: "Error al registrar",
        description: result.error,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };
  return (
    <Flex
      direction='column'
      alignSelf='center'
      justifySelf='center'
      overflow='hidden'>
      <Box
        position='absolute'
        minH={{ base: "70vh", md: "50vh" }}
        maxH={{ base: "70vh", md: "50vh" }}
        w={{ md: "calc(100vw - 50px)" }}
        maxW={{ md: "calc(100vw - 50px)" }}
        left='0'
        right='0'
        bgRepeat='no-repeat'
        overflow='hidden'
        zIndex='-1'
        top='0'
        bgImage={BgSignUp}
        bgSize='cover'
        mx={{ md: "auto" }}
        mt={{ md: "14px" }}
        borderRadius={{ base: "0px", md: "20px" }}>
        <Box w='100vw' h='100vh' bg='blue.500' opacity='0.8'></Box>
      </Box>
      <Flex
        direction='column'
        textAlign='center'
        justifyContent='center'
        align='center'
        mt='125px'
        mb='30px'>
        <Text fontSize='4xl' color='white' fontWeight='bold'>
          Welcome!
        </Text>
        <Text
          fontSize='md'
          color='white'
          fontWeight='normal'
          mt='10px'
          mb='26px'
          w={{ base: "90%", sm: "60%", lg: "40%", xl: "333px" }}>
          Use these awesome forms to login or create new account in your project
          for free.
        </Text>
      </Flex>
      <Flex alignItems='center' justifyContent='center' mb='60px' mt='20px'>
        <Flex
          direction='column'
          w='800px'
          maxW='90%'
          background='transparent'
          borderRadius='15px'
          p='40px'
          mx={{ base: "20px" }}
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
            Crear Nueva Cuenta
          </Text>
          <FormControl>
            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Username *
                </FormLabel>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Username'
                  size='lg'
                />
              </Box>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email *
                </FormLabel>
                <Input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='email'
                  placeholder='Email address'
                  size='lg'
                />
              </Box>
            </Grid>

            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  CI *
                </FormLabel>
                <Input
                  name="ci"
                  value={formData.ci}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Cédula de identidad'
                  size='lg'
                />
              </Box>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Género *
                </FormLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  size='lg'
                >
                  <option value='male'>Masculino</option>
                  <option value='female'>Femenino</option>
                  <option value='other'>Otro</option>
                </Select>
              </Box>
            </Grid>

            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombres *
                </FormLabel>
                <Input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Nombres completos'
                  size='lg'
                />
              </Box>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Apellidos *
                </FormLabel>
                <Input
                  name="full_last_name"
                  value={formData.full_last_name}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Apellidos completos'
                  size='lg'
                />
              </Box>
            </Grid>

            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Contraseña *
                </FormLabel>
                <Input
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='password'
                  placeholder='Mínimo 6 caracteres'
                  size='lg'
                />
              </Box>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Teléfono (Opcional)
                </FormLabel>
                <Input
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='tel'
                  placeholder='+591 77777777'
                  size='lg'
                />
              </Box>
            </Grid>

            <Grid templateColumns='repeat(2, 1fr)' gap={4} mb='20px'>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Fecha de Nacimiento (Opcional)
                </FormLabel>
                <Input
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='date'
                  size='lg'
                />
              </Box>
              <Box>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Dirección (Opcional)
                </FormLabel>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  variant='auth'
                  fontSize='sm'
                  type='text'
                  placeholder='Dirección completa'
                  size='lg'
                />
              </Box>
            </Grid>

            <Button
              onClick={handleSubmit}
              isLoading={loading}
              fontSize='10px'
              variant='dark'
              fontWeight='bold'
              w='100%'
              h='45'
              mb='24px'
              mt='10px'>
              REGISTRARSE
            </Button>
          </FormControl>
          <Flex
            flexDirection='column'
            justifyContent='center'
            alignItems='center'
            maxW='100%'
            mt='0px'>
            <Text color={textColor} fontWeight='medium'>
              Already have an account?
              <Link
                color={titleColor}
                as='span'
                ms='5px'
                href='#/auth/signin'
                fontWeight='bold'>
                Sign In
              </Link>
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}

export default SignUp;
