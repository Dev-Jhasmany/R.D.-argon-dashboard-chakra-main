import React from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function RegisterUser() {
  const textColor = useColorModeValue("gray.700", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Registrar Usuario
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Nombre Completo
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Ingrese el nombre completo'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Email
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='email'
                  placeholder='usuario@email.com'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Contraseña
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='password'
                  placeholder='Ingrese contraseña'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Confirmar Contraseña
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='password'
                  placeholder='Confirme contraseña'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Grid templateColumns='repeat(2, 1fr)' gap={6} mb='24px'>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Rol
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='text'
                  placeholder='Administrador, Usuario, etc.'
                  size='lg'
                />
              </FormControl>
              <FormControl>
                <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                  Teléfono
                </FormLabel>
                <Input
                  borderRadius='15px'
                  fontSize='sm'
                  type='tel'
                  placeholder='Número de teléfono'
                  size='lg'
                />
              </FormControl>
            </Grid>
            <Button
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              REGISTRAR USUARIO
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default RegisterUser;
