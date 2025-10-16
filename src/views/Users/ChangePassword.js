import React from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import Card from "components/Card/Card";
import CardBody from "components/Card/CardBody";
import CardHeader from "components/Card/CardHeader";

function ChangePassword() {
  const textColor = useColorModeValue("gray.700", "white");

  return (
    <Flex direction='column' pt={{ base: "120px", md: "75px" }}>
      <Card overflowX={{ sm: "scroll", xl: "hidden" }} pb='0px' maxW='600px' mx='auto'>
        <CardHeader p='6px 0px 22px 0px'>
          <Text fontSize='xl' color={textColor} fontWeight='bold'>
            Cambio de Contraseña
          </Text>
        </CardHeader>
        <CardBody>
          <Flex direction='column' w='100%'>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Contraseña Actual
              </FormLabel>
              <Input
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Ingrese su contraseña actual'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Nueva Contraseña
              </FormLabel>
              <Input
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Ingrese nueva contraseña'
                size='lg'
              />
            </FormControl>
            <FormControl mb='24px'>
              <FormLabel ms='4px' fontSize='sm' fontWeight='normal'>
                Confirmar Nueva Contraseña
              </FormLabel>
              <Input
                borderRadius='15px'
                fontSize='sm'
                type='password'
                placeholder='Confirme nueva contraseña'
                size='lg'
              />
            </FormControl>
            <Button
              variant='dark'
              fontSize='sm'
              fontWeight='bold'
              w='200px'
              h='45px'
              mb='24px'>
              CAMBIAR CONTRASEÑA
            </Button>
          </Flex>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default ChangePassword;
